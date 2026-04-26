# TheNiceBroker

An AI voice concierge for Bangalore rentals. Tell it what you actually need and it compares listings honestly across the things that matter — price, parking, deposit, commute, society age, dealbreakers — then books the visits you want. No commission. No pressure.

The thesis is simple. The first five minutes of every rental call in Bangalore are spent on the same loop — which area, which BHK, what budget, when can you move — and a renter-advocate voice agent is a better fit for that loop than a commission-driven Relationship Manager. Marketplaces (NoBroker, Housing.com, MagicBricks) carry the call volume to make that swap economically meaningful; the brand promise of "no broker" already pairs with an honest agent. TheNiceBroker is an end-to-end implementation of that idea: voice + LLM via [Bolna](https://platform.bolna.ai), Next.js for the API and operator dashboard, Postgres for the data layer, and a pluggable inventory abstraction so the same agent runs on real listings the day a partnership is in place.

## What's in the box

- **Voice agent** — system prompt, conversation flow, and five function tools wired through Bolna. Eval scripts and per-tool JSON contracts live under [`agent/`](agent/).
- **Operator dashboard** — concierge inbox with live transcripts, listing comparison, visits calendar, lead tracking, area-demand view, and a unit-economics surface. Built on Next.js 15 App Router, React 19, Tailwind v4.
- **API layer** — Next.js route handlers for the Bolna webhook and each agent function tool. Zod-validated, constant-time webhook auth, accepts both nested and flat tool-call payloads.
- **Honesty in the schema** — every listing carries a `caveats[]` field and the agent reads them aloud before recommending. Trust isn't a prompt rule that can be jailbroken; it's enforced in the data shape.
- **Comparison engine** — hard filters plus weighted soft scoring across nine axes (price-fit, furnishing, carpet area, age, amenities, lift, proximity, parking, maintenance). Returns reasons and tradeoffs, not just rankings.
- **InventoryProvider abstraction** — 76 hand-curated mock Bangalore listings today; swappable for real data behind a single interface.
- **Postgres data layer** — Drizzle ORM, 5 tables (calls, leads, visits, shortlists, agent_events), Neon-ready.
- **Backfill tooling** — `scripts/backfill-call.mjs` reconstructs the database state from a Bolna execution log, so a call placed before the webhook was wired isn't lost.

## Quick start

```bash
pnpm install
cp .env.example .env.local
# fill in DATABASE_URL (Neon free tier works in 30s) and BOLNA_WEBHOOK_SECRET
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

## Bolna integration

`POST /api/bolna/webhook` receives `call.started`, `call.ended`, `transcript.updated`. Constant-time secret verification with four supported header forms (`x-webhook-secret`, `x-bolna-webhook-secret`, `Authorization: Bearer`, or `?secret=` query).

Five function tools, called by the LLM mid-call:

| Tool | Route | Purpose |
|---|---|---|
| `upsert_lead` | `/api/agent/upsert-lead` | Merge partial profiles by `call_id`, phone, or email |
| `search_inventory` | `/api/agent/search` | 9-axis weighted ranking; soft locality → area mapping; soft move-in penalty |
| `compare_listings` | `/api/agent/compare` | Axis-by-axis verdicts (best / worst / neutral) |
| `book_visit` | `/api/agent/book-visit` | Accepts ISO datetimes or natural language ("tomorrow evening") |
| `send_summary` | `/api/agent/send-summary` | Backend guard against zero-listing summaries |

Setup walkthrough in [`docs/BOLNA_AGENT_SETUP.md`](docs/BOLNA_AGENT_SETUP.md). The system prompt lives at [`agent/system-prompt.md`](agent/system-prompt.md); paste it into platform.bolna.ai and configure the five tools to point at your deployed `/api/agent/*` routes.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). One-click on Vercel after pointing `DATABASE_URL` at a Neon project and setting `BOLNA_WEBHOOK_SECRET`.

## Roadmap

- Real inventory via partnership API (NoBroker, Housing.com) behind the existing `InventoryProvider` interface — one file to swap.
- Outbound calling for stale leads ("three new 2BHKs in HSR match your old search").
- Hindi and Kannada voice support for Tier-2 expansion.
- Port the same architecture to sales (resale price, builder reputation, possession timeline) and to home services (scheduling concierge).

## License

MIT.
