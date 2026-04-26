# AGENTS.md — handoff doc for LLMs / future contributors

> **Purpose:** This file is the running plan + status log for TheNiceBroker. It exists so any human or LLM picking up the work mid-stream can be productive within five minutes. Update it as you make material progress, decisions, or pivots.

## Why this project exists

TheNiceBroker is a submission for three Bolna assignments (Full Stack, AI Solutions Engineer, Founder's Office) collapsed into a single banger artifact. The use case: an **AI rental concierge** for a marketplace like NoBroker — voice-first, honest, never pushy. After the assignment, this is meant to live on as an open-source repo + potentially a standalone product (`thenicebroker.com` or similar; "NoBroker" is trademark-protected, so we will not commercialize under any "NoBroker"-derivative name).

### The three assignments collapse to two

- **AISE** and **Founder's Office** are *literally the same* assignment (real company + Bolna agent + demo call + 4-question success matrix). Different forms, identical content.
- **Full Stack** is a strict superset (adds web app + GitHub repo + deployed link).
- So we ship **one** artifact and submit it three times with role-tailored deck framing.

### Use case

- **Real company:** NoBroker (Bangalore HQ, ~$1B+ valuation, RM-driven cost model, "no broker" brand promise pairs perfectly with an AI advocate).
- **Vertical:** Inbound rental concierge. Caller dials in (or NoBroker calls back). Voice agent extracts requirements, compares listings honestly across multiple axes, books visits, sends a summary.
- **Why this beats selling-side (e.g. Sobha):** marketplace = bigger contract, 10–100× call volume, richer prompt complexity (multi-listing compare), better fullstack story (concierge inbox dashboard).
- **Expansion answer for Founder's Q4:** rentals → sales → home services (NoBroker's existing P&L lines).
- **Next 5 clients:** Housing.com, 99acres, MagicBricks, Square Yards, Stanza/Colive.

## Tech stack (decided, do not re-litigate without reason)

- **Framework:** Next.js 15 (App Router, RSC), React 19, TypeScript strict (`noUncheckedIndexedAccess`)
- **Styling:** Tailwind v4 (CSS-first config in `globals.css`)
- **DB:** Postgres via Neon (`@neondatabase/serverless`) + Drizzle ORM
- **Voice layer:** Bolna (platform.bolna.ai) — system prompt + 5 function tools, called via webhooks against `/api/agent/*` routes
- **Hosting:** Vercel (one-click)
- **Tests:** Vitest (only the comparison engine — not chasing coverage)
- **Package manager:** pnpm
- **Node:** 20+ (repo runs on 25 in dev)
- **No shadcn/ui:** keeping deps lean; rolling small Tailwind components by hand
- **Mock data only for assignment.** Real-data is intentionally a swap behind the `InventoryProvider` interface.

## Repo layout

```
thenicebroker/
├── AGENTS.md                  ← you are here
├── README.md
├── agent/                     ← Bolna assets (system prompt, flow, tools, evals)
├── data/                      ← (future) static datasets if needed
├── docs/                      ← ARCHITECTURE, DEPLOYMENT, BOLNA_AGENT_SETUP, DEMO_SCRIPT
├── drizzle/                   ← migrations
├── src/
│   ├── app/
│   │   ├── (dashboard)/       ← inbox, listings, visits, economics
│   │   ├── api/
│   │   │   ├── agent/         ← function-call endpoints Bolna invokes mid-call
│   │   │   └── bolna/webhook/ ← receives call lifecycle events
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
│       ├── compare/           ← scoring + comparison engine
│       ├── data/              ← bangalore-listings.ts (25 hand-curated rows)
│       ├── db/                ← drizzle schema + connection
│       ├── env.ts
│       ├── logger.ts
│       └── providers/         ← InventoryProvider interface + mock impl
└── tsconfig.json
```

## Plan / progress

Status legend: `[x]` done, `[~]` in progress, `[ ]` pending.

- [x] Phase 1 — Foundation: Next.js 15 + Tailwind v4 + TS strict + env scaffolding. Committed.
- [x] Phase 2 — Domain layer: `InventoryProvider` interface, 25 Bangalore mock listings, comparison engine + tests. Committed.
- [x] Phase 3 — Database: Drizzle schema (calls, leads, visits, shortlists), Neon connection, migrations. Committed.
- [x] Phase 4 — API: Bolna webhook receiver, agent function-call endpoints (search/compare/upsert-lead/book-visit/send-summary). Committed.
- [x] Phase 5 — Dashboard: Concierge inbox, call detail + transcript, listing comparison, visits calendar, unit economics. Committed.
- [x] Phase 6 — Agent assets: system prompt, conversation flow, tool definitions, individual Bolna custom function JSON files, eval cases — all in `agent/`. Committed.
- [x] Phase 7 — Docs: ARCHITECTURE, DEPLOYMENT, BOLNA_AGENT_SETUP, DEMO_SCRIPT, SUBMISSION_ANSWERS. Committed.
- [x] Phase 8 — CI workflow + create GitHub repo (`gh`) + push. Committed and pushed.
- [x] Phase 9 — Assignment deck: editable PPTX + preview contact sheet under `docs/deck/`. Committed.

Outside the build:
- [ ] User configures Bolna agent on platform.bolna.ai (paste prompt, wire tools to deployed URLs).
- [ ] User makes the demo call(s).
- [ ] User uploads to Drive folder `Sharat_FSE@bolna` and submits 3 forms.

## Key decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-04-26 | Marketplace (NoBroker) over builder (Sobha) | Bigger contract, richer prompt complexity, better dashboard story, "no broker" brand pairs with AI advocate |
| 2026-04-26 | Bangalore as demo city | User preference; clean mock data scope |
| 2026-04-26 | Mock data only, real-data via `InventoryProvider` interface later | bengaluru.rent explicitly forbids scraping; partnerships/community-sourcing is the right post-assignment path |
| 2026-04-26 | Open-source from day one | Portfolio artifact independent of NoBroker pitch outcome |
| 2026-04-26 | No "NoBroker"-derivative naming for the standalone | Trademark risk; standalone will use `thenicebroker` or similar |
| 2026-04-26 | Honest comparison is a *prompt rule* and *data shape* (`caveats` field on every listing) | Trust angle is load-bearing for the deck — must be visible in code, not just slides |
| 2026-04-26 | Postgres-only (no SQLite fallback) | Simpler. Neon free tier is 30 seconds. Same DB locally and prod. |
| 2026-04-26 | No shadcn/ui | Keep deps lean; small Tailwind components by hand |
| 2026-04-26 | Agent endpoints accept both nested JSON and flat Bolna tool parameters | Bolna's custom tool UI is easier to configure with flat fields; backend remains compatible with repo-native schemas |
| 2026-04-26 | Neon schema applied to the user's database | Vercel only needs env vars + redeploy before live tool testing |
| 2026-04-26 | Bolna function JSON split into one file per function | Bolna's custom function modal expects a single object; pasting an array raises "Function name must be a string" |
| 2026-04-26 | Expanded mock inventory to 76 listings across 12 Bangalore areas with deterministic visit slots | Chat testing showed sparse inventory and weak slot coverage; assignment demo needs realistic fallback breadth |
| 2026-04-26 | Added Leads and Demand dashboard tabs | Shows captured renter profiles, inventory coverage, and area-demand signal beyond the call inbox |
| 2026-04-26 | Prompt now asks for name/phone near the beginning | Prevents anonymous duplicate leads and makes bookings/summaries feel production-real |
| 2026-04-26 | Upsert now ignores placeholder values and merges recent anonymous chat rows | Bolna chat can send partial tool calls before call IDs exist; backend should absorb that gracefully |
| 2026-04-26 | Dashboard calls, visits, and listing explorer are newest-first | Operators expect the freshest conversations and newly-added mock inventory at the top during demos |
| 2026-04-26 | `move_in_by` is a soft scoring penalty, not a hard filter | Bolna agent commonly sends first-of-month dates ("2026-05-01") which silently dropped most listings; flagging it lets the agent narrate the tradeoff instead of returning empty |
| 2026-04-26 | Search route maps known localities to parent Areas; unknown areas are dropped, not 400 | Bolna chat passed "AECS Layout" as an area, hit the Zod enum, and the agent read empty results as "no inventory"; soft-mapping fixes the funnel |
| 2026-04-26 | System prompt instructs locality→area mapping + retry-broaden on empty results | Closes the loop so the agent never tells a caller "nothing matches" before it has tried widening |

## What's intentionally *not* built (and why)

- **Auth** — single-tenant operator dashboard for the demo. Add later for production.
- **Real SMS/email send** in `send_summary` — stubbed with a logged record. Plugging Twilio/MSG91 is a 30-min addition, not a demo blocker.
- **Live Bolna API client** for proactive outbound calls — assignment is inbound. Outbound is a future phase.
- **Listing photos** — placeholder/iconography. Mock data stays JSON-friendly.
- **Heavy test coverage** — only the comparison engine has unit tests. Voice eval is in `agent/eval-cases.md` as scripted calls.
- **Husky / pre-commit hooks** — overhead for a 5-day take-home. CI does typecheck + build, that's enough.

## Bolna integration contract (decided shape, may need adjustment once we see live webhooks)

**Webhook (Bolna → us):** `POST /api/bolna/webhook`
- Headers: `X-Webhook-Signature: <BOLNA_WEBHOOK_SECRET>`
- Body events: `call.started`, `call.ended`, `transcript.updated`, `function_call.requested`
- Uses Zod for inbound validation. Logs raw payloads for debugging — review and tighten once we see real Bolna events.

**Function tools (agent → us, called mid-call):**
- `POST /api/agent/upsert-lead` — accepts nested `{ call_id, lead }` or flat profile fields → `{ lead_id }`
- `POST /api/agent/search` — accepts nested `{ filters }` or flat search fields → `{ listings, count }`
- `POST /api/agent/compare` — `{ listing_ids }` as array or comma-separated string → comparison axes
- `POST /api/agent/book-visit` — `{ listing_id, slot_iso, lead_id?, call_id? }` → `{ visit_id, confirmed_slot_iso }`
- `POST /api/agent/send-summary` — `{ lead_id?, call_id?, listing_ids, channel }` → `{ sent }`

## Commands

```bash
pnpm install
pnpm dev            # next dev
pnpm typecheck
pnpm test
pnpm db:push        # apply schema to Neon (requires DATABASE_URL)
pnpm db:studio      # open drizzle studio
```

## Git conventions

- Commits use conventional-commit prefixes (`chore:`, `feat:`, `feat(agent):`, `feat(ui):`, `feat(api):`, `feat(db):`, `test:`, `docs:`, `ci:`, `fix:`).
- Repo is public on GitHub.

## Handoff checklist (if you're an LLM picking this up)

1. Read this file top-to-bottom.
2. Read [`README.md`](README.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (if present yet), and [`agent/system-prompt.md`](agent/system-prompt.md) (if present).
3. Run `pnpm install && pnpm dev` to verify the app boots.
4. Check the **Plan / progress** section above for the next `[~]` or `[ ]` task.
5. After completing work, **update the plan section + key decisions log + commit**.
