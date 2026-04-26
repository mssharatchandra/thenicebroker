# Bolna Agent Setup

This is the checklist for creating the demo agent on `platform.bolna.ai`.

## 0. Before Bolna

Add these env vars in Vercel, then redeploy. A deployment that started before env vars were added will not have them.

```text
DATABASE_URL=<Neon pooled Postgres URL>
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
BOLNA_WEBHOOK_SECRET=<long random string>
BOLNA_AGENT_ID=<fill after creating the agent, optional>
BOLNA_API_KEY=<optional; not needed for this inbound demo>
```

The local Neon schema has already been pushed. For a fresh database, run:

```bash
pnpm db:push
```

## 1. Agent Tab

Name:

```text
TheNiceBroker - NoBroker Rental Concierge
```

Welcome message:

```text
Hi, I am TheNiceBroker. I will help you compare Bangalore rentals honestly, including tradeoffs. What kind of home are you looking for?
```

Primary language: English. Add Hindi as a secondary language only if you want to demonstrate Hindi during the call.

Paste the full prompt from `agent/system-prompt.md` into **Agent Prompt**.

Settings:

- Timezone: `Asia/Kolkata`
- Hangup using prompt: off for the demo
- Save after every tab change

Suggested voice style:

- Warm.
- Calm.
- Concise.
- Not salesy.
- Indian English is ideal.

## 2. LLM / Audio / Engine / Call Tabs

Use the cheapest low-latency model available in your workspace. Keep temperature around `0.2` to `0.3`.

Keep responses concise. Enable interruptions/barge-in if available so the call feels natural.

Do not buy a phone number for the assignment. Use chat testing first, then **Test via browser** or one verified-number call for the final recording.

## 3. Configure Tools

Use `agent/bolna-custom-functions.json` if Bolna lets you paste a full custom function JSON. Use `agent/tools.json` as the human-readable fallback if you need to fill the UI field-by-field.

Both files use flat parameters because they are easier to enter in Bolna's tool builder. The API also accepts nested JSON if needed.

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

For each tool:

- Type: custom function/API tool
- Method: `POST`
- Header: `Content-Type: application/json`
- Body/schema: copy from the matching tool in `agent/tools.json`
- For `call_id`, set the value to `{call_sid}` if Bolna exposes context variables in your tool UI

## 4. Configure Webhook

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

## 5. $5 Budget Plan

- Do not buy a number.
- Do not run batches or campaigns.
- Do 90% of testing with **Chat with agent**.
- Use one short browser/verified-number dry run.
- Use one final 3-4 minute recorded call.
- Watch the per-minute estimate in the agent header before calling.
- Use a cheap LLM, a standard transcriber, and a standard voice.

## 6. Chat Test

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

## 7. Voice Demo Test

Use the script in:

```text
docs/DEMO_SCRIPT.md
```

Record the best call and capture:

- Agent link.
- Agent ID.
- Call recording link.
- Dashboard screen recording.

## 8. Tuning Notes

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
