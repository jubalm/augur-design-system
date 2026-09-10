# Reference record — issue #52 (contract frame C)

Rendered evidence for the reference-record pattern: the approved record
composition assembled from package components and static, source-
grounded fixture content. Comparison sources: PDF physical pages 20
(equal light/dark query records), 23 (record spacing/state), 25
(compact record with restrained signal) — rendered at
[`../visual-alignment/evidence/source/`](../visual-alignment/evidence/).
Screenshots below are annotated against those pages in the page's
"Anatomy and rules" section.

## Composition

- Muted outer field, lifted square panel (0px, control-edge border) —
  panel padding 24px → 16px below 600px via encoded tokens.
- State rail first: 32×2 signal (`--primary`: Deep light / Green dark)
  + explicit "Open" state label.
- The question ("Vote on this query", heading-1 role) is the first
  substantive focal point, larger than every label around it.
- Two equal choices (same variant, equal flex widths); the recorded
  choice carries `aria-pressed` — no extra visual rank.
- Explicit quiet response ("Yes — recorded 14:32 UTC") and query
  identity in body/metadata roles.
- The pair pins one light and one dark panel: identical content, order,
  geometry under either host theme.
- No product submission workflow; no improvised artwork (driver asserts
  no img/svg outside the EmptyStateIcon decorative slot across all
  pattern examples).

PageHeader and EmptyState no-action/long-content examples remain
unchanged and asserted: hierarchy and accessibility preserved
(driver audits + example-render checks on every pattern route).

## Captures

record pair light 1440, dark 1440, light 390 (choices side by side, no
overflow).

Computed assertions in `the browser suite`, section "Reference record
(#52)": pair themes/geometry/backgrounds, 32×2 signals with correct
theme colors, question DOM order and heading-1 scale, choice equality,
aria-pressed marking, response copy, no-artwork rule, mobile layout —
both base paths.

## Reproduce

```sh
bun run --cwd apps/docs build
bun run test:browser
```
