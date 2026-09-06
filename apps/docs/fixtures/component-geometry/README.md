# Component geometry — Card and Dialog — issue #50

Rendered evidence for Card and Dialog in the approved crisp panel and
rule language: 0px surfaces and controls (FD-03, encoded #45), panel
padding from the encoded spacing tokens (24px, 16px below 600px), and
the established tonal hierarchy (Muted/White field, Surface 1/2 dark
panels, control edges distinct from editorial separators).

## What changed

- `card.css`: radius consumes `--augur-rounded-surface` (0px);
  composition paddings/gaps consume `--augur-spacing-*` tokens; panel
  padding steps 24px → 16px below 600px per the contract's panel rule.
- `dialog.css`: panel and close-control radii consume the encoded
  tokens; padding/gap tokenized.
- Registry regenerated against the updated sources (`registry:check`
  no drift); the package contract tests (70/70) accept the changes.
- Card stays a neutral reusable surface — no product record behavior,
  no mandatory accent. Dialog a11y/interaction coverage (keyboard,
  containment, dismissal, scroll lock, focus restoration, dark portal,
  reduced motion, mobile long content) re-run green.
- Rhythm isolation: #44's bare-host-vs-docs parity assertions continue
  to pass, proving the prose host cannot move Card internals.

## Captures

card example light/dark 1440 + light 390 (16px padding step); dialog
panel light/dark 1440; long-content dialog at 390.

## Reproduce

```sh
bun run --cwd apps/docs build
bun apps/docs/fixtures/verify-docs.mjs
bun run --cwd packages/design-system registry:check
```
