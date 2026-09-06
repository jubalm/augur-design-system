# Type specimen — issue #48

Rendered evidence for the typography page as contract frame B
(editorial specimen of the two Augur voices). Comparison sources: PDF
physical pages 22/23 (regular/light specimens, semibold display
hierarchy, tracked labels), rendered at
[`../visual-alignment/evidence/source/`](../visual-alignment/evidence/).

## Composition

- 2:1 main/support grid: the main column holds the dominant inverse
  display field — the page's sole large tonal field, Navy/Paper swapped
  by the theme contract — over a compact, aligned ten-role comparison
  (sample rendered through its real role class + exact spec line).
- Three rule-led support notes (primary voice / supporting voice / one
  clear priority); support headings step to 20/26 regular below 960px
  per the frame B rule; the grid stacks specimen-first on narrow
  screens.
- No false weights: every sample renders through its package role
  class (display 600, editorial roles 400), so displayed specs and
  computed styles cannot disagree. Samples are `div`s so prose
  line-height cannot distort the demonstrated values (#45).
- The substantive guide (voices in code, order/numerals, loading,
  provenance) remains on the page and in the clean Markdown export.

## Captures

light 1440, dark 1440, light 390 full pages.

Computed assertions in `verify-docs.mjs`, section "Type specimen
(#48)": ten aligned rows, inverse field colors in both themes, display
sample computed 600/40px, three notes, 2:1 grid at 1440, stack order
and overflow at 390 — both base paths.

## Reproduce

```sh
bun run --cwd apps/docs build
bun apps/docs/fixtures/verify-docs.mjs
```
