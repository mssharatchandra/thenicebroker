# Assignment Deck

Final deck:

```text
docs/deck/thenicebroker-bolna-assignment.pptx
```

Preview contact sheet:

```text
docs/deck/previews/montage.png
```

The editable deck source used to generate the PPTX is preserved at:

```text
docs/deck/source/create-deck.mjs
```

QA performed:

- Exported through `@oai/artifact-tool`.
- PPTX package inspection passed: 9 slides, 1 native chart, no placeholder text, no zero-byte media.
- Re-imported saved PPTX and checked slide/frame bounds: no out-of-bounds text or shapes detected.
