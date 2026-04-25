import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * One row per Bolna call.
 * Kept thin and append-mostly; the transcript and event log live in jsonb so
 * we can iterate on the agent contract without breaking the schema.
 */
export const calls = pgTable(
  "calls",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    bolnaCallId: text("bolna_call_id").unique(),
    status: text("status").notNull().default("in_progress"),
    phoneNumber: text("phone_number"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSec: integer("duration_sec"),
    costPaise: integer("cost_paise"),
    recordingUrl: text("recording_url"),
    transcriptJson: jsonb("transcript_json"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    statusIdx: index("calls_status_idx").on(t.status),
    startedAtIdx: index("calls_started_at_idx").on(t.startedAt),
  }),
);

/**
 * The structured profile the agent extracts from a caller.
 * Multi-valued fields (areas, BHK, furnishing) are stored as jsonb arrays.
 */
export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    callId: text("call_id").references(() => calls.id, {
      onDelete: "set null",
    }),

    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    city: text("city").notNull().default("Bangalore"),

    preferredAreas: jsonb("preferred_areas").$type<string[]>().notNull().default([]),
    bhk: jsonb("bhk").$type<number[]>().notNull().default([]),
    budgetMinInr: integer("budget_min_inr"),
    budgetMaxInr: integer("budget_max_inr"),
    moveInBy: text("move_in_by"),
    occupants: text("occupants"),
    vegOnly: boolean("veg_only").notNull().default(false),
    petFriendly: boolean("pet_friendly").notNull().default(false),
    parkingNeeded: text("parking_needed"),
    furnishingPreference: jsonb("furnishing_preference")
      .$type<string[]>()
      .notNull()
      .default([]),
    workFromHome: boolean("work_from_home").notNull().default(false),
    preferredLanguage: text("preferred_language").notNull().default("en"),

    qualScore: integer("qual_score"),
    intent: text("intent"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    callIdx: index("leads_call_id_idx").on(t.callId),
    cityIdx: index("leads_city_idx").on(t.city),
  }),
);

/**
 * A site visit booked through the agent (or scheduled later via the dashboard).
 * `listingId` is a string so it can reference any provider's listing — today
 * the mock provider, tomorrow a real one.
 */
export const visits = pgTable(
  "visits",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    leadId: text("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("scheduled"),
    channel: text("channel").notNull().default("in-person"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    leadIdx: index("visits_lead_id_idx").on(t.leadId),
    scheduledIdx: index("visits_scheduled_for_idx").on(t.scheduledFor),
  }),
);

/**
 * Listings the agent recommended during a call, with rank, score, and the
 * verbal rationale. Useful for "why did the agent suggest X?" later.
 */
export const shortlists = pgTable(
  "shortlists",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    leadId: text("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull(),
    rank: integer("rank").notNull(),
    score: integer("score").notNull(),
    rationale: text("rationale"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    leadIdx: index("shortlists_lead_id_idx").on(t.leadId),
  }),
);

/**
 * Append-only log of every Bolna webhook payload we receive.
 * Cheap insurance — when the agent contract evolves, we have history.
 */
export const agentEvents = pgTable(
  "agent_events",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    callId: text("call_id"),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    callIdx: index("agent_events_call_id_idx").on(t.callId),
    typeIdx: index("agent_events_type_idx").on(t.eventType),
  }),
);

export type Call = typeof calls.$inferSelect;
export type NewCall = typeof calls.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type Shortlist = typeof shortlists.$inferSelect;
export type NewShortlist = typeof shortlists.$inferInsert;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type NewAgentEvent = typeof agentEvents.$inferInsert;
