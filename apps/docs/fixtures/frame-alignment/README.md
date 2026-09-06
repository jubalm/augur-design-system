# Shared frame alignment — issue #46

Rendered evidence for the docs shell's alignment with the approved
editorial grid (visual direction contract, FD-01/VD-01) and its
hierarchy relationships (VD-03, VD-06). Captures come from the real
built site (`bun run --cwd apps/docs build`) at the three contract
viewports; the retained PDF renders for comparison live in
[`../visual-alignment/evidence/source/`](../visual-alignment/evidence/)
(physical pages 1, 3, 5, 18, 20, 23 of the pinned brand PDF, sha
`65acce8b247ddda10834d0c068e84bc315f7afc118f5570d1d90386de8ed9c0c`).

## What changed

- **1200px frame with 64/24px gutters** (`header-inner`, `site-main`,
  `footer-inner`): at 1440 the centered frame leaves exactly the
  contract's 120px side margin; below 960px gutters step to 24px.
- **Reading vs specimen widths**: prose caps at the 65ch reading
  measure; example blocks keep the explicit 46rem specimen width,
  centered over the measure, and flow full-width below ~820px.
- **Type hierarchy**: page titles render the `editorial-title` role
  (Sora 400, 40/48, −0.01em; 32/40 below 600px); markdown section
  headings mirror `editorial-section` (28/34 regular) and
  `heading-2` (20/26). Both mirrors are commented sync points with the
  fonts fixture.
- **Identity lockup (#43's first sanctioned shell render)**: Sora 400
  "Augur" wordmark (ui role, 14/20) + tracked uppercase "Design system"
  descriptor (editorial-label role, secondary color), 12px apart. The
  neutral anchor square was removed — the lockup replaces placeholder
  chrome. No drawn mark; masters remain an unresolved dependency.
- **Quiet editorial separators (VD-06)**: a new `--border-quiet`
  semantic role (light: Border; dark: Surface 3) now paints the shell
  and editorial hairlines (header, footer, mobile-nav divider, rules,
  blockquote, table rules, font-demo separators). Control edges keep
  `--border` (Mist in dark), so dark pages no longer read as a mesh of
  equal-brightness borders.

## Captures and what to compare

| Capture | Compare against | What to look for |
| --- | --- | --- |
| `color-light-1440.png` | PDF pages 1/3 (opening margins), visual-direction frame A | One 120px side margin, centered 1200px frame; title in the regular editorial voice; chips as square fields (PDF 18) |
| `color-dark-1440.png` | PDF page 20/23 tonal logic | Quiet Surface 3 rules vs Mist control edges; hierarchy equal to light |
| `color-light-768.png` / `color-light-390.png` | Frame A/B stacking rules | 24px gutters; no collisions or overflow; title steps to 32/40 at 390 |
| `card-light-1440.png` | PDF page 5/25 record spacing | Specimen width; package Card geometry untouched by prose |
| `header-lockup-light/dark-1440.png` | #43 identity spec | Wordmark + descriptor lockup; descriptor secondary in both themes |

Computed assertions for all of the above live in
`apps/docs/fixtures/verify-docs.mjs`, section "Shared frame alignment
(#46)" (frame width/gutters/margins, 65ch measure, role-computed title
and headings, lockup metrics, quiet-vs-control border separation in
dark, overflow at 1440/768/390) — run on both base paths.

## Reproduce

```sh
bun install --frozen-lockfile
bun run --cwd apps/docs build
bun apps/docs/fixtures/verify-docs.mjs
```

Interactive inspection: serve `apps/docs/dist` with any static server.
