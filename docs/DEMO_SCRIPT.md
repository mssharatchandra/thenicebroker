# Demo Script

## Recording Goal

Show the full assignment flow:

```text
User -> Bolna agent -> backend tools -> dashboard output
```

Recommended recording length: 4-6 minutes.

## Screen Recording Structure

1. Open the deployed dashboard at `/inbox`.
2. Show the current concierge inbox.
3. Start the Bolna demo call.
4. Speak the renter script below.
5. Let the agent search and compare listings.
6. Book one visit.
7. End the call.
8. Refresh the dashboard and show the call/lead/visit.
9. Open `/listings` to show the comparison matrix.
10. Open `/economics` to show the success metric.

## Caller Script

Use this during the demo call:

```text
Hi, I am moving to Bangalore with my partner. We need a 2BHK in HSR Layout or Whitefield, ideally before June 1. Budget is around 45 to 48 thousand including maintenance. Car parking is important, semi-furnished is fine, and we might get a dog later.
```

If the agent asks for priority:

```text
Commute and not getting surprised by extra costs matter most. I do not want to be pushed into a bad option.
```

When the agent presents options:

```text
Can you compare the HSR option and the Whitefield option clearly?
```

When the agent asks next step:

```text
Please book the HSR one tomorrow at 5:30 PM, and send me the comparison summary.
```

## What the Agent Should Demonstrate

- Extracts requirements naturally.
- Calls backend tools.
- Compares multiple listings across cost, commute, parking, availability, pet rules, and caveats.
- Says the downside of each listing.
- Books a visit only after explicit confirmation.
- Sends/logs a summary.

## What to Say in the Screen Recording

Use this narration:

```text
This is TheNiceBroker, an AI rental concierge built for a marketplace like NoBroker. The problem is that rental marketplaces spend heavily on relationship-manager calls, but renters still do not fully trust recommendations. This agent acts as the renter's advocate. It extracts requirements, searches inventory, compares multiple homes honestly, books visits, and leaves a dashboard trail for human operators.
```

At `/listings`:

```text
The key product choice is honest comparison. The agent does not just say "best match"; it compares total monthly cost, deposit, parking, carpet area, lift, commute, and move-in date. Every listing has caveats, so the trust behavior is enforced in the data model too.
```

At `/economics`:

```text
The success metric is cost per qualified visit. We compare a relationship-manager call at roughly ₹200 to ₹400 with an AI call at roughly ₹15, then track the percentage of calls that produce a booked visit and the quality of those visits.
```

## Submission Artifacts

For the Full Stack assignment folder `Sharat_FSE@bolna`, upload:

- Deck.
- Screen recording.
- Best Bolna call recording.
- Agent prompt.
- Agent ID and link.
- GitHub repo link.
- Deployed app link.

For AI Solutions Engineer and Founder's Office forms, submit:

- Agent link.
- Agent ID.
- Call recording.
- Prompt.
- Section 4 success matrix answers from `docs/SUBMISSION_ANSWERS.md`.
