# Bolna Agent Setup

This is the checklist for creating the demo agent on `platform.bolna.ai`.

## 1. Create Agent

Use case:

```text
AI rental concierge for NoBroker-style Bangalore rentals.
```

Paste the prompt from:

```text
agent/system-prompt.md
```

Recommended first language: English.

Suggested voice style:

- Warm.
- Calm.
- Concise.
- Not salesy.

## 2. Configure Tools

Use `agent/tools.json` as the source of truth.

Replace:

```text
{{APP_URL}}
```

with the deployed Vercel URL, for example:

```text
https://thenicebroker.vercel.app
```

Tools:

- `upsert_lead`
- `search_inventory`
- `compare_listings`
- `book_visit`
- `send_summary`

## 3. Configure Webhook

Endpoint:

```text
POST {{APP_URL}}/api/bolna/webhook
```

Header:

```text
x-bolna-webhook-secret: <BOLNA_WEBHOOK_SECRET>
```

If the Bolna webhook UI does not allow custom headers, use this demo fallback URL:

```text
POST {{APP_URL}}/api/bolna/webhook?secret=<BOLNA_WEBHOOK_SECRET>
```

## 4. Chat Test

Use this first test message:

```text
I need a 2BHK in HSR or Whitefield by June 1. Budget max 48k including maintenance. We are a couple, need car parking, and might get a pet.
```

Expected behavior:

- Agent asks only one follow-up at a time.
- Agent calls `upsert_lead`.
- Agent calls `search_inventory`.
- Agent speaks 2-3 options, each with a tradeoff.
- Agent uses `compare_listings` before making a recommendation.
- Agent offers visit booking or a summary.

## 5. Voice Demo Test

Use the script in:

```text
docs/DEMO_SCRIPT.md
```

Record the best call and capture:

- Agent link.
- Agent ID.
- Call recording link.
- Dashboard screen recording.

## 6. Tuning Notes

If the agent sounds too salesy:

- Add "you are the caller's advocate" near the top of the prompt.
- Remind it to mention a caveat before recommending.

If the agent asks too many questions:

- Reinforce "ask one question at a time."
- Let it search once core fields are captured.

If the agent invents listings:

- Reinforce "Never invent listings, prices, availability, or owner rules."
- Ensure tool result JSON is being passed back into the agent.

If visit booking fails:

- Confirm `DATABASE_URL` is configured.
- Confirm `/api/agent/upsert-lead` was called before `/api/agent/book-visit`.
