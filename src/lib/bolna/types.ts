import { z } from "zod";

/**
 * Permissive schemas for Bolna webhook events.
 *
 * The shape is intentionally lenient — every payload also gets stored
 * verbatim in the `agent_events` table so we can tighten these schemas
 * after observing real traffic without losing data.
 */

const transcriptTurn = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]).or(z.string()),
  content: z.string().optional(),
  text: z.string().optional(),
  ts: z.union([z.string(), z.number()]).optional(),
});

export const callStartedEvent = z.object({
  event: z.literal("call.started").or(z.literal("call_started")),
  call_id: z.string(),
  agent_id: z.string().optional(),
  from_phone: z.string().optional(),
  to_phone: z.string().optional(),
  started_at: z.string().optional(),
});

export const callEndedEvent = z.object({
  event: z.literal("call.ended").or(z.literal("call_ended")),
  call_id: z.string(),
  ended_at: z.string().optional(),
  duration_sec: z.number().optional(),
  cost_paise: z.number().optional(),
  cost_inr: z.number().optional(),
  recording_url: z.string().url().optional(),
  transcript: z.array(transcriptTurn).optional(),
});

export const transcriptUpdatedEvent = z.object({
  event: z.literal("transcript.updated").or(z.literal("transcript_updated")),
  call_id: z.string(),
  transcript: z.array(transcriptTurn),
});

/** Tagged union of all known events, plus a fallthrough catch-all. */
export const bolnaEvent = z.union([
  callStartedEvent,
  callEndedEvent,
  transcriptUpdatedEvent,
  z.object({
    event: z.string(),
    call_id: z.string().optional(),
  }).passthrough(),
]);

export type BolnaEvent = z.infer<typeof bolnaEvent>;
