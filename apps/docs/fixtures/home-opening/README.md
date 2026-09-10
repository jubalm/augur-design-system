# Home page — brand opening — issue #47

Rendered evidence for the docs home as contract frame A (visual
direction, VD-01). Comparison sources: PDF physical pages 1/3 (opening
composition), 25 (expressive message), rendered at
[`../visual-alignment/evidence/source/`](../visual-alignment/evidence/).

## Composition

- Orientation rail and message in 1:2 columns (32px gap ≥960px, 24px on
  tablet); opening top inset 48px and 520px minimum height on desktop;
  rail stacks above the message below 600px.
- Locked copy: "Make what matters clear." (editorial-title role, 40/48,
  32/40 mobile), the 32×2 signal (Deep on light, Green on dark — the
  page's one green instance), the locked shared-interface-language
  lede, and the neutral text action "Explore the foundations".
- Identity: the #43 text lockup at opening scale (wordmark at
  editorial-title size, tracked descriptor in the secondary role).
- Metadata footer: three equal tracks (Purpose / Character / System)
  behind a quiet editorial hairline.
- Route index: rule-led rows in three columns (PDF page 5 alignment
  language), 16 links — all asserted to resolve. Status honesty lives
  in the rail's quiet source note and the shell footer; no dominant
  status warning, and no copy implies a release.

## Captures

light 1440/768/390 + dark 1440/390 full pages.

Computed assertions live in `the browser suite`, section "Brand opening
(#47)": title copy/role, 32×2 signal with theme swap, neutral action,
locked lede, 1:2 ratio, 520px minimum, three tracks, opening-scale
lockup, 16 resolving route links, overflow at 1440/390 — both base
paths.

## Reproduce

```sh
bun run --cwd apps/docs build
bun run test:browser
```
