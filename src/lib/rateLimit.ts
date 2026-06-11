import { sql } from "@vercel/postgres";
import { after } from "next/server";
import { sendErrorAlert } from "./errorAlert";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 30;
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000;

function isRateLimitEnabled(): boolean {
  // Explicit kill switch, e.g. for Vercel preview deployments
  // (where NODE_ENV is still "production")
  if (process.env.DISABLE_UPLOAD_RATE_LIMIT === "true") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

let tableReady: Promise<void> | undefined;

async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS upload_attempt (
      ip_address TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS upload_attempt_ip_created_at_idx
    ON upload_attempt (ip_address, created_at)
  `;
}

function ensureTable() {
  // Reset on failure so a transient DB error doesn't poison every
  // future request in this server instance
  tableReady ??= createTable().catch((error) => {
    tableReady = undefined;
    throw error;
  });
  return tableReady;
}

/**
 * Sliding-window rate limit on upload attempts per IP, backed by Postgres
 * so the limit holds across serverless instances. Attempts are counted
 * whether or not the upload is accepted — rejected uploads still cost
 * OpenAI credits.
 */
export async function isUploadRateLimited(
  ipAddress: string
): Promise<boolean> {
  if (!isRateLimitEnabled()) {
    return false;
  }

  try {
    await ensureTable();

    const cleanupCutoff = new Date(
      Date.now() - CLEANUP_AFTER_MS
    ).toISOString();
    await sql`DELETE FROM upload_attempt WHERE created_at < ${cleanupCutoff}`;

    // Count and insert in one statement so concurrent requests can't all
    // pass the check before any of their inserts land
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
    const { rowCount } = await sql`
      WITH recent AS (
        SELECT COUNT(*)::int AS attempts
        FROM upload_attempt
        WHERE ip_address = ${ipAddress} AND created_at > ${windowStart}
      )
      INSERT INTO upload_attempt (ip_address)
      SELECT ${ipAddress} FROM recent
      WHERE attempts < ${MAX_UPLOADS_PER_WINDOW}
      RETURNING 1
    `;

    return rowCount === 0;
  } catch (error) {
    // Fail open: a rate-limiter outage shouldn't take down uploads
    console.error("rate limit check failed, allowing upload: ", error);
    after(() => sendErrorAlert("rate limiter", error));
    return false;
  }
}
