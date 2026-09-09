# Docs navigation and reading shell frames — issue #55 (phase 0)

This non-shipping fixture holds the **design checkpoint frames** for the
scalable documentation navigation and reading shell (#55): the quiet
masthead, the grouped sidebar, the H2-derived contents rail, the mobile
"Browse documentation" disclosure, and the dense-page table release. It
follows the visual-alignment fixture precedent: real package stylesheet
and fonts, real rendered page content, loopback-only serving, and
retained evidence — no shipping route changes before maintainer
acceptance of these frames.

**Status: awaiting maintainer frame review.** Phase 1 (implementation in
`BaseLayout.astro` / `DocPage.astro` / `docs.css`, section overviews,
previous/next, `llms.txt` and Markdown parity, acceptance matrix) starts
only after the frames are accepted on the issue.

## What the frames show

| Page | Frame pages | Purpose |
| --- | --- | --- |
| `short.html` | `/foundations/fonts` content | Short-page case: rail, reading measure, specimens at the column |
| `dense.html` | `/foundations/color` content | Dense stress case: color tables on the wider document region |

Each page renders the full shell: masthead (text identity lockup, theme
access, repository access), grouped sidebar (Getting started lead-in,
then Foundations, Components, Patterns, Reference — each led by an
Overview entry), the document column, the H2-derived "On this page" rail
(≥1200px), collapsed "On this page" beneath the page opening (<960px),
the "Browse documentation" disclosure (below 960px), and previous/next
links from the same maintained reading order.

The sidebar/panel navigation model, the reading order, and the pager are
generated from one source in `review.mjs` (`GROUPS`/`READING_ORDER`),
mirroring the normalized content orders committed for #55. Phase 1
replaces that literal with collection-derived data; the model must not
drift from it.

## Content provenance

The article content is **not** hand-copied: `review.mjs` extracts the
rendered `<article>` of the two pages from a current `apps/docs/dist`
build at run time and splits it into page opening and body so the
collapsed contents control sits at its true DOM position. Frames
therefore cannot drift from the app's real rendered content.

## Reproduce

From the repository root:

```sh
bun install --frozen-lockfile
bun run --cwd apps/docs build
bun apps/docs/fixtures/docs-shell/review.mjs
```

The command bundles `shell.css` (package styles + the app's real
`docs.css` + prototype shell chrome), assembles the two frame pages,
starts a loopback-only server, verifies and captures both themes at
1440×1000, 768×1024, and 390×844, and writes `evidence/`. To inspect
interactively:

```sh
bun apps/docs/fixtures/docs-shell/review.mjs --serve
```

Open the printed URL (`/short.html`, `/dense.html`), optionally adding
`?theme=dark`. The theme button mirrors the app's `augur-theme`
localStorage contract.

## Retained evidence

`evidence/` holds one full-page capture per page × theme × viewport
(12), focused masthead and sidebar close-ups at 1440 (per theme), and
drawer-open captures at 390 (per theme), plus `verification.json`
(source commit, fixture SHA-256 values, per-combination checks: loaded
fonts, geometry, light/dark parity, visibility contract, wide-region
tables, contrast, keyboard/focus, console/network cleanliness).

The sidebar close-ups show the keyboard focus ring on the first link:
the capture follows the focus assertion intentionally.

## Made choices recorded for maintainer review

These are the checkpoint's "record the choice, don't improvise" items
(see REVIEW.md for the full list and rationale):

- Sidebar ≥960px, contents rail ≥1200px, disclosure below 960px. At 768
  the 65ch measure cannot coexist with a retained sidebar (the column
  would fall to ~61ch with tables squeezed between rails), so the tablet
  frame uses the disclosure.
- Repository access leaves the compact (<600px) masthead — the lockup
  stacks, and identity, browse trigger, and theme fill the row; the
  footer keeps Repository on every page.
- Section overviews appear in the sidebar as "Overview" entries leading
  each group; the routes do not exist yet (phase 1).
- The theme control has a fixed width so Light/Dark swaps never reflow
  the masthead.

## Limitations

- Copy page / View as Markdown render in their subordinate position but
  are inert here (no clean-Markdown endpoints in a static fixture).
- The On-this-page rail does not scroll-spy in the prototype (active
  H2 tracking is phase-1 behavior); links work.
- Frames are a reviewed composition reference, not the shipping docs
  redesign; final human visual acceptance remains #53.
