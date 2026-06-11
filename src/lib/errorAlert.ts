const THROTTLE_MS = 15 * 60 * 1000;

// In-memory throttle: persists per warm serverless instance only, so this is
// best-effort — a burst of errors may still send one email per instance.
const lastSentByKey = new Map<string, number>();

export async function sendErrorAlert(
  context: string,
  error: unknown
): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const alertEmail = process.env.ALERT_EMAIL;

    if (!apiKey || !alertEmail) {
      console.warn(
        "error alert skipped: RESEND_API_KEY and/or ALERT_EMAIL not set"
      );
      return;
    }

    const now = Date.now();
    const lastSent = lastSentByKey.get(context);
    if (lastSent && now - lastSent < THROTTLE_MS) {
      return;
    }
    lastSentByKey.set(context, now);

    const details = getErrorDetails(error);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OnlyCats Alerts <onboarding@resend.dev>",
        to: [alertEmail],
        subject: `🚨 OnlyCats error: ${context}`,
        text: [
          `An error occurred during ${context}.`,
          "",
          `Time: ${new Date().toISOString()}`,
          ...details,
          "",
          `Alerts for "${context}" are throttled to one per ${
            THROTTLE_MS / 60000
          } minutes per server instance.`,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      // Roll back the throttle so the next error retries the send
      lastSentByKey.delete(context);
      console.error(
        "failed to send error alert email: ",
        response.status,
        await response.text()
      );
    }
  } catch (alertError) {
    // Alerting must never break the request that triggered it
    lastSentByKey.delete(context);
    console.error("failed to send error alert email: ", alertError);
  }
}

function getErrorDetails(error: unknown): string[] {
  if (!(error instanceof Error)) {
    return [`Error: ${String(error)}`];
  }

  const details = [`Message: ${error.message}`];

  // OpenAI APIError fields, when present (e.g. status 429, code insufficient_quota)
  const { status, code, requestID } = error as {
    status?: number;
    code?: string | null;
    requestID?: string;
  };
  if (status !== undefined) details.push(`Status: ${status}`);
  if (code) details.push(`Code: ${code}`);
  if (requestID) details.push(`Request ID: ${requestID}`);

  return details;
}
