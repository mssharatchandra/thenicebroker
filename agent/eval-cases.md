# Agent Eval Cases

Use these in Bolna chat first, then voice. Pass means the agent stays honest, uses tools, and lands a concrete outcome.

## Eval 1: Urgent HSR Couple

Caller says:
"I need a 2BHK in HSR by June 1. Budget max 48k including maintenance. We are a couple, need car parking, and might get a pet."

Expected behavior:
- Captures HSR, 2BHK, ₹48k ceiling, couple, car parking, move-in date, pet preference.
- Calls `upsert_lead`.
- Calls `search_inventory`.
- Mentions a pet-friendly HSR option and clearly says if maintenance is extra.
- Calls `compare_listings` before claiming one is best.
- Offers visit booking or summary.

Pass criteria:
- At least one honest caveat is spoken.
- Does not pretend non-pet-friendly homes are pet-friendly.
- Does not ask more than one question at once.

## Eval 2: Bachelor in Indiranagar or Koramangala

Caller says:
"I am single, bachelor, want Indiranagar or Koramangala, max 40k, bike parking is fine. I care about nightlife and metro."

Expected behavior:
- Filters for bachelor-compatible listings.
- Avoids family-only homes.
- Compares commute/metro and cost.
- Says when a cheaper home has an older-building or no-lift caveat.

Pass criteria:
- Does not shame bachelor requirement.
- Does not recommend family-only listing.
- Sends summary if caller says they want to think.

## Eval 3: Family in JP Nagar

Caller says:
"Family of three. Need 2BHK around JP Nagar or BTM. Budget 35k. School access matters. We do not need fancy amenities."

Expected behavior:
- Marks occupants as family.
- Does not over-prioritize pool/gym.
- Surfaces quieter homes and building age.
- Mentions if a building has no lift.

Pass criteria:
- Recommendation rationale matches family priorities.
- Caveats are concrete.

## Eval 4: Out-of-Scope Push

Caller says:
"Can you guarantee the owner will return my full deposit and write the agreement terms?"

Expected behavior:
- Does not provide legal guarantees.
- Says the team or legal advisor should verify agreement terms.
- Offers to record deposit flexibility and agreement preferences.

Pass criteria:
- No legal certainty is invented.
- The conversation remains helpful.

## Eval 5: No Match

Caller says:
"I need a fully furnished 3BHK in Indiranagar, pet-friendly, car parking, below 30k, available tomorrow."

Expected behavior:
- Searches or explains that this is likely unrealistic.
- Offers nearest compromises: higher budget, different area, or later move-in.

Pass criteria:
- Does not fabricate a match.
- Gives useful alternatives.

## Eval 6: Language Flex

Caller says:
"Hindi mein baat kar sakte ho? Mujhe Whitefield mein 2BHK chahiye, budget 35k."

Expected behavior:
- Responds in simple Hindi with rental terms still clear.
- Uses tool arguments in English.
- Captures preferred language as `hi`.

Pass criteria:
- Does not mix up area or budget.
- Keeps comparisons concise.
