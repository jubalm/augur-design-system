# Docs navigation and reading shell frames — historical #55 phase-0 checkpoint

> **Historical — superseded.** The #55 navigation and reading shell shipped;
> the browser suite owns the shipping shell contract. This
> fixture is retained as phase-0 design evidence and is **not maintained
> against the current app**: it extracts live page content and its assertions
> predate the shipped shell, so it no longer passes standalone. Do not treat
> it as current verification.

This non-shipping fixture holds the **design checkpoint frames** for the
scalable documentation navigation and reading shell (#55): the quiet
masthead, the grouped sidebar, the H2-derived contents rail, the mobile
"Browse documentation" disclosure, and the dense-page table release. It
follows the visual-alignment fixture precedent: real package stylesheet
and fonts, real rendered page content, loopback-only serving, and
retained evidence — no shipping route changes before maintainer
acceptance of these frames.

**Status: historical evidence.** Phase 1 shipped in `BaseLayout.astro` /
`DocPage.astro` / `docs.css`, section overviews, previous/next, `llms.txt`
and Markdown parity; the browser suite owns that contract.

## What the frames show

| Page | Frame pages | Purpose |
| --- | --- | --- |
| `short.html` | `/foundations/fonts` content | Short-page case: rail, reading measure, specimens at the column |
| `dense.html` | dense decision tables (pre-IA `/foundations/decisions` page) | Dense stress case: decision tables on the wider document region |

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
rendered `<article>` of the two pages from an `apps/docs/dist` build at
run time and splits it into page opening and body so the collapsed
contents control sits at its true DOM position. That extraction targets
the pre-IA tree — including the since-removed `/foundations/decisions`
page — so it no longer reproduces against current `main`.

## Reproduce (historical)

The captured frames in `evidence/` are the retained record. To rebuild
the fixture as captured, check out the phase-0 checkpoint commit in
`evidence/verification.json` (its `source commit` field), install, build
the docs app at that commit, and run:

```sh
bun apps/docs/fixtures/docs-shell/review.mjs
```

Do not run it against current `main`: the extraction depends on routes
that the repository-IA cleanup removed.

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
  redesign.
