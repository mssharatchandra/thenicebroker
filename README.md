# TheNiceBroker

An AI voice concierge for Bangalore rentals. Tell it what you actually need, and it compares listings honestly across the things that matter — price, parking, deposit, commute, society age, dealbreakers — then books the visits you want. No commission, no pressure.

> **Status:** Built as the submission for the Bolna Full Stack / AI Solutions Engineer / Founder's Office assignments. Use case: an AI rental concierge layer for a marketplace like NoBroker. Architected with a pluggable `InventoryProvider` so the same agent + dashboard can later run on real data via partnership with NoBroker, Housing.com, or community-sourced data like [bengaluru.rent](https://bengaluru.rent).

## What's in here

- A **Bolna voice agent** (system prompt, conversation flow, tool definitions, eval cases — all under [`agent/`](agent/))
- A **Next.js dashboard** (concierge inbox, listing comparison, visits calendar, unit economics)
- A **Postgres data layer** for calls, leads, visits, and shortlists
- A **`InventoryProvider` abstraction** so the current 25-listing Bangalore mock can be swapped for real data without touching the agent or the UI
- A **honest comparison engine** that scores listings on weighted user preferences and surfaces real tradeoffs

## Quick start

```bash
pnpm install
cp .env.example .env
# fill in DATABASE_URL (Neon free tier works in 30s)
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
Caller ──voice──> Bolna Agent ──HTTPS──> Next.js API
                                          │
                       webhook + tool calls
                                          │
                                          ├── InventoryProvider (mock today)
                                          ├── ComparisonEngine
                                          └── Postgres (calls / leads / visits)
                                                  ▲
                                                  │
                                          Operator dashboard
```

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). One-click on Vercel after pointing `DATABASE_URL` at a Neon project.

## Bolna agent setup

See [`docs/BOLNA_AGENT_SETUP.md`](docs/BOLNA_AGENT_SETUP.md). The system prompt lives at [`agent/system-prompt.md`](agent/system-prompt.md) — paste it into platform.bolna.ai and configure the four function tools in [`agent/tools.json`](agent/tools.json) to point at your deployed `/api/agent/*` routes.

## License

MIT. Pitch it, fork it, ship it.
