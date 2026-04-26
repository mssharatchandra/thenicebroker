import PptxGenJS from "pptxgenjs";

const REPO_URL = "https://github.com/mssharatchandra/thenicebroker";
const LIVE_URL = "https://thenicebroker.vercel.app";

const C = {
  ink: "171A16",
  deep: "0F2A1D",
  green: "2F6F4E",
  mint: "DDEEE5",
  leaf: "8ED1AD",
  paper: "FFFDF7",
  line: "D7D1C2",
  amber: "E3A634",
  blue: "4C8CAB",
  red: "B85C4D",
  muted: "746F65",
};

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 inches
const W = 13.333;
const H = 7.5;

const display = "Georgia";
const baseFont = "Calibri";

function bg(slide, color) {
  slide.background = { color };
}

function rect(slide, x, y, w, h, color) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color }, line: { color, width: 0 } });
}

function txt(slide, str, opts) {
  slide.addText(str, opts);
}

// ============ SLIDE 1: COVER ============
{
  const s = pptx.addSlide();
  bg(s, C.ink);
  // green band right
  rect(s, W - 4.4, 0, 4.4, H, C.green);

  // Left copy block
  txt(s, "TheNiceBroker", {
    x: 0.7, y: 1.0, w: 7.5, h: 1.4,
    fontFace: display, fontSize: 64, bold: true, color: C.paper,
  });
  rect(s, 0.7, 2.45, 1.6, 0.05, C.leaf);
  txt(s, "An honest AI rental concierge for NoBroker-style marketplaces. Voice-first, never pushy, names tradeoffs before recommending.", {
    x: 0.7, y: 2.7, w: 7.5, h: 1.5,
    fontFace: baseFont, fontSize: 20, color: C.mint,
  });

  txt(s, `Live  ·  ${LIVE_URL}`, {
    x: 0.7, y: 4.5, w: 7.5, h: 0.4,
    fontFace: baseFont, fontSize: 16, bold: true, color: C.leaf,
  });
  txt(s, `Code  ·  ${REPO_URL}`, {
    x: 0.7, y: 4.9, w: 7.5, h: 0.4,
    fontFace: baseFont, fontSize: 16, bold: true, color: C.leaf,
  });
  txt(s, "Bolna assignment artifact — Full Stack + AI Solutions Engineer + Founder's Office. One product, three lenses.", {
    x: 0.7, y: 5.5, w: 7.5, h: 0.6,
    fontFace: baseFont, fontSize: 14, color: "B9CCBF", italic: true,
  });

  // Right number block
  txt(s, "₹15", {
    x: W - 4.4, y: 1.6, w: 4.4, h: 2.0,
    fontFace: display, fontSize: 110, bold: true, color: C.paper, align: "center",
  });
  txt(s, "per AI-handled call", {
    x: W - 4.4, y: 3.6, w: 4.4, h: 0.5,
    fontFace: baseFont, fontSize: 18, bold: true, color: C.mint, align: "center",
  });
  txt(s, "vs ₹200–₹400 of RM time on the same shape-finding inbound.\nThe wedge: cut RM load without cutting renter trust.", {
    x: W - 4.0, y: 4.2, w: 3.6, h: 1.4,
    fontFace: baseFont, fontSize: 14, color: "D9E8DF", align: "center",
  });
}

// ============ SLIDE 2: WHY THIS PROBLEM ============
{
  const s = pptx.addSlide();
  bg(s, C.paper);

  txt(s, "1 · WHY THIS PROBLEM", {
    x: 0.6, y: 0.5, w: 12, h: 0.3, fontFace: baseFont, fontSize: 12, bold: true, color: C.green,
  });
  txt(s, "NoBroker spends RM-minutes on the same inbound shape-finding call, every day", {
    x: 0.6, y: 0.85, w: 12, h: 0.8, fontFace: display, fontSize: 32, bold: true, color: C.ink,
  });
  txt(s, "The first 5 minutes of every rental call is the same loop: which area, which BHK, what budget, when can you move. A voice agent that handles that loop honestly is the highest-leverage swap in the funnel.", {
    x: 0.6, y: 1.7, w: 12, h: 0.8, fontFace: baseFont, fontSize: 14, color: C.muted,
  });

  // 3 columns
  const cols = [
    {
      head: "₹200–₹400",
      headColor: C.red,
      label: "Cost per RM-handled inbound",
      copy: "Relationship-manager payroll scales linearly with rental demand. Most of those minutes are spent on requirement-extraction, not human judgment.",
    },
    {
      head: "Trust gap",
      headColor: C.amber,
      label: "Renters distrust commission-driven scripts",
      copy: "NoBroker's brand is literally 'no broker' — but the inbound experience still feels like one. An agent that names tradeoffs is a brand-promise upgrade, not just a cost play.",
    },
    {
      head: "3 P&L lines",
      headColor: C.blue,
      label: "One agent, expanding scope",
      copy: "Rentals today, sales next, home services after. Same prompt scaffold, same function-tool pattern. Engineering cost compounds; contract value compounds with it.",
    },
  ];
  const colW = (W - 1.2) / 3 - 0.2;
  cols.forEach((c, i) => {
    const x = 0.6 + i * (colW + 0.3);
    txt(s, c.head, { x, y: 3.0, w: colW, h: 0.9, fontFace: display, fontSize: 38, bold: true, color: c.headColor });
    txt(s, c.label, { x, y: 3.95, w: colW, h: 0.6, fontFace: baseFont, fontSize: 16, bold: true, color: C.ink });
    txt(s, c.copy, { x, y: 4.55, w: colW, h: 2.4, fontFace: baseFont, fontSize: 13, color: C.muted });
  });

  txt(s, "Real company · NoBroker · Bangalore HQ · ~$1B+ valuation · marketplace, not a builder", {
    x: 0.6, y: H - 0.5, w: 12, h: 0.3, fontFace: baseFont, fontSize: 11, color: C.muted, italic: true,
  });
}

// ============ SLIDE 3: WORKFLOW ============
{
  const s = pptx.addSlide();
  bg(s, C.paper);

  txt(s, "2 · WORKFLOW", { x: 0.6, y: 0.5, w: 12, h: 0.3, fontFace: baseFont, fontSize: 12, bold: true, color: C.green });
  txt(s, "From a fuzzy phone call to a booked visit, end to end", {
    x: 0.6, y: 0.85, w: 12, h: 0.7, fontFace: display, fontSize: 30, bold: true, color: C.ink,
  });
  txt(s, "Every step is observable in the operator dashboard. The renter never feels the seams.", {
    x: 0.6, y: 1.6, w: 12, h: 0.5, fontFace: baseFont, fontSize: 14, color: C.muted,
  });

  const steps = [
    ["1 · Renter calls", "Bolna picks up. Welcome message sets the trust posture: 'I'll call out the tradeoffs too.' Hindi/Kannada/English supported.", C.green],
    ["2 · Profile extracted", "Agent extracts name, phone, area, BHK, budget, occupants, parking, move-in. Calls upsert_lead after every meaningful update.", C.blue],
    ["3 · Honest search", "Calls search_inventory with normalized filters. Backend ranks 76 listings on 9 weighted axes and returns reasons + flags.", C.amber],
    ["4 · Compare aloud", "Agent reads top 2-3 listings with one downside each. compare_listings produces axis-by-axis verdicts.", C.red],
    ["5 · Book a visit", "book_visit takes a slot ('tomorrow 6:30pm' or ISO) and writes to the visits table. Confirms back to caller.", C.green],
    ["6 · Summary + handoff", "send_summary closes the loop. Operator sees the call, profile, transcript, visit, and unit economics in /inbox.", C.blue],
  ];
  const stepW = (W - 1.2) / 3 - 0.2;
  const stepH = 2.3;
  steps.forEach((step, i) => {
    const col = i % 3;
    const rowI = Math.floor(i / 3);
    const x = 0.6 + col * (stepW + 0.3);
    const y = 2.4 + rowI * (stepH + 0.2);
    rect(s, x, y, 0.55, 0.05, step[2]);
    txt(s, step[0], { x, y: y + 0.12, w: stepW, h: 0.5, fontFace: display, fontSize: 18, bold: true, color: C.ink });
    txt(s, step[1], { x, y: y + 0.65, w: stepW, h: stepH - 0.7, fontFace: baseFont, fontSize: 13, color: C.muted });
  });

  txt(s, "Operator surfaces · /inbox · /listings · /visits · /leads · /demand · /economics", {
    x: 0.6, y: H - 0.5, w: 12, h: 0.3, fontFace: baseFont, fontSize: 11, color: C.muted, italic: true,
  });
}

// ============ SLIDE 4: ARCHITECTURE & BOLNA INTEGRATION ============
{
  const s = pptx.addSlide();
  bg(s, C.paper);

  txt(s, "3 · ARCHITECTURE & BOLNA INTEGRATION", {
    x: 0.6, y: 0.4, w: 12, h: 0.3, fontFace: baseFont, fontSize: 12, bold: true, color: C.green,
  });
  txt(s, "Next.js 15 + Neon Postgres + Bolna voice agent, talking over signed webhooks", {
    x: 0.6, y: 0.75, w: 12, h: 0.7, fontFace: display, fontSize: 26, bold: true, color: C.ink,
  });
  txt(s, "Bolna runs the voice + LLM. Our app owns the data shape, the comparison logic, and the operator UI.", {
    x: 0.6, y: 1.5, w: 12, h: 0.4, fontFace: baseFont, fontSize: 13, color: C.muted,
  });

  // Left column: Bolna contract
  const leftX = 0.6;
  const leftW = 7.0;
  txt(s, "Bolna ↔ TheNiceBroker contract", {
    x: leftX, y: 2.1, w: leftW, h: 0.4, fontFace: baseFont, fontSize: 16, bold: true, color: C.green,
  });
  const bullets = [
    { c: C.blue, t: "POST /api/bolna/webhook receives call.started, call.ended, transcript.updated. Constant-time secret check; 4 header forms supported." },
    { c: C.green, t: "Five function tools — Next.js route handlers, Zod-validated, idempotent:" },
    { c: C.amber, t: "/api/agent/upsert-lead — merges partial profiles by call_id, phone, or email." },
    { c: C.amber, t: "/api/agent/search — 9-axis weighted scoring; locality 'AECS Layout' → Marathahalli; soft move_in_by penalty so listings are never silently dropped." },
    { c: C.amber, t: "/api/agent/compare — axis-by-axis verdicts (best / worst / neutral)." },
    { c: C.amber, t: "/api/agent/book-visit — accepts ISO or natural language ('tomorrow evening')." },
    { c: C.amber, t: "/api/agent/send-summary — never fires with zero listings (prompt rule + backend guard)." },
    { c: C.green, t: "Routes accept both nested ({filters: {...}}) and flat Bolna tool-call payloads — Bolna's UI is easier to wire with flat fields." },
  ];
  let y = 2.55;
  bullets.forEach((b) => {
    rect(s, leftX, y + 0.08, 0.1, 0.1, b.c);
    txt(s, b.t, { x: leftX + 0.2, y, w: leftW - 0.2, h: 0.6, fontFace: baseFont, fontSize: 12, color: C.ink });
    y += 0.55;
  });

  // Right column: Stack + DB
  const rightX = 7.9;
  const rightW = 5.0;
  txt(s, "Stack", { x: rightX, y: 2.1, w: rightW, h: 0.4, fontFace: baseFont, fontSize: 16, bold: true, color: C.green });
  const stack = [
    ["Frontend", "Next.js 15 App Router · React 19 · Tailwind v4 · TS strict"],
    ["Voice + LLM", "Bolna · ElevenLabs · Deepgram · GPT-4o"],
    ["API", "Next.js routes · Zod validation · constant-time auth"],
    ["Inventory", "Provider interface · 76 mock listings · honesty in the schema (caveats[])"],
    ["DB", "Neon Postgres · Drizzle ORM · 5 tables"],
    ["Hosting", "Vercel · GitHub Actions · pnpm"],
  ];
  let sy = 2.55;
  stack.forEach(([k, v]) => {
    txt(s, k, { x: rightX, y: sy, w: 1.3, h: 0.35, fontFace: baseFont, fontSize: 12, bold: true, color: C.ink });
    txt(s, v, { x: rightX + 1.35, y: sy, w: rightW - 1.35, h: 0.55, fontFace: baseFont, fontSize: 11, color: C.muted });
    sy += 0.5;
  });

  txt(s, "Database tables", { x: rightX, y: sy + 0.1, w: rightW, h: 0.35, fontFace: baseFont, fontSize: 14, bold: true, color: C.green });
  txt(s, "calls (Bolna lifecycle) · leads (caller profile, merged across tool calls) · visits (booked slots) · shortlists (per-call picks) · agent_events (raw webhook log, cheap insurance for replay).",
    { x: rightX, y: sy + 0.5, w: rightW, h: 1.3, fontFace: baseFont, fontSize: 11, color: C.muted });

  txt(s, `Repo · ${REPO_URL}    Live · ${LIVE_URL}`, {
    x: 0.6, y: H - 0.45, w: 12, h: 0.3, fontFace: baseFont, fontSize: 11, color: C.muted, italic: true,
  });
}

// ============ SLIDE 5: DECISIONS ============
{
  const s = pptx.addSlide();
  bg(s, C.paper);

  txt(s, "4 · WHY EACH DECISION WAS MADE", {
    x: 0.6, y: 0.4, w: 12, h: 0.3, fontFace: baseFont, fontSize: 12, bold: true, color: C.green,
  });
  txt(s, "Engineering choices that look small on the diff and load-bearing on the demo", {
    x: 0.6, y: 0.75, w: 12, h: 0.6, fontFace: display, fontSize: 26, bold: true, color: C.ink,
  });
  txt(s, "Every one of these came from a real failure mode or a real cost — not from defaults.", {
    x: 0.6, y: 1.4, w: 12, h: 0.4, fontFace: baseFont, fontSize: 13, color: C.muted,
  });

  const rows = [
    ["Marketplace, not builder", "10–100× the call volume of selling-side, and the 'no broker' brand pairs naturally with a renter-advocate agent. Bigger contract, better story, same engineering effort."],
    ["Mock inventory behind a provider interface", "bengaluru.rent forbids scraping; partnership is the right post-assignment path. The InventoryProvider abstraction means swapping to real data is one file, not a rewrite."],
    ["Honesty in the data shape, not just the prompt", "Every listing has a caveats[] field. The agent reads it aloud. Trust isn't a slide claim — it's enforced at the schema level so it can't be prompted away."],
    ["Postgres-only, no SQLite fallback", "Same DB locally and in prod. Neon's HTTP driver removes connection-pooling pain on Vercel. Simpler is faster to ship and easier to reason about."],
    ["Function tools accept flat or nested payloads", "Bolna's tool config UI prefers flat fields. The repo schema is nested. Coercing on the way in keeps both ergonomic without forking the route."],
    ["Soft move-in filter, not hard", "Bolna LLMs commonly send first-of-month dates ('2026-05-01'), which would silently drop most listings. Soft scoring lets the agent narrate the tradeoff instead of returning empty."],
    ["Locality → area normalization at the edge", "Renters say 'AECS Layout', not 'Marathahalli'. The route maps known sub-localities to parent areas and drops unknown strings rather than 400-rejecting the whole search."],
    ["No shadcn, no auth, no SMS send", "Five-day take-home. Each cut was deliberate: lean deps, single-tenant operator dashboard, send_summary stubbed with a logged record. None of these block the demo."],
  ];

  let y = 2.0;
  const rowH = 0.62;
  rows.forEach(([label, copy]) => {
    rect(s, 0.6, y + 0.05, 0.08, 0.5, C.green);
    txt(s, label, { x: 0.85, y, w: 4.0, h: rowH, fontFace: display, fontSize: 14, bold: true, color: C.ink, valign: "top" });
    txt(s, copy, { x: 4.95, y, w: 8.0, h: rowH, fontFace: baseFont, fontSize: 12, color: C.muted, valign: "top" });
    y += rowH + 0.05;
  });

  txt(s, "Full decisions log · AGENTS.md in the repo · 16 entries with date + reason", {
    x: 0.6, y: H - 0.45, w: 12, h: 0.3, fontFace: baseFont, fontSize: 11, color: C.muted, italic: true,
  });
}

await pptx.writeFile({ fileName: "docs/deck/thenicebroker-5slide.pptx" });
console.log("Wrote docs/deck/thenicebroker-5slide.pptx");
