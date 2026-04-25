import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="mb-2 text-xs font-medium uppercase tracking-widest text-brand-600">
        TheNiceBroker
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        The honest rental concierge.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-neutral-600">
        Tell our AI what you actually need in a Bangalore rental. It compares
        listings on the things that matter, surfaces honest tradeoffs, and books
        the visits you want — no commission, no pressure.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/inbox"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
        >
          Open dashboard
        </Link>
        <a
          href="https://github.com/mssharatchandra/thenicebroker"
          className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          View on GitHub
        </a>
      </div>
      <p className="mt-12 text-sm text-neutral-500">
        Built on{" "}
        <a
          className="underline underline-offset-2 hover:text-neutral-700"
          href="https://platform.bolna.ai/"
        >
          Bolna
        </a>{" "}
        as the voice layer. Open source.
      </p>
    </main>
  );
}
