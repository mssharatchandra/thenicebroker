import { PageHeader } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { formatDateTime, getDashboardData } from "@/lib/dashboard/data";

export default async function VisitsPage() {
  const data = await getDashboardData();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Booked visits" title="The agent closes the loop with real appointments">
        <Badge tone="green">{data.visits.length} scheduled</Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Visit Calendar">
          <div className="divide-y divide-stone-200">
            {data.visits.map((visit) => (
              <article key={visit.id} className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_minmax(0,1fr)_120px] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-stone-950">{formatDateTime(visit.scheduledFor)}</p>
                  <p className="mt-1 text-xs text-stone-500">{visit.channel}</p>
                </div>
                <div>
                  <p className="font-medium text-stone-950">{visit.listingTitle}</p>
                  <p className="mt-1 text-sm text-stone-500">{visit.leadName} · {visit.listingId}</p>
                </div>
                <Badge tone={visit.status === "scheduled" ? "green" : "neutral"}>{visit.status}</Badge>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Operator Handoff">
          <div className="space-y-4 text-sm leading-6 text-stone-700">
            <p>
              Each booked visit is tied to the lead profile, shortlist, and comparison rationale. A human operator can confirm society access, owner availability, and route planning without re-asking the renter for basic context.
            </p>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
              <p className="font-semibold">Demo flow</p>
              <p className="mt-1">Caller chooses HSR first, keeps Whitefield as backup, and receives the comparison summary after the call.</p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
