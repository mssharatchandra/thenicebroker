# TheNiceBroker

An AI voice concierge for Bangalore rentals. Tell it what you actually need, and it compares listings honestly across the things that matter — price, parking, deposit, commute, society age, dealbreakers — then books the visits you want. No commission, no pressure.

A weekend curiosity project I started because every rental call I've ever made in Bangalore wasted the first five minutes on the same loop: which area, which BHK, what budget, when can you move. Felt like a thing a voice agent should just handle — and handle better than the brokers do, because it has no incentive to push.

## What's in here

- A **voice agent** wired through [Bolna](https://platform.bolna.ai) — system prompt, conversation flow, function tools, and eval scripts under [`agent/`](agent/)
- A **Next.js dashboard** for the operator side — concierge inbox, listing comparison, visits calendar, unit-economics view
- A **Postgres data layer** for calls, leads, visits, and shortlists, with a raw event log for replay
- An **`InventoryProvider` abstraction** so the current 76-listing Bangalore mock can be swapped for real data later — partnership-sourced or community-built like [bengaluru.rent](https://bengaluru.rent)
- A **comparison engine** that scores listings on weighted preferences and surfaces honest tradeoffs (every listing has a `caveats[]` field; the agent reads them aloud before recommending)

## Quick start

```bash
pnpm install
cp .env.example .env.local
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

See [`docs/BOLNA_AGENT_SETUP.md`](docs/BOLNA_AGENT_SETUP.md). The system prompt lives at [`agent/system-prompt.md`](agent/system-prompt.md) — paste it into platform.bolna.ai and configure the five function tools in [`agent/tools.json`](agent/tools.json) to point at your deployed `/api/agent/*` routes.

## Why "TheNiceBroker"

NoBroker is trademark-protected, so anything derivative is off the table for a real product. "TheNiceBroker" reads as the thing the brand actually wants to be — useful, honest, low-pressure — without stepping on anyone's IP.

## License

MIT. Pitch it, fork it, ship it.
