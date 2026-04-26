import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/app-shell";
import { Badge, MetricCard, Panel } from "@/components/ui";
import { getDb, isDbConfigured, leads } from "@/lib/db";
import { formatDateTime, formatInr, getDashboardData } from "@/lib/dashboard/data";

export default async function LeadsPage() {
  const rows = await getLeadRows();
  const identified = rows.filter((lead) => lead.name || lead.phone).length;
  const urgent = rows.filter((lead) => lead.intent === "urgent").length;
  const avgBudget = average(rows.map((lead) => lead.budgetMaxInr).filter((n): n is number => typeof n === "number"));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Lead intelligence" title="Every renter profile the agent has captured">
        <Badge tone={isDbConfigured() ? "green" : "amber"}>{isDbConfigured() ? "Live DB" : "Demo fallback"}</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Leads" value={rows.length.toString()} helper={`${identified} identified with name or phone`} />
        <MetricCard label="Urgent" value={urgent.toString()} helper="Intent captured by voice agent" />
        <MetricCard label="Avg max budget" value={avgBudget ? `₹${formatInr(avgBudget)}` : "—"} helper="Useful for market focus" />
      </div>

      <Panel title="Lead table">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                <th className="py-3 pr-4">Lead</th>
                <th className="px-4 py-3">Areas</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Needs</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id}>
                  <td className="border-t border-stone-200 py-3 pr-4">
                    <p className="font-semibold text-stone-950">{lead.name || "Anonymous lead"}</p>
                    <p className="mt-1 text-stone-500">{lead.phone || "No phone yet"}</p>
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3">{lead.preferredAreas.join(", ") || "Not captured"}</td>
                  <td className="border-t border-stone-200 px-4 py-3">{formatBudget(lead.budgetMinInr, lead.budgetMaxInr)}</td>
                  <td className="border-t border-stone-200 px-4 py-3">
                    {(lead.bhk ?? []).join(", ") || "Any"}BHK · {lead.parkingNeeded || "parking open"} · {lead.moveInBy || "date flexible"}
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3">
                    <Badge tone={lead.intent === "urgent" ? "green" : lead.intent === "just-browsing" ? "blue" : "amber"}>
                      {lead.intent || "actively-looking"}
                    </Badge>
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3">{formatDateTime(lead.updatedAt.toISOString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  );
}

async function getLeadRows(): Promise<Array<typeof leads.$inferSelect>> {
  if (isDbConfigured()) {
    const db = getDb();
    const rows = await db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(80);
    if (rows.length > 0) return rows;
  }

  const data = await getDashboardData();
  return data.calls.map((call) => ({
    id: call.id,
    callId: call.id,
    name: call.callerName,
    phone: call.phone,
    email: null,
    city: "Bangalore",
    preferredAreas: call.requirements.areas,
    bhk: call.requirements.bhk,
    budgetMinInr: null,
    budgetMaxInr: null,
    moveInBy: call.requirements.moveInBy,
    occupants: call.requirements.occupants,
    vegOnly: false,
    petFriendly: false,
    parkingNeeded: call.requirements.parking,
    furnishingPreference: [],
    workFromHome: false,
    preferredLanguage: call.requirements.language === "Hindi" ? "hi" : call.requirements.language === "Kannada" ? "kn" : "en",
    qualScore: call.qualScore,
    intent: call.intent,
    notes: null,
    createdAt: new Date(call.startedAt),
    updatedAt: new Date(call.startedAt),
  }));
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `₹${formatInr(min)}-₹${formatInr(max)}`;
  if (max !== null) return `Up to ₹${formatInr(max)}`;
  if (min !== null) return `From ₹${formatInr(min)}`;
  return "Not captured";
}
