import {
  Presentation,
  PresentationFile,
  auto,
  chart,
  column,
  fill,
  fixed,
  fr,
  grid,
  grow,
  hug,
  layers,
  panel,
  row,
  rule,
  shape,
  table,
  text,
  wrap,
} from "@oai/artifact-tool";

const W = 1920;
const H = 1080;

const C = {
  ink: "#171A16",
  deep: "#0F2A1D",
  green: "#2F6F4E",
  mint: "#DDEEE5",
  leaf: "#8ED1AD",
  stone: "#F6F3EC",
  paper: "#FFFDF7",
  line: "#D7D1C2",
  amber: "#E3A634",
  blue: "#4C8CAB",
  red: "#B85C4D",
  muted: "#746F65",
};

const baseText = { fontFace: "Aptos", color: C.ink };
const display = { fontFace: "Georgia", color: C.ink };

const deck = Presentation.create({
  slideSize: { width: W, height: H },
});

function add(slideTree, bg = C.paper) {
  const slide = deck.slides.add();
  slide.compose(
    layers(
      { name: "slide-root", width: fill, height: fill },
      [
        shape({ name: "background", width: fill, height: fill, fill: bg, line: { fill: bg, width: 0 } }),
        slideTree,
      ],
    ),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function titleSlide() {
  add(
    grid(
      {
        name: "cover-grid",
        width: fill,
        height: fill,
        columns: [fr(1.05), fr(0.95)],
        rows: [fr(1)],
        padding: { x: 104, y: 92 },
        columnGap: 70,
      },
      [
        column(
          { name: "cover-copy", width: fill, height: fill, justify: "center", gap: 28 },
          [
            text("TheNiceBroker", {
              name: "cover-title",
              width: wrap(760),
              height: hug,
              style: { ...display, fontSize: 104, bold: true, color: C.paper },
            }),
            rule({ name: "cover-rule", width: fixed(220), stroke: C.leaf, weight: 6 }),
            text("An honest AI rental concierge for NoBroker-style marketplaces.", {
              name: "cover-subtitle",
              width: wrap(720),
              height: hug,
              style: { ...baseText, fontSize: 34, color: C.mint },
            }),
            text("Bolna assignment artifact · Full Stack + AI Solutions Engineer + Founder's Office", {
              name: "cover-kicker",
              width: wrap(760),
              height: hug,
              style: { ...baseText, fontSize: 20, color: "#B9CCBF" },
            }),
          ],
        ),
        layers(
          { name: "cover-art", width: fill, height: fill },
          [
            shape({ name: "cover-band", width: fixed(600), height: fill, fill: C.green, line: { fill: C.green, width: 0 } }),
            column(
              { name: "cover-number-stack", width: fill, height: fill, justify: "center", align: "center", gap: 16 },
              [
                text("₹15", {
                  name: "cover-number",
                  width: fill,
                  height: hug,
                  style: { ...display, fontSize: 148, bold: true, color: C.paper, align: "center" },
                }),
                text("AI call estimate", {
                  name: "cover-number-label",
                  width: fill,
                  height: hug,
                  style: { ...baseText, fontSize: 28, bold: true, color: C.mint, align: "center" },
                }),
                text("The wedge: cut RM call load without cutting renter trust.", {
                  name: "cover-number-caption",
                  width: wrap(480),
                  height: hug,
                  style: { ...baseText, fontSize: 24, color: "#D9E8DF", align: "center" },
                }),
              ],
            ),
          ],
        ),
      ],
    ),
    C.ink,
  );
}

function sectionTitle(eyebrow, title, body, columnSpan = 1) {
  return column(
    { name: "title-block", width: fill, height: hug, gap: 12, columnSpan },
    [
      text(eyebrow, {
        name: "eyebrow",
        width: fill,
        height: hug,
        style: { ...baseText, fontSize: 18, bold: true, color: C.green },
      }),
      text(title, {
        name: "slide-title",
        width: wrap(1180),
        height: hug,
        style: { ...display, fontSize: 56, bold: true, color: C.ink },
      }),
      body
        ? text(body, {
            name: "slide-subtitle",
            width: wrap(1220),
            height: hug,
            style: { ...baseText, fontSize: 25, color: C.muted },
          })
        : rule({ name: "title-accent", width: fixed(160), stroke: C.green, weight: 4 }),
    ],
  );
}

function bullet(textValue, accent = C.green) {
  return row(
    { name: `bullet-${textValue.slice(0, 12)}`, width: fill, height: hug, gap: 14, align: "start" },
    [
      shape({ name: "bullet-dot", width: fixed(12), height: fixed(12), fill: accent, line: { fill: accent, width: 0 }, borderRadius: "rounded-full" }),
      text(textValue, {
        name: "bullet-copy",
        width: fill,
        height: hug,
        style: { ...baseText, fontSize: 25, color: C.ink },
      }),
    ],
  );
}

function problemSlide() {
  add(
    grid(
      {
        name: "problem-root",
        width: fill,
        height: fill,
        columns: [fr(1)],
        rows: [auto, fr(1), auto],
        padding: { x: 92, y: 72 },
        rowGap: 52,
      },
      [
        sectionTitle(
          "1 · Enterprise use case",
          "NoBroker rentals are a better voice-AI wedge than builder sales",
          "The agent can be the renter's advocate, not another salesperson.",
        ),
        grid(
          { name: "problem-three", width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], columnGap: 48 },
          [
            problemPoint("Cost center", "Relationship-manager calls scale linearly with rental demand.", "₹200-₹400", C.red),
            problemPoint("Trust gap", "Renters need tradeoffs explained before they commit to visits.", "caveats", C.amber),
            problemPoint("Complex decisions", "Marketplace inventory needs multi-listing comparison across 6-8 axes.", "multi-axis", C.blue),
          ],
        ),
        footer("Company/vertical: NoBroker · Bangalore rentals · inbound concierge"),
      ],
    ),
  );
}

function problemPoint(label, copy, number, accent) {
  return column(
    { name: `problem-${label}`, width: fill, height: fill, gap: 20, justify: "center" },
    [
      text(number, {
        name: `problem-number-${label}`,
        width: fill,
        height: hug,
        style: { ...display, fontSize: 76, bold: true, color: accent },
      }),
      text(label, {
        name: `problem-label-${label}`,
        width: fill,
        height: hug,
        style: { ...baseText, fontSize: 28, bold: true, color: C.ink },
      }),
      text(copy, {
        name: `problem-copy-${label}`,
        width: wrap(450),
        height: hug,
        style: { ...baseText, fontSize: 23, color: C.muted },
      }),
    ],
  );
}

function workflowSlide() {
  add(
    grid(
      {
        name: "workflow-root",
        width: fill,
        height: fill,
        columns: [fr(1)],
        rows: [auto, fr(1), auto],
        padding: { x: 92, y: 72 },
        rowGap: 48,
      },
      [
        sectionTitle("2 · Workflow", "Caller → agent → backend tools → booked visit", "A full-stack flow with the dashboard as the operating surface."),
        row(
          { name: "workflow-chain", width: fill, height: fill, align: "center", justify: "center", gap: 20 },
          [
            flowStep("Renter call", "Needs, budget, language, urgency", C.green),
            arrow(),
            flowStep("Bolna agent", "Advocate prompt + tool calls", C.blue),
            arrow(),
            flowStep("Next.js API", "Search, compare, book, summarize", C.amber),
            arrow(),
            flowStep("Dashboard", "Profile, transcript, visits, ROI", C.red),
          ],
        ),
        footer("Demo route: /inbox → /listings → /visits → /economics"),
      ],
    ),
  );
}

function flowStep(label, copy, accent) {
  return column(
    { name: `flow-${label}`, width: fixed(350), height: fixed(360), justify: "center", gap: 18 },
    [
      shape({ name: "flow-line", width: fixed(110), height: fixed(8), fill: accent, line: { fill: accent, width: 0 } }),
      text(label, { name: "flow-label", width: fill, height: hug, style: { ...display, fontSize: 40, bold: true, color: C.ink } }),
      text(copy, { name: "flow-copy", width: wrap(300), height: hug, style: { ...baseText, fontSize: 22, color: C.muted } }),
    ],
  );
}

function arrow() {
  return text("→", {
    name: "flow-arrow",
    width: fixed(48),
    height: hug,
    style: { ...baseText, fontSize: 44, color: C.line, bold: true, align: "center" },
  });
}

function agentSlide() {
  add(
    grid(
      {
        name: "agent-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1), auto],
        columns: [fr(0.9), fr(1.1)],
        padding: { x: 92, y: 72 },
        rowGap: 42,
        columnGap: 70,
      },
      [
        sectionTitle(
          "3 · Agent design",
          "The trust rule is explicit: never recommend without a caveat",
          "The prompt and listing schema both force honest comparison.",
          2,
        ),
        column(
          { name: "agent-rules", width: fill, height: fill, gap: 26, justify: "center" },
          [
            bullet("Ask one question at a time."),
            bullet("Never invent listings, prices, availability, or owner rules."),
            bullet("Say at least one downside before recommending."),
            bullet("Book visits only after explicit confirmation."),
          ],
        ),
        column(
          { name: "agent-quote", width: fill, height: fill, justify: "center", gap: 20 },
          [
            text("“I will compare the homes calmly and call out tradeoffs too.”", {
              name: "agent-quote-text",
              width: wrap(720),
              height: hug,
              style: { ...display, fontSize: 50, bold: true, color: C.deep },
            }),
            text("That sentence is the product: NoBroker's brand promise expressed as a voice behavior.", {
              name: "agent-quote-sub",
              width: wrap(660),
              height: hug,
              style: { ...baseText, fontSize: 24, color: C.muted },
            }),
          ],
        ),
        footer("Assets: agent/system-prompt.md · agent/tools.json · agent/eval-cases.md", 2),
      ],
    ),
  );
}

function productSlide() {
  add(
    grid(
      {
        name: "product-root",
        width: fill,
        height: fill,
        columns: [fr(1)],
        rows: [auto, fr(1), auto],
        padding: { x: 92, y: 72 },
        rowGap: 38,
      },
      [
        sectionTitle("4 · Web app", "The dashboard solves the human handoff problem", "Operators see not just the lead, but why the agent recommended each home."),
        panel(
          { name: "dashboard-mock", width: fill, height: fill, fill: "#FFFFFF", line: { fill: C.line, width: 1 }, borderRadius: "rounded-lg", padding: 34 },
          grid(
            { name: "dashboard-grid", width: fill, height: fill, columns: [fr(0.8), fr(1.2)], columnGap: 32 },
            [
              column(
                { name: "queue", width: fill, height: fill, gap: 18 },
                [
                  text("Concierge inbox", { name: "mock-title", width: fill, height: hug, style: { ...baseText, fontSize: 24, bold: true } }),
                  leadRow("Aarav Mehta", "Urgent · 86/100 · HSR + Whitefield", C.green),
                  leadRow("Neha Rao", "Bachelor · Indiranagar + Koramangala", C.amber),
                  leadRow("Kiran N", "Family · JP Nagar + BTM", C.blue),
                ],
              ),
              column(
                { name: "detail", width: fill, height: fill, gap: 18 },
                [
                  text("Extracted profile + comparison rationale", { name: "detail-title", width: fill, height: hug, style: { ...baseText, fontSize: 24, bold: true } }),
                  row({ name: "profile-row", width: fill, height: hug, gap: 16 }, [
                    miniFact("Budget", "₹35k-₹48k"),
                    miniFact("Move-in", "June 1"),
                    miniFact("Parking", "car"),
                  ]),
                  text("HSR is brighter and pet-friendly, but more expensive after maintenance. Whitefield is cheaper and close to ITPL, but not pet-friendly.", {
                    name: "detail-copy",
                    width: wrap(760),
                    height: hug,
                    style: { ...baseText, fontSize: 25, color: C.ink },
                  }),
                  row({ name: "detail-actions", width: fill, height: hug, gap: 18 }, [
                    miniFact("Visit", "HSR · 5:30 PM"),
                    miniFact("Summary", "sent/logged"),
                  ]),
                ],
              ),
            ],
          ),
        ),
        footer("Dashboard pages: inbox, listing comparison, visits, unit economics"),
      ],
    ),
  );
}

function leadRow(name, detail, accent) {
  return row(
    { name: `lead-${name}`, width: fill, height: fixed(94), gap: 18, align: "center" },
    [
      shape({ name: "lead-mark", width: fixed(8), height: fixed(70), fill: accent, line: { fill: accent, width: 0 } }),
      column({ name: "lead-copy", width: fill, height: hug, gap: 6 }, [
        text(name, { name: "lead-name", width: fill, height: hug, style: { ...baseText, fontSize: 24, bold: true } }),
        text(detail, { name: "lead-detail", width: fill, height: hug, style: { ...baseText, fontSize: 18, color: C.muted } }),
      ]),
    ],
  );
}

function miniFact(label, value) {
  return column(
    { name: `mini-${label}`, width: grow(1), height: fixed(86), justify: "center", gap: 4 },
    [
      text(label, { name: "mini-label", width: fill, height: hug, style: { ...baseText, fontSize: 16, color: C.muted } }),
      text(value, { name: "mini-value", width: fill, height: hug, style: { ...baseText, fontSize: 24, bold: true, color: C.ink } }),
    ],
  );
}

function comparisonSlide() {
  add(
    grid(
      {
        name: "comparison-root",
        width: fill,
        height: fill,
        columns: [fr(1)],
        rows: [auto, fr(1), auto],
        padding: { x: 92, y: 72 },
        rowGap: 36,
      },
      [
        sectionTitle("5 · Comparison engine", "A ranking is weaker than a transparent matrix", "The caller hears a recommendation and the reason it might be wrong for them."),
        table({
          name: "comparison-table",
          width: fill,
          height: fill,
          rows: 6,
          columns: 4,
          values: [
            ["Axis", "HSR Sector 2", "Whitefield ITPL", "Electronic City"],
            ["Monthly cost", "₹46.5k", "₹31k", "₹35k"],
            ["Parking", "car + bike", "car", "both"],
            ["Pet rule", "friendly", "not friendly", "friendly"],
            ["Commute note", "ORR convenient", "ITPL walkable", "commute risk"],
            ["Honest caveat", "maintenance extra", "traffic outside Whitefield", "farther from HSR"],
          ],
          style: "Medium Style 2 - Accent 3",
        }),
        footer("Mock data today · real provider tomorrow through the InventoryProvider interface"),
      ],
    ),
  );
}

function architectureSlide() {
  add(
    grid(
      {
        name: "architecture-root",
        width: fill,
        height: fill,
        columns: [fr(1)],
        rows: [auto, fr(1), auto],
        padding: { x: 92, y: 72 },
        rowGap: 48,
      },
      [
        sectionTitle("6 · Architecture", "Mock-data assignment, real-data-ready product", "No scraping. The data source is a provider swap, not a rewrite."),
        grid(
          { name: "arch-grid", width: fill, height: fill, columns: [fr(1), fixed(70), fr(1), fixed(70), fr(1)], columnGap: 20 },
          [
            archBlock("Bolna", "Voice, prompt, tool calling", C.green),
            arrow(),
            archBlock("Next.js + API", "Webhook receiver + function routes", C.blue),
            arrow(),
            archBlock("Provider + DB", "InventoryProvider, comparison engine, Neon", C.amber),
          ],
        ),
        footer("Future feeds: NoBroker partnership · Housing.com · 99acres · consented community data"),
      ],
    ),
  );
}

function archBlock(label, copy, accent) {
  return column(
    { name: `arch-${label}`, width: fill, height: fill, justify: "center", gap: 22 },
    [
      shape({ name: "arch-rule", width: fixed(160), height: fixed(8), fill: accent, line: { fill: accent, width: 0 } }),
      text(label, { name: "arch-label", width: fill, height: hug, style: { ...display, fontSize: 48, bold: true, color: C.ink } }),
      text(copy, { name: "arch-copy", width: wrap(410), height: hug, style: { ...baseText, fontSize: 24, color: C.muted } }),
    ],
  );
}

function economicsSlide() {
  add(
    grid(
      {
        name: "economics-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1), auto],
        columns: [fr(1.05), fr(0.95)],
        padding: { x: 92, y: 72 },
        rowGap: 42,
        columnGap: 64,
      },
      [
        sectionTitle("7 · Success matrix", "Cost per qualified visit is the clean metric", "The agent wins only if it lowers call cost while preserving trust and visit quality.", 2),
        column(
          { name: "economics-copy", width: fill, height: fill, justify: "center", gap: 26 },
          [
            text("₹31.8L", { name: "savings-number", width: fill, height: hug, style: { ...display, fontSize: 92, bold: true, color: C.green } }),
            text("projected monthly savings at 12,000 rental calls", { name: "savings-label", width: wrap(620), height: hug, style: { ...baseText, fontSize: 28, color: C.ink, bold: true } }),
            bullet("Primary: % qualified calls with ≥1 booked visit.", C.green),
            bullet("Guardrails: show-up rate, complaint rate, summary accepted, caveat disclosed.", C.amber),
          ],
        ),
        chart({
          name: "cost-chart",
          chartType: "bar",
          width: fill,
          height: fill,
          config: {
            title: { text: "Cost per qualified call" },
            categories: ["RM baseline", "AI concierge"],
            series: [{ name: "INR", values: [280, 15] }],
          },
        }),
        footer("Assumption for demo: RM call ₹280 midpoint; AI call ₹15 voice + infra estimate", 2),
      ],
    ),
  );
}

function submissionSlide() {
  add(
    grid(
      {
        name: "submission-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1), auto],
        columns: [fr(1), fr(1)],
        padding: { x: 92, y: 72 },
        rowGap: 44,
        columnGap: 72,
      },
      [
        sectionTitle("8 · Submission plan", "One artifact, three assignment frames", "Full Stack is the superset; AISE and Founder's Office use the same agent and success matrix.", 2),
        column(
          { name: "submit-left", width: fill, height: fill, gap: 24 },
          [
            text("What gets submitted", { name: "submit-left-title", width: fill, height: hug, style: { ...display, fontSize: 42, bold: true } }),
            bullet("Agent link + Agent ID + best call recording", C.green),
            bullet("GitHub repo + deployed app link", C.blue),
            bullet("Screen recording: user → app → agent → backend → output", C.amber),
            bullet("Copy-paste success answers from docs/SUBMISSION_ANSWERS.md", C.red),
          ],
        ),
        column(
          { name: "submit-right", width: fill, height: fill, gap: 24 },
          [
            text("Expansion story", { name: "submit-right-title", width: fill, height: hug, style: { ...display, fontSize: 42, bold: true } }),
            bullet("NoBroker rentals → sales → home services.", C.green),
            bullet("Next 5: Housing.com, 99acres, MagicBricks, Square Yards, Stanza/Colive.", C.blue),
            bullet("Standalone product stays trademark-safe as TheNiceBroker.", C.amber),
          ],
        ),
        footer("Drive folder target: Sharat_FSE@bolna", 2),
      ],
    ),
  );
}

function footer(copy, columnSpan = 1) {
  return text(copy, {
    name: "footer",
    width: fill,
    height: hug,
    columnSpan,
    style: { ...baseText, fontSize: 15, color: C.muted },
  });
}

titleSlide();
problemSlide();
workflowSlide();
agentSlide();
productSlide();
comparisonSlide();
architectureSlide();
economicsSlide();
submissionSlide();

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save("output/output.pptx");
