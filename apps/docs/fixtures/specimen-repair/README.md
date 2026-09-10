# Specimen rendering repair — issue #44

Before/after evidence for the #44 repair of docs specimen rendering.
The defect, its cause, and the fix are recorded here so later alignment
work does not confuse the repaired rendering defects with creative
choices.

## Defect (observed at commit `56cb770`, before)

`apps/docs/src/styles/docs.css` contained two unclosed rule blocks —
after `.prose .aug-page-header-breadcrumb [aria-current="page"] {` and
after `.example-form-field-column {`. Under CSS nesting, every rule
after each unclosed brace parsed as a descendant of those selectors, so:

- palette chips matched only inside a form-field column and rendered
  `display: inline; width: auto; height: auto` (painted `0x20`) on
  `/foundations/color`;
- input/form-field example styles only applied inside breadcrumb
  current-page descendants.

Independently, nothing stopped the editorial prose selectors
(`.prose h1–h4`, `.prose p`, `.prose li`, `.prose ul/ol`, `.prose a`)
from descending into `.doc-example-preview`, so package components
computed docs-chrome values instead of their own: Card title 19px with a
42.75px top margin (role: 20px, margin 0), Card description line-height
19.8px (role: 16px), PageHeader title 24px (role: 28px), breadcrumb list
indented 24px with 6px vertical offsets between crumbs. A scoped
breadcrumb link-color mirror in `docs.css` had been masking the `.prose a`
tie for crumbs only.

Exact observed values: [`before-computed.json`](evidence/before-computed.json).
Rendered before captures: `evidence/before-*.png` (color light/dark at
1440×1000, color light at 390×844, card and page-header examples at
1440×1000).

## Fix

1. Closed both blocks; removed the now-redundant breadcrumb mirror (an
   override copy whose justification was the leak itself).
2. Scoped the leaking prose selectors with complex `:not()
   (.doc-example-preview …)` exclusions so editorial styles stop at the
   preview boundary and the package stylesheet alone governs component
   internals. The exclusion argument raises those selectors'
   specificity — intentional: prose rules keep winning over bare
   editorial elements exactly as before, while classed package
   internals escape entirely. Deliberately untouched: `.prose code`,
   `pre`, `table`, `strong`, `blockquote`, `hr` (no package component
   contains them; example-owned resets already handle the docs chrome
   that reads them).

No token, package API, or visual-identity change is included; the
palette page's intended geometry (40px chips, hairline edge) is the
pre-existing `.example-palette-chip` rule, now applying at its intended
scope again.

## After (verified)

[`after-computed.json`](evidence/after-computed.json): chips
`display: block`, painted `326x40`; Card title 20px/26px, margins 0;
PageHeader title 28px, margin 0; breadcrumb padding 0, no offsets, links
governed by `page-header.css`. Rendered after captures:
`evidence/after-*.png` (same matrix as before).

Automated guards added to the browser suite
(section "Specimen rendering repair (#44)", run for both base paths):
palette chips assert computed `display: block`, 40px height, nonzero
painted area, painted primitive token color, and hairline edge in light
and pinned dark plus 390px, with no horizontal overflow; Card/PageHeader
computed metrics must be byte-identical between
[`packages/design-system/fixtures/bare-hosts.html`](../../../../packages/design-system/fixtures/bare-hosts.html)
(the same example markup with no docs shell) and the real docs pages, so
any future prose leak fails the check instead of silently distorting
specimens.

## Reproduce

```sh
bun install --frozen-lockfile
bun run --cwd apps/docs build
bun run test:browser          # base "/"
DOCS_BASE_PATH=/augur-design-system bun run --cwd apps/docs build
DOCS_BASE_PATH=/augur-design-system bun run test:browser
```

Interactive serving is not provided by this runner; use any static
server rooted at `apps/docs/dist`.
