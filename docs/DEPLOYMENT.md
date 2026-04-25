# Deployment

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

The dashboard works without `DATABASE_URL` by showing demo data. Tool routes that need persistence return `database_not_configured` until Neon is configured.

## Environment Variables

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
BOLNA_WEBHOOK_SECRET=replace-with-a-long-random-secret
BOLNA_AGENT_ID=optional-until-agent-created
BOLNA_API_KEY=optional-until-outbound-calls-are-added
```

## Neon

1. Create a Neon project.
2. Copy the pooled connection string.
3. Put it in `.env.local` and in Vercel as `DATABASE_URL`.
4. Apply the schema:

```bash
pnpm db:push
```

## Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Set environment variables.
4. Deploy.
5. Use the deployed URL as `{{APP_URL}}` in `agent/tools.json`.

## Bolna Webhook

Configure Bolna to send lifecycle events to:

```text
https://your-vercel-domain.vercel.app/api/bolna/webhook
```

Set a shared secret header:

```text
x-bolna-webhook-secret: <BOLNA_WEBHOOK_SECRET>
```

The app also accepts:

- `x-webhook-secret`
- `Authorization: Bearer <BOLNA_WEBHOOK_SECRET>`

## Smoke Test

After deploy:

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/agent/search \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "areas": ["HSR Layout", "Whitefield"],
      "bhk": [2],
      "budget_max_inr": 48000,
      "occupants": "couple",
      "parking_needed": "car",
      "limit": 3
    }
  }'
```

Expected: JSON with `ok: true` and 1-3 listings.

## Production Notes

- Replace the dev webhook secret before any public demo.
- Keep mock data clearly labeled in the assignment deck.
- Wire a real SMS/WhatsApp provider behind `send_summary` after the assignment.
- Add auth before using the dashboard with real renter data.
