import { PageHeader } from "@/components/app-shell";
import { Badge, MetricCard, Panel } from "@/components/ui";
import { formatInr, getDashboardData } from "@/lib/dashboard/data";

export default async function EconomicsPage() {
  const data = await getDashboardData();
  const economics = data.economics;
  const visitCount = Math.round((economics.monthlyCalls * economics.visitConversionPct) / 100);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Success matrix" title="CFO-readable ROI, operator-readable quality">
        <Badge tone="green">₹{formatInr(economics.monthlySavingsInr)} monthly savings</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Monthly calls"
          value={formatInr(economics.monthlyCalls)}
          helper="Inbound rental concierge volume"
        />
        <MetricCard
          label="RM baseline"
          value={`₹${economics.rmCostPerCallInr}`}
          helper="Per qualified phone call"
        />
        <MetricCard
          label="AI call"
          value={`₹${economics.aiCostPerCallInr}`}
          helper="Bolna + backend estimate"
        />
        <MetricCard
          label="Booked visits"
          value={formatInr(visitCount)}
          helper={`${economics.visitConversionPct}% call-to-visit`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Panel title="Monthly Cost Delta">
          <div className="space-y-5">
            <CostBar label="Relationship managers" amount={economics.rmMonthlyCostInr} max={economics.rmMonthlyCostInr} tone="bg-stone-800" />
            <CostBar label="Voice AI concierge" amount={economics.aiMonthlyCostInr} max={economics.rmMonthlyCostInr} tone="bg-emerald-700" />
            <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-950">
                Net monthly savings: ₹{formatInr(economics.monthlySavingsInr)}
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                The assignment metric is not just “agent sounds good.” It is cost per qualified rental visit, with trust quality tracked by complaint rate and visit-show rate.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Case Study Promise">
          <div className="space-y-4 text-sm leading-6 text-stone-700">
            <p>
              For NoBroker: reduce RM call load, improve renter trust, and book more visits with transparent comparisons.
            </p>
            <p>
              Expansion path: rentals first, then sales qualification, then home services such as packers, painting, legal, and tenant plans.
            </p>
            <div>
              <p className="font-semibold text-stone-950">Next five clients</p>
              <p className="mt-1">Housing.com, 99acres, MagicBricks, Square Yards, Stanza/Colive.</p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}

function CostBar({
  label,
  amount,
  max,
  tone,
}: {
  label: string;
  amount: number;
  max: number;
  tone: string;
}) {
  const width = `${Math.max(4, Math.round((amount / max) * 100))}%`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="text-sm font-semibold text-stone-950">₹{formatInr(amount)}</p>
      </div>
      <div className="h-3 rounded bg-stone-100">
        <div className={`h-3 rounded ${tone}`} style={{ width }} />
      </div>
    </div>
  );
}
