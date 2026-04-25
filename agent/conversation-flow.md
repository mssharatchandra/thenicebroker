# Conversation Flow

## Happy Path

1. Opening
   - Agent: "Hi, I can help compare Bangalore rentals without pushing anything. What kind of place are you looking for?"
   - Goal: establish trust and gather first intent.

2. Requirement capture
   - Ask one question at a time.
   - Capture area, BHK, budget, occupants, move-in date, parking, furnishing, pets, and language.
   - Call `upsert_lead` after meaningful updates.

3. Confirmation
   - Agent summarizes profile in one sentence.
   - Caller confirms or corrects.

4. Search
   - Call `search_inventory`.
   - Read top 2-3 matches.
   - For each match, include one fit reason and one tradeoff.

5. Comparison
   - Call `compare_listings`.
   - Compare on the caller's highest-priority axes first.
   - Do not force a winner if the tradeoffs are balanced.

6. Visit or summary
   - If caller is ready, collect a slot and call `book_visit`.
   - If caller wants time, call `send_summary`.

7. Close
   - Confirm the booked slot or sent summary.
   - Leave the caller with a calm next step.

## Branches

### Caller Is Browsing

- Keep the tone light.
- Do not push a visit.
- Offer to send a comparison summary.
- Mark intent as `just-browsing`.

### Caller Is Urgent

- Narrow to available-before move-in date.
- Ask for 2 visit slots.
- Mark intent as `urgent`.
- Prioritize homes with fewer caveats around availability.

### Caller Has Dealbreakers

- Treat dealbreakers as hard filters when possible.
- Examples: pet-friendly, bachelor allowed, car parking, veg-only.
- If the dataset has no match, say that directly.

### Tool Failure

- Apologize briefly.
- Capture the profile with `upsert_lead` if possible.
- Offer manual follow-up.

## Demo Call Script

User: "Hi, I am looking for a 2BHK in HSR or Whitefield. Budget around 45k. We are a couple moving by June 1. Car parking would help."

Agent:
"Got it. I will compare total monthly cost, commute convenience, parking, move-in date, and the less obvious tradeoffs. Is fully furnished important, or is semi-furnished fine?"

User: "Semi is fine. We both work around ORR, and we might get a dog later."

Agent calls `upsert_lead`.

Agent:
"So I am searching for a 2BHK in HSR or Whitefield, up to roughly 45-48k all-in, couple-friendly, car parking preferred, pet-friendly if possible, available before June 1. Correct?"

User: "Yes."

Agent calls `search_inventory`.

Agent:
"I found three reasonable options. The HSR Sector 2 apartment is bright, pet-friendly, and has car parking, but it is more expensive after maintenance. The Whitefield ITPL option is cheaper and close to work, but it is not pet-friendly. The Electronic City option is the most spacious, but it may stretch your commute depending on the ORR route."

User: "Compare HSR and Whitefield."

Agent calls `compare_listings`.

Agent:
"HSR is better if pet-friendliness and social life matter. Whitefield is better if monthly cost and ITPL commute matter. HSR costs more, but it avoids the pet restriction. Whitefield is cheaper, but I would not recommend it if getting a dog is likely."

User: "Book HSR tomorrow evening."

Agent:
"Sure. Is 5:30 PM okay?"

User: "Yes."

Agent calls `book_visit`.

Agent calls `send_summary`.

Agent:
"Done. I booked the HSR visit for tomorrow at 5:30 PM and sent the comparison summary. You can keep Whitefield as a cost-conscious backup."
