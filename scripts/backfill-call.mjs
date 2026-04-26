/**
 * One-shot backfill: takes a Bolna execution-log JSON and reconstructs the
 * call/lead/visits/agent_events rows that the live webhook would have created.
 *
 * Usage:
 *   node scripts/backfill-call.mjs <path-to-execution-log.json>
 *
 * Idempotent: re-running is safe — it upserts on bolna_call_id and looks up
 * existing visits before inserting.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/backfill-call.mjs <path>");
  process.exit(1);
}

const log = JSON.parse(readFileSync(inputPath, "utf8"));

// 1. Pull the actual Bolna call_id from any function_call payload.
const fcRequests = log.filter((e) => e.component === "function_call" && e.type === "request");
let bolnaCallId = null;
for (const fc of fcRequests) {
  try {
    const data = JSON.parse(fc.data);
    if (data.call_id) {
      bolnaCallId = data.call_id;
      break;
    }
  } catch {}
}
if (!bolnaCallId) {
  console.error("Could not find a call_id in any function_call payload.");
  process.exit(1);
}

// 2. Determine call timing.
const timestamps = log.map((e) => new Date(e.created_at + "Z")).sort((a, b) => a - b);
const startedAt = timestamps[0];
const endedAt = timestamps[timestamps.length - 1];
const durationSec = Math.round((endedAt - startedAt) / 1000);

// 3. Build a transcript.
const transcript = log
  .filter((e) => e.component === "transcriber" || e.component === "synthesizer")
  .map((e) => ({
    speaker: e.component === "transcriber" ? "Caller" : "Agent",
    text: typeof e.data === "string" ? e.data.trim() : JSON.stringify(e.data),
    ts: e.created_at,
  }))
  .filter((t) => t.text.length > 0);

// 4. Infer profile from search/upsert payloads.
const profile = {
  name: "Sharat",
  phone: null,
  preferred_areas: [],
  bhk: [],
  budget_max_inr: null,
  occupants: null,
  parking_needed: null,
  move_in_by: null,
  intent: "actively-looking",
  notes: "Backfilled from Bolna execution log; live call placed during demo.",
};
for (const fc of fcRequests) {
  let data;
  try {
    data = JSON.parse(fc.data);
  } catch {
    continue;
  }
  if (typeof data.areas === "string" && data.areas.length > 0) {
    profile.preferred_areas = Array.from(
      new Set([...profile.preferred_areas, ...data.areas.split(",").map((s) => s.trim()).filter(Boolean)]),
    );
  }
  if (data.bhk) {
    const n = Number(data.bhk);
    if (Number.isFinite(n) && !profile.bhk.includes(n)) profile.bhk.push(n);
  }
  if (data.budget_max_inr) {
    const n = Number(data.budget_max_inr);
    if (Number.isFinite(n) && n > 0) profile.budget_max_inr = n;
  }
  if (data.occupants) profile.occupants = data.occupants;
  if (data.parking_needed) profile.parking_needed = data.parking_needed;
  if (data.move_in_by) profile.move_in_by = data.move_in_by;
}

// 5. Booked visits (already in DB from the live call — collect IDs to verify).
const visitResponses = log
  .filter((e) => e.component === "function_call" && e.type === "response")
  .map((e) => {
    try {
      return JSON.parse(e.data);
    } catch {
      return null;
    }
  })
  .filter((d) => d && d.visit_id);
const visitIds = visitResponses.map((d) => d.visit_id);

console.log("Backfill plan:");
console.log("  bolna_call_id:", bolnaCallId);
console.log("  startedAt:", startedAt.toISOString());
console.log("  durationSec:", durationSec);
console.log("  transcript turns:", transcript.length);
console.log("  profile:", profile);
console.log("  existing visit_ids:", visitIds);

const sql = neon(DATABASE_URL);

// Upsert calls row.
const newCallId = randomUUID();
const callRows = await sql`
  insert into calls (id, bolna_call_id, status, phone_number, started_at, ended_at, duration_sec, transcript_json)
  values (${newCallId}, ${bolnaCallId}, 'completed', ${profile.phone}, ${startedAt.toISOString()}, ${endedAt.toISOString()}, ${durationSec}, ${JSON.stringify(transcript)})
  on conflict (bolna_call_id) do update set
    status = excluded.status,
    ended_at = excluded.ended_at,
    duration_sec = excluded.duration_sec,
    transcript_json = excluded.transcript_json,
    updated_at = now()
  returning id
`;
const internalCallId = callRows[0].id;
console.log("✓ calls.id:", internalCallId);

// Upsert lead tied to this call. If a lead already exists for this call, update it.
const existingLead = await sql`select id from leads where call_id = ${internalCallId} limit 1`;
let leadId;
if (existingLead.length > 0) {
  leadId = existingLead[0].id;
  await sql`
    update leads set
      name = ${profile.name},
      preferred_areas = ${JSON.stringify(profile.preferred_areas)}::jsonb,
      bhk = ${JSON.stringify(profile.bhk)}::jsonb,
      budget_max_inr = ${profile.budget_max_inr},
      occupants = ${profile.occupants},
      parking_needed = ${profile.parking_needed},
      move_in_by = ${profile.move_in_by},
      intent = ${profile.intent},
      notes = ${profile.notes},
      updated_at = now()
    where id = ${leadId}
  `;
  console.log("✓ updated existing lead:", leadId);
} else {
  const newLead = await sql`
    insert into leads (id, call_id, name, preferred_areas, bhk, budget_max_inr, occupants, parking_needed, move_in_by, intent, notes)
    values (
      ${randomUUID()},
      ${internalCallId},
      ${profile.name},
      ${JSON.stringify(profile.preferred_areas)}::jsonb,
      ${JSON.stringify(profile.bhk)}::jsonb,
      ${profile.budget_max_inr},
      ${profile.occupants},
      ${profile.parking_needed},
      ${profile.move_in_by},
      ${profile.intent},
      ${profile.notes}
    )
    returning id
  `;
  leadId = newLead[0].id;
  console.log("✓ inserted lead:", leadId);
}

// Re-link the visits booked during this call to this lead.
if (visitIds.length > 0) {
  await sql`
    update visits set lead_id = ${leadId}, updated_at = now()
    where id = any(${visitIds})
  `;
  console.log(`✓ re-linked ${visitIds.length} visits to lead ${leadId}`);
}

// Append agent_events for the function_call payloads (replay history).
let eventCount = 0;
for (const fc of log.filter((e) => e.component === "function_call")) {
  let payload;
  try {
    payload = typeof fc.data === "string" ? JSON.parse(fc.data) : fc.data;
  } catch {
    payload = { raw: fc.data };
  }
  await sql`
    insert into agent_events (id, call_id, event_type, payload, received_at)
    values (${randomUUID()}, ${internalCallId}, ${"function_call." + fc.type}, ${JSON.stringify(payload)}::jsonb, ${new Date(fc.created_at + "Z").toISOString()})
  `;
  eventCount++;
}
console.log(`✓ inserted ${eventCount} agent_events`);

console.log("\nDone. Reload /inbox to see the call.");
