import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/app-shell";
import { Badge, MetricCard, Panel } from "@/components/ui";
import { getDb, isDbConfigured, leads } from "@/lib/db";
import { getDashboardData } from "@/lib/dashboard/data";
import { provider } from "@/lib/providers";
import type { Area } from "@/lib/providers/types";

export default async function DemandPage() {
  const [inventory, demand] = await Promise.all([provider.listAll(), getDemandSignals()]);
  const inventoryByArea = countBy(inventory.map((listing) => listing.area));
  const allAreas = Array.from(new Set([...Object.keys(inventoryByArea), ...Object.keys(demand)])).sort() as Area[];
  const rows = allAreas.map((area) => ({
    area,
    demand: demand[area] ?? 0,
    supply: inventoryByArea[area] ?? 0,
    gap: (demand[area] ?? 0) - Math.round((inventoryByArea[area] ?? 0) / 4),
  })).sort((a, b) => b.gap - a.gap || b.demand - a.demand);
  const topDemand = rows[0];
  const maxDemand = Math.max(1, ...rows.map((row) => row.demand));
  const maxSupply = Math.max(1, ...rows.map((row) => row.supply));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Demand graph" title="Where renter demand is clustering">
        <Badge tone="green">Voice-driven market signal</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tracked areas" value={rows.length.toString()} helper="Demand + supply coverage" />
        <MetricCard label="Highest demand" value={topDemand?.area ?? "—"} helper={`${topDemand?.demand ?? 0} lead mentions`} />
        <MetricCard label="Inventory" value={inventory.length.toString()} helper="Mock provider listings" />
      </div>

      <Panel title="Demand vs inventory coverage">
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.area} className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_120px] md:items-center">
              <div>
                <p className="font-semibold text-stone-950">{row.area}</p>
                <p className="text-xs text-stone-500">{row.demand} demand · {row.supply} listings</p>
              </div>
              <div className="space-y-1">
                <Bar label="Demand" value={row.demand} max={maxDemand} tone="bg-emerald-700" />
                <Bar label="Inventory" value={row.supply} max={maxSupply} tone="bg-stone-500" />
              </div>
              <Badge tone={row.gap > 0 ? "amber" : "green"}>{row.gap > 0 ? "add coverage" : "covered"}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}

async function getDemandSignals(): Promise<Record<string, number>> {
  if (isDbConfigured()) {
    const db = getDb();
    const rows = await db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(200);
    const counts = countBy(rows.flatMap((lead) => lead.preferredAreas ?? []));
    if (Object.keys(counts).length > 0) return counts;
  }

  const data = await getDashboardData();
  return countBy(data.calls.flatMap((call) => call.requirements.areas));
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const width = `${Math.max(value > 0 ? 5 : 0, Math.round((value / max) * 100))}%`;
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_32px] items-center gap-2 text-xs text-stone-500">
      <span>{label}</span>
      <div className="h-2 rounded bg-stone-100">
        <div className={`h-2 rounded ${tone}`} style={{ width }} />
      </div>
      <span className="text-right">{value}</span>
    </div>
  );
}
