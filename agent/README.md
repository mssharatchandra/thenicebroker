# Bolna Agent Assets

Paste `system-prompt.md` into the Bolna agent builder, then configure the HTTP tools in `tools.json` against the deployed app URL.

For local testing with a tunnel, replace `{{APP_URL}}` with the HTTPS tunnel URL that points to `pnpm dev`.

Recommended voice demo:

- Caller: renter looking for 2BHK in HSR or Whitefield.
- Requirement set: ₹45k-₹48k budget, couple, car parking, move-in before June 1, possible pet later.
- Expected outcome: agent compares HSR vs Whitefield honestly, books one visit, sends summary.

Artifacts:

- `system-prompt.md`: final prompt to paste into the form.
- `tools.json`: HTTP tool contract.
- `conversation-flow.md`: expected call flow and demo script.
- `eval-cases.md`: chat/voice cases for agent tuning.
