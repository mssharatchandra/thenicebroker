import { timingSafeEqual } from "node:crypto";
import { env } from "../env";

/**
 * Constant-time check that the inbound request carries the shared webhook
 * secret. We accept the secret in either of two headers (depending on how
 * the Bolna dashboard surfaces the field today) and fall back to a single
 * `Authorization: Bearer <secret>` form for flexibility.
 */
export function verifyWebhookSecret(req: Request): boolean {
  const expected = env.BOLNA_WEBHOOK_SECRET;
  const url = new URL(req.url);
  const candidates = [
    req.headers.get("x-webhook-secret"),
    req.headers.get("x-bolna-webhook-secret"),
    stripBearer(req.headers.get("authorization")),
    url.searchParams.get("secret"),
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  for (const got of candidates) {
    if (constantTimeEq(got, expected)) return true;
  }
  return false;
}

function stripBearer(v: string | null): string | null {
  if (!v) return null;
  const m = v.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

function constantTimeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
