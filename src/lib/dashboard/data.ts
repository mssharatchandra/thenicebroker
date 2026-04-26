import { desc, eq } from "drizzle-orm";
import { compareListings } from "@/lib/compare/engine";
import { calls, getDb, isDbConfigured, leads, visits } from "@/lib/db";
import { provider } from "@/lib/providers";
import type { Listing } from "@/lib/providers";

export interface DashboardCall {
  id: string;
  bolnaCallId: string;
  status: "completed" | "in_progress" | "missed";
  callerName: string;
  phone: string;
  startedAt: string;
  durationSec: number;
  qualScore: number;
  intent: "urgent" | "actively-looking" | "just-browsing";
  requirements: {
    areas: string[];
    bhk: number[];
    budget: string;
    moveInBy: string;
    occupants: string;
    parking: string;
    language: "English" | "Hindi" | "Kannada";
  };
  shortlistedListingIds: string[];
  transcript: Array<{ speaker: "User" | "Agent" | "Tool"; text: string }>;
}

export interface DashboardVisit {
  id: string;
  listingId: string;
  listingTitle: string;
  leadName: string;
  scheduledFor: string;
  status: "scheduled" | "completed" | "cancelled";
  channel: "in-person" | "video";
}

export interface DashboardData {
  source: "demo" | "database";
  sourceNote: string;
  inventoryCount: number;
  calls: DashboardCall[];
  visits: DashboardVisit[];
  recommendedListings: Listing[];
  comparison: ReturnType<typeof compareListings>;
  economics: {
    rmCostPerCallInr: number;
    aiCostPerCallInr: number;
    monthlyCalls: number;
    visitConversionPct: number;
    rmMonthlyCostInr: number;
    aiMonthlyCostInr: number;
    monthlySavingsInr: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  if (isDbConfigured()) {
    try {
      const fromDb = await getDatabaseDashboardData();
      if (fromDb.calls.length > 0 || fromDb.visits.length > 0) return fromDb;
    } catch {
      // Demo fallback keeps the dashboard useful while env/schema are being wired.
    }
  }
  return getDemoDashboardData();
}

export async function getDemoDashboardData(): Promise<DashboardData> {
  const inventoryCount = await provider.count();
  const recommendedListings = await provider.getMany(["nbk-003", "nbk-005", "nbk-018"]);
  const comparison = compareListings(recommendedListings);
  const calls = buildDemoCalls();
  const visits = await buildDemoVisits();
  const economics = buildEconomics({ monthlyCalls: 12000, visitConversionPct: 34 });

  return {
    source: "demo",
    sourceNote: "Demo data is shown until Neon receives live Bolna events.",
    inventoryCount,
    calls,
    visits,
    recommendedListings,
    comparison,
    economics,
  };
}

async function getDatabaseDashboardData(): Promise<DashboardData> {
  const db = getDb();
  const callRows = await db.select().from(calls).orderBy(desc(calls.startedAt)).limit(12);
  const leadRows = await db.select().from(leads);
  const visitRows = await db.select().from(visits).orderBy(desc(visits.scheduledFor)).limit(12);
  const leadByCall = new Map(leadRows.map((lead) => [lead.callId, lead]));
  const leadById = new Map(leadRows.map((lead) => [lead.id, lead]));

  const dashboardCalls: DashboardCall[] = callRows.map((call) => {
    const lead = leadByCall.get(call.id);
    return {
      id: call.id,
      bolnaCallId: call.bolnaCallId ?? call.id,
      status: normalizeStatus(call.status),
      callerName: lead?.name ?? "Unknown caller",
      phone: lead?.phone ?? call.phoneNumber ?? "No phone captured",
      startedAt: call.startedAt.toISOString(),
      durationSec: call.durationSec ?? 0,
      qualScore: lead?.qualScore ?? 0,
      intent: normalizeIntent(lead?.intent),
      requirements: {
        areas: lead?.preferredAreas ?? [],
        bhk: lead?.bhk ?? [],
        budget: formatBudget(lead?.budgetMinInr ?? null, lead?.budgetMaxInr ?? null),
        moveInBy: lead?.moveInBy ?? "Not captured",
        occupants: lead?.occupants ?? "Not captured",
        parking: lead?.parkingNeeded ?? "Not captured",
        language: normalizeLanguage(lead?.preferredLanguage),
      },
      shortlistedListingIds: [],
      transcript: transcriptFromJson(call.transcriptJson),
    };
  });

  const callIds = new Set(callRows.map((call) => call.id));
  const orphanLeads = leadRows.filter((lead) => !lead.callId || !callIds.has(lead.callId));
  for (const lead of orphanLeads) {
    dashboardCalls.push({
      id: lead.id,
      bolnaCallId: lead.callId ?? `chat-${lead.id.slice(0, 8)}`,
      status: "in_progress",
      callerName: lead.name ?? "Unknown caller",
      phone: lead.phone ?? "No phone captured",
      startedAt: lead.createdAt.toISOString(),
      durationSec: 0,
      qualScore: lead.qualScore ?? 0,
      intent: normalizeIntent(lead.intent),
      requirements: {
        areas: lead.preferredAreas ?? [],
        bhk: lead.bhk ?? [],
        budget: formatBudget(lead.budgetMinInr ?? null, lead.budgetMaxInr ?? null),
        moveInBy: lead.moveInBy ?? "Not captured",
        occupants: lead.occupants ?? "Not captured",
        parking: lead.parkingNeeded ?? "Not captured",
        language: normalizeLanguage(lead.preferredLanguage),
      },
      shortlistedListingIds: [],
      transcript: [
        {
          speaker: "Tool",
          text: "Profile created from Bolna chat/function tool calls before a full call webhook was received.",
        },
      ],
    });
  }

  const visitCards: DashboardVisit[] = [];
  for (const visit of visitRows) {
    const listing = await provider.getById(visit.listingId);
    const lead = leadById.get(visit.leadId);
    visitCards.push({
      id: visit.id,
      listingId: visit.listingId,
      listingTitle: listing?.title ?? visit.listingId,
      leadName: lead?.name ?? "Unknown lead",
      scheduledFor: visit.scheduledFor.toISOString(),
      status: normalizeVisitStatus(visit.status),
      channel: visit.channel === "video" ? "video" : "in-person",
    });
  }

  const recommendedListings = await provider.getMany(["nbk-003", "nbk-005", "nbk-018"]);
  return {
    source: "database",
    sourceNote: "Live database data from Bolna webhooks and agent tool calls.",
    inventoryCount: await provider.count(),
    calls: dashboardCalls,
    visits: visitCards,
    recommendedListings,
    comparison: compareListings(recommendedListings),
    economics: buildEconomics({
      monthlyCalls: Math.max(4000, dashboardCalls.length * 1200),
      visitConversionPct: dashboardCalls.length === 0 ? 0 : 31,
    }),
  };
}

function buildDemoCalls(): DashboardCall[] {
  return [
    {
      id: "demo-call-001",
      bolnaCallId: "bolna_demo_9J4",
      status: "completed",
      callerName: "Aarav Mehta",
      phone: "+91 98765 12034",
      startedAt: "2026-04-26T09:40:00+05:30",
      durationSec: 388,
      qualScore: 86,
      intent: "urgent",
      requirements: {
        areas: ["HSR Layout", "Whitefield"],
        bhk: [2],
        budget: "₹35k-₹48k",
        moveInBy: "2026-06-01",
        occupants: "couple",
        parking: "car",
        language: "English",
      },
      shortlistedListingIds: ["nbk-003", "nbk-005", "nbk-018"],
      transcript: [
        {
          speaker: "User",
          text: "We are moving from Pune. Need a 2BHK near ORR or Whitefield, ideally with car parking.",
        },
        {
          speaker: "Agent",
          text: "Got it. I will keep this practical: commute, total monthly cost, parking, move-in date, and any society restrictions.",
        },
        {
          speaker: "Tool",
          text: "search_inventory returned 5 matches. Top fits: nbk-003, nbk-005, nbk-018.",
        },
        {
          speaker: "Agent",
          text: "The HSR option is brighter and pet-friendly but costs more after maintenance. Whitefield is cheaper and closer to ITPL, but traffic outside Whitefield is the tradeoff.",
        },
        {
          speaker: "User",
          text: "Let us book HSR first and keep the Whitefield one as backup.",
        },
      ],
    },
    {
      id: "demo-call-002",
      bolnaCallId: "bolna_demo_1Q8",
      status: "completed",
      callerName: "Neha Rao",
      phone: "+91 99802 77119",
      startedAt: "2026-04-26T11:15:00+05:30",
      durationSec: 291,
      qualScore: 72,
      intent: "actively-looking",
      requirements: {
        areas: ["Indiranagar", "Koramangala"],
        bhk: [1, 2],
        budget: "₹28k-₹42k",
        moveInBy: "2026-05-20",
        occupants: "bachelor",
        parking: "bike",
        language: "Hindi",
      },
      shortlistedListingIds: ["nbk-010", "nbk-014"],
      transcript: [
        {
          speaker: "User",
          text: "I want something lively but not a broker-heavy experience. Bachelor allowed is important.",
        },
        {
          speaker: "Agent",
          text: "I will filter for bachelor-friendly homes and tell you if a lower price comes with a serious compromise.",
        },
      ],
    },
    {
      id: "demo-call-003",
      bolnaCallId: "bolna_demo_7VL",
      status: "in_progress",
      callerName: "Kiran N",
      phone: "+91 90088 45102",
      startedAt: "2026-04-26T12:05:00+05:30",
      durationSec: 104,
      qualScore: 58,
      intent: "just-browsing",
      requirements: {
        areas: ["JP Nagar", "BTM Layout"],
        bhk: [2],
        budget: "₹25k-₹35k",
        moveInBy: "2026-06-15",
        occupants: "family",
        parking: "either",
        language: "Kannada",
      },
      shortlistedListingIds: ["nbk-017", "nbk-022"],
      transcript: [
        {
          speaker: "User",
          text: "We are just starting. Schools nearby matter, and I do not want a very old building.",
        },
      ],
    },
  ];
}

async function buildDemoVisits(): Promise<DashboardVisit[]> {
  const listingA = await provider.getById("nbk-003");
  const listingB = await provider.getById("nbk-005");
  const listingC = await provider.getById("nbk-014");

  return [
    {
      id: "visit-demo-001",
      listingId: "nbk-003",
      listingTitle: listingA?.title ?? "HSR listing",
      leadName: "Aarav Mehta",
      scheduledFor: "2026-04-27T17:30:00+05:30",
      status: "scheduled",
      channel: "in-person",
    },
    {
      id: "visit-demo-002",
      listingId: "nbk-005",
      listingTitle: listingB?.title ?? "Whitefield listing",
      leadName: "Aarav Mehta",
      scheduledFor: "2026-04-28T11:00:00+05:30",
      status: "scheduled",
      channel: "video",
    },
    {
      id: "visit-demo-003",
      listingId: "nbk-014",
      listingTitle: listingC?.title ?? "Koramangala listing",
      leadName: "Neha Rao",
      scheduledFor: "2026-04-28T18:00:00+05:30",
      status: "scheduled",
      channel: "in-person",
    },
  ];
}

function buildEconomics(input: { monthlyCalls: number; visitConversionPct: number }) {
  const rmCostPerCallInr = 280;
  const aiCostPerCallInr = 15;
  const rmMonthlyCostInr = input.monthlyCalls * rmCostPerCallInr;
  const aiMonthlyCostInr = input.monthlyCalls * aiCostPerCallInr;
  return {
    rmCostPerCallInr,
    aiCostPerCallInr,
    monthlyCalls: input.monthlyCalls,
    visitConversionPct: input.visitConversionPct,
    rmMonthlyCostInr,
    aiMonthlyCostInr,
    monthlySavingsInr: rmMonthlyCostInr - aiMonthlyCostInr,
  };
}

function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `₹${formatInr(min)}-₹${formatInr(max)}`;
  if (max !== null) return `Up to ₹${formatInr(max)}`;
  if (min !== null) return `From ₹${formatInr(min)}`;
  return "Not captured";
}

function normalizeStatus(status: string): DashboardCall["status"] {
  if (status === "completed") return "completed";
  if (status === "missed") return "missed";
  return "in_progress";
}

function normalizeIntent(intent: string | null | undefined): DashboardCall["intent"] {
  if (intent === "urgent" || intent === "actively-looking" || intent === "just-browsing") {
    return intent;
  }
  return "actively-looking";
}

function normalizeVisitStatus(status: string): DashboardVisit["status"] {
  if (status === "completed" || status === "cancelled") return status;
  return "scheduled";
}

function normalizeLanguage(language: string | null | undefined): DashboardCall["requirements"]["language"] {
  if (language === "hi") return "Hindi";
  if (language === "kn") return "Kannada";
  return "English";
}

function transcriptFromJson(value: unknown): DashboardCall["transcript"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((turn) => {
      if (typeof turn !== "object" || turn === null) return null;
      const record = turn as Record<string, unknown>;
      const role = typeof record.role === "string" ? record.role : "assistant";
      const text = typeof record.content === "string"
        ? record.content
        : typeof record.text === "string"
          ? record.text
          : "";
      if (!text) return null;
      return {
        speaker: role === "user" ? "User" : role === "tool" ? "Tool" : "Agent",
        text,
      } satisfies DashboardCall["transcript"][number];
    })
    .filter((turn): turn is DashboardCall["transcript"][number] => turn !== null);
}

export function formatInr(n: number): string {
  return n.toLocaleString("en-IN");
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}
