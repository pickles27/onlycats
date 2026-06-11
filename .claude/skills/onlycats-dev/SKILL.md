---
name: onlycats-dev
description: Run, verify, and navigate the OnlyCats app — dev server setup, required env vars, the upload/validation pipeline, API routes, and gotchas. Use when running the app, debugging uploads or posts, touching API routes, or verifying a change works.
---

# OnlyCats development guide

OnlyCats is a cat photo feed: visitors upload cat pictures, an AI pipeline
moderates them and writes a caption, and everyone can like posts. Next.js
(App Router) + React 19, Tailwind v4 with a little MUI, deployed on Vercel.

## Run

```bash
pnpm install
pnpm dev        # Next dev server on http://localhost:3000
```

- Package manager is **pnpm** (`pnpm-lock.yaml`). Node pinned to 22.21.0 in
  `.nvmrc`/`engines` — run `nvm use` if the installed Node differs.
- Checks: `pnpm lint`, `pnpm build`, `npx tsc --noEmit`. There is **no test
  suite**.
- No browser automation tooling is installed here (no chromium-cli or
  Playwright). To verify UI changes, run `pnpm dev` and ask the user to look,
  or get their OK before installing browser tooling.

## Env vars

Secrets live in `.env` with overrides in `.env.development.local` (both
gitignored — never print values). Required:

| Var | Used by |
|---|---|
| `OPENAI_API_KEY` | `src/lib/imageValidation.ts` — moderation + cat detection |
| `POSTGRES_*` | `@vercel/postgres` (`api/posts`, `api/upload`, `api/like/post`) |
| `GOOGLE_CLOUD_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` / `_BUCKET_NAME` | GCS image storage (`api/upload`) |
| `NEXT_PUBLIC_API_URL` | Base URL for the client-side posts fetch — see gotchas |
| `RESEND_API_KEY` + `ALERT_EMAIL` | error alert emails (`src/lib/errorAlert.ts`) |

In production these are set in Vercel project settings, not files.

**Careful:** dev `.env` may point at the *production* Postgres DB and GCS
bucket. Before any destructive DB/bucket operation, confirm with the user
which environment the credentials target.

## Upload pipeline (the core flow)

1. `UploadButton.tsx` compresses client-side (`browser-image-compression`,
   max 5MB) and POSTs FormData to `/api/upload`. The route rate-limits to
   30 attempts/hour per IP (`src/lib/rateLimit.ts`, Postgres-backed via a
   self-creating `upload_attempt` table). The limit only runs when
   `NODE_ENV` is `production` — so never in `pnpm dev` — and can be
   disabled anywhere (e.g. Vercel preview deployments) by setting
   `DISABLE_UPLOAD_RATE_LIMIT=true`.
2. `api/upload` calls `validateImage()` from `src/lib/imageValidation.ts`,
   which downscales to 768px (cuts vision-token cost), then calls OpenAI
   twice: `omni-moderation-latest` (flag check), then `gpt-4.1-mini`
   (accept/reject + witty caption, strict JSON schema; rejection rules live
   in the `instructions` prompt). OpenAI failures email an alert via
   `src/lib/errorAlert.ts` (Resend, throttled to 1/15min per error type,
   sent via Next's `after()`).
3. Back in `api/upload`: sharp converts to 1024px JPEG → GCS at
   `cats/<uuid>` → 10x10 blur placeholder generated → row inserted into
   Postgres `Post` table (`post_id, created_at, image_url, likes, caption,
   blur_data_url, ip_address`).

**Every real upload costs OpenAI API credits and writes to the real bucket
and DB** — don't loop uploads as a smoke test. A cheap smoke test is
`curl 'http://localhost:3000/api/posts?page=1&limit=2'`.

## Other routes & frontend map

- `GET /api/posts?page=&limit=` — paginated feed, newest first.
- `POST /api/like/post` — `{ postId }`, increments likes.
- `src/app/hooks/useInfinitePosts.tsx` — SWR infinite scroll (page size 18);
  `Posts.tsx` triggers next page via IntersectionObserver.
- `Header.tsx` (fixed, contains `UploadButton`), `Post.tsx`/`PostLikes.tsx`
  (like state mirrored in localStorage), `PostSkeleton` (MUI Skeleton).

## Gotchas

- `NEXT_PUBLIC_API_URL` must match the origin you're running on
  (`http://localhost:3000` in dev) — `useInfinitePosts` uses it to build
  the posts URL.
- `GOOGLE_CLOUD_PRIVATE_KEY` stores literal `\n` sequences; `api/upload`
  converts them to real newlines at startup.
- 429s from OpenAI with no `x-ratelimit-*` headers usually mean an exhausted
  credit balance (billing), not rate limiting.
- `reactStrictMode` is intentionally `false` in `next.config.mjs`.
- `api/upload` has a Vercel `maxDuration` cap of 30s, which includes the
  OpenAI validation calls.
