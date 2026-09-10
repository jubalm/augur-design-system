# Control language — Button, Input, FormField — issue #51

Rendered evidence for the restrained control language: 0px controls
(FD-03 encoded), spacing from the encoded tokens, FD-02 heights
(32/36/40) retained, primary-vs-secondary intent and equal-choice
neutrality in both themes.

## What changed

- `button.css`: radius → `--augur-rounded-control` (0px); paddings/gap
  → spacing tokens; heights remain the adopted 32/36/40 constants.
- `input.css`: radius → control token; padding tokenized.
- `form-field.css`: composition gaps → spacing tokens.
- Header comments updated Proposed → encoded/adopted.
- Registry regenerated (`registry:check` no drift); package contract
  tests 70/70 (states, loading/disabled handling, field associations,
  interaction tests all unchanged and passing).
- Mobile fit: input and form-field pages captured at 390px — long
  helper/error text wraps inside the grid rows with no overflow
  (driver asserts no horizontal overflow page-wide at 375/390).

## Captures

button light/dark 1440; input light 1440 + 390; form-field light 1440
+ 390.

## Reproduce

```sh
bun run --cwd apps/docs build
bun run test:browser
bun run --cwd packages/design-system registry:check
```
