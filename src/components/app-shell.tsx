import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/inbox", label: "Inbox" },
  { href: "/listings", label: "Listings" },
  { href: "/visits", label: "Visits" },
  { href: "/economics", label: "Economics" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/inbox" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded bg-emerald-700 text-sm font-semibold text-white">
              TN
            </span>
            <span>
              <span className="block text-base font-semibold text-stone-950">TheNiceBroker</span>
              <span className="block text-xs text-stone-500">NoBroker rental concierge demo</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{title}</h1>
      </div>
      {children}
    </div>
  );
}
