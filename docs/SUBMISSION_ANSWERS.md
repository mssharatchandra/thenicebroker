# Submission Answers

Use this file as the copy-paste source for the Bolna assignment forms.

## Company and Vertical

Company: NoBroker.

Vertical: Inbound rental concierge for Bangalore rentals.

Use case: A renter calls NoBroker looking for a rental home. The Voice AI agent extracts the renter's requirements, searches available rental inventory, compares 2-3 homes across practical decision axes, books visits, and sends a written comparison summary.

Why this company: NoBroker has a clear "no broker" brand promise and a relationship-manager-heavy rental workflow. A voice AI concierge can reduce call cost while making the renter feel represented rather than sold to.

## Problem Definition

Renters struggle to compare homes across messy tradeoffs: total monthly cost, deposit, commute, parking, furnishing, floor/lift, building age, owner restrictions, society rules, and move-in date. Relationship managers can help, but the process is expensive and inconsistent at marketplace scale.

TheNiceBroker solves this by giving NoBroker a voice-first rental concierge that:

- Captures renter requirements conversationally.
- Searches inventory through backend tools.
- Compares homes honestly across multiple axes.
- Highlights downsides before recommending.
- Books visits.
- Sends a written summary.
- Leaves a structured dashboard trail for operators.

## Workflow

1. User calls the Bolna agent.
2. Agent captures requirements and updates the lead profile.
3. Agent calls `search_inventory`.
4. Agent reads top options with fit reasons and caveats.
5. Agent calls `compare_listings`.
6. Agent compares practical tradeoffs out loud.
7. User chooses a listing and slot.
8. Agent calls `book_visit`.
9. Agent calls `send_summary`.
10. Dashboard shows call transcript, extracted profile, comparison, visit, and unit economics.

## Outcome Metric

Primary success metric: percentage of qualified calls that lead to at least one booked visit.

Business metric: cost per qualified visit.

Quality guardrails:

- Visit show-up rate.
- Complaint rate.
- Summary-sent rate.
- Profile completion rate.
- Percentage of recommendations where at least one caveat was disclosed.

## What Would Success Mean for NoBroker?

Success means NoBroker can handle more rental inquiries at lower cost while improving user trust.

Quantitatively:

- Reduce relationship-manager call load.
- Lower cost per qualified rental call from roughly ₹200-₹400 to about ₹15 AI call cost.
- Increase percentage of calls that produce a booked visit.
- Improve speed-to-first-recommendation.
- Capture structured renter preferences for follow-up.

Qualitatively:

- Renters feel the agent is on their side.
- Recommendations feel transparent because tradeoffs are spoken clearly.
- Human operators get a better handoff when they need to step in.

## If NoBroker Loves the Agent, What Are Next Steps?

Next step 1: Pilot in one city and one workflow.

- Start with Bangalore rentals.
- Route a limited percentage of inbound rental calls to the agent.
- Compare AI-assisted calls against the relationship-manager baseline.

Next step 2: Connect real NoBroker inventory and CRM.

- Replace the mock inventory provider with NoBroker's real listing feed.
- Write lead profiles and visit bookings into NoBroker's internal systems.
- Add owner/society confirmation tools.

Next step 3: Expand across rental workflows.

- Follow-up calls for users who did not book.
- Visit reminders.
- No-show recovery.
- Owner-side availability confirmation.

Next step 4: Expand across NoBroker's existing P&L lines.

- Sales qualification.
- Packers and movers.
- Painting.
- Legal services.
- Tenant plans and home services.

## Case Study to Create

Case study title:

```text
How a rental marketplace reduced RM call load with an honest AI rental concierge
```

Case study story:

NoBroker receives high rental inquiry volume. Instead of a sales-style bot, we deployed a voice concierge that acts as the renter's advocate. The agent collected requirements, searched inventory, compared multiple homes honestly, booked visits, and sent summaries. The dashboard gave operators extracted profiles, transcript, comparison rationale, and visit status.

Metrics to highlight:

- Cost per qualified call.
- Call-to-visit conversion.
- Visit show-up rate.
- Average handling time.
- Percentage of calls with complete profile.
- User trust proxy: summary accepted / complaint rate.

## Next Five Clients

- Housing.com.
- 99acres.
- MagicBricks.
- Square Yards.
- Stanza Living / Colive.

## Full Stack Assignment Summary

Real enterprise use case:

```text
NoBroker rental concierge: voice AI for inbound rental inquiries.
```

Problem:

```text
Rental users need help comparing multiple listings honestly, while marketplaces spend heavily on relationship-manager calls.
```

Workflow:

```text
User -> Bolna voice agent -> Next.js API tools -> inventory provider + comparison engine -> Postgres -> dashboard -> booked visit and summary.
```

Outcome metric:

```text
Cost per qualified visit, with call-to-visit conversion and trust guardrails.
```

Web app:

```text
Concierge inbox, extracted renter profiles, listing comparison matrix, booked visits, and unit economics.
```
