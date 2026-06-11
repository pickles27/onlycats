# OnlyCats 🐱

Only cats allowed. A photo feed where visitors upload cat pictures, an AI
pipeline checks that they're actually cats (and family-friendly), writes a
witty caption, and everyone can like their favorites.

Live on Vercel.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React, Tailwind CSS
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) for posts and likes
- [Google Cloud Storage](https://cloud.google.com/storage) for images
- [OpenAI](https://platform.openai.com/) for image moderation, cat detection, and captions
- [Resend](https://resend.com/) for error alert emails

## Getting started

Requires Node 22 (`nvm use`) and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a `.env` with credentials — see `.claude/skills/onlycats-dev/SKILL.md`
for the full list of required variables and what each one is for.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |

## How an upload works

Client-side compression → `POST /api/upload` → OpenAI moderation +
cat detection/captioning → resized JPEG stored in GCS → post saved to
Postgres. Non-cats are politely rejected. 🤨
