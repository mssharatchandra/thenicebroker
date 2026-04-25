import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyWebhookSecret } from "@/lib/bolna/auth";
import { bolnaEvent } from "@/lib/bolna/types";
import { agentEvents, calls, getDb, isDbConfigured } from "@/lib/db";
import { log } from "@/lib/logger";

/**
 * Inbound webhook from Bolna. Receives call lifecycle events (call.started,
 * call.ended, transcript.updated, plus anything else).
 *
 * Strategy:
 *  1. Verify the shared webhook secret.
 *  2. Append the raw payload to agent_events (cheap insurance).
 *  3. Best-effort update of the calls row for known event types.
 *
 * If DATABASE_URL is missing, we log + 503 — the agent will retry, and the
 * dashboard will surface the gap.
 */
export async function POST(req: Request) {
  if (!verifyWebhookSecret(req)) {
    log.warn("bolna webhook: unauthorized", {});
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "invalid_json", detail: String(err) },
      { status: 400 },
    );
  }

  const parsed = bolnaEvent.safeParse(raw);
  if (!parsed.success) {
    log.warn("bolna webhook: payload did not match any known shape", {
      issues: parsed.error.issues,
    });
    // Still 200 so Bolna doesn't retry; we logged the raw payload below.
  }

  const event = parsed.success ? parsed.data : { event: "unknown", ...(typeof raw === "object" && raw !== null ? raw : {}) };
  const eventType = (event as { event: string }).event;
  const callId = (event as { call_id?: string }).call_id;

  log.info("bolna webhook received", { eventType, callId });

  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "database_not_configured" },
      { status: 503 },
    );
  }

  const db = getDb();

  // 1. Append the raw payload.
  await db.insert(agentEvents).values({
    callId: callId ?? null,
    eventType,
    payload: raw as object,
  });

  // 2. Best-effort call lifecycle updates.
  if (callId) {
    if (eventType === "call.started" || eventType === "call_started") {
      const e = event as Record<string, unknown>;
      await db
        .insert(calls)
        .values({
          bolnaCallId: callId,
          status: "in_progress",
          phoneNumber: typeof e.from_phone === "string" ? e.from_phone : null,
        })
        .onConflictDoNothing({ target: calls.bolnaCallId });
    } else if (eventType === "call.ended" || eventType === "call_ended") {
      const e = event as Record<string, unknown>;
      await db
        .update(calls)
        .set({
          status: "completed",
          endedAt: new Date(),
          durationSec: typeof e.duration_sec === "number" ? e.duration_sec : null,
          costPaise:
            typeof e.cost_paise === "number"
              ? e.cost_paise
              : typeof e.cost_inr === "number"
                ? Math.round(e.cost_inr * 100)
                : null,
          recordingUrl: typeof e.recording_url === "string" ? e.recording_url : null,
          transcriptJson: Array.isArray(e.transcript) ? (e.transcript as object) : null,
          updatedAt: new Date(),
        })
        .where(eq(calls.bolnaCallId, callId));
    } else if (eventType === "transcript.updated" || eventType === "transcript_updated") {
      const e = event as Record<string, unknown>;
      if (Array.isArray(e.transcript)) {
        await db
          .update(calls)
          .set({ transcriptJson: e.transcript as object, updatedAt: new Date() })
          .where(eq(calls.bolnaCallId, callId));
      }
    }
  }

  return NextResponse.json({ ok: true });
}
