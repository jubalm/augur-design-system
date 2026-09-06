# V-track acceptance packet — issue #53

Single-pass execution of #43–#53 on branch `v-track-single-pass`,
produced by the isolated execution experiment (one writer, one
worktree, per-issue commits, checks at every boundary; GitHub issues
and milestones untouched throughout). This packet is the review
surface for the maintainer's visual acceptance. **Final human visual
acceptance is pending and belongs to the maintainer** — nothing here
blesses screenshots automatically, and nothing merges or publishes.

## 1. The acceptance matrix (reproducible)

Every substantive route (20) × both themes × three contract viewports
(1440×1000, 768×1024, 390×844) = **120 combinations, 0 failures**:
no console errors/warnings, no failed responses, no horizontal
overflow, real font faces loaded (`Sora`, `Schibsted Grotesk` checks)
on every combination.

- Runner: `apps/docs/fixtures/acceptance/capture-matrix.mjs`
- Retained machine summary: `verification-summary.json` (this folder)
- Regenerate locally:
  ```sh
  bun run --cwd apps/docs build
  bun apps/docs/fixtures/acceptance/capture-matrix.mjs [outDir]
  ```

## 2. Curated visual evidence (per issue, retained in-repo)

| Fixture folder | Issue | Evidence |
| --- | --- | --- |
| `specimen-repair/` | #44 | before/after captures + computed JSON (chips were inline/0×20 → block 326×40) |
| `frame-alignment/` | #46 | shell frame captures mapped to PDF 1/3/5/18/20/23 + lockup close-ups |
| `home-opening/` | #47 | frame A light/dark 1440/768/390 |
| `type-specimen/` | #48 | frame B light/dark 1440 + light 390 (PDF 22/23) |
| `palette-theme/` | #49 | palette fields + true light/dark paired records (PDF 18/20/23) |
| `component-geometry/` | #50 | Card/Dialog 0px panel language light/dark + mobile |
| `control-language/` | #51 | Button/Input/FormField light/dark + 390 |
| `reference-record/` | #52 | frame C pair light/dark 1440 + 390 (PDF 20/23/25) |
| `../visual-alignment/` | #42 | the approved contract + rendered PDF sources (unchanged, hashes intact) |

Computed assertions for every criterion live in
`apps/docs/fixtures/verify-docs.mjs` (sections 10–14 and the #44
repair/parity sections): **458 assertions, 0 failures, both base
paths** (`/` and `/augur-design-system`).

## 3. Standalone consumer parity

`packages/design-system/fixtures/bare-hosts.html` — standalone markup,
package styles only, zero docs CSS — asserts real font faces
(registered + loaded, checks true for Sora 400/600 and Schibsted
Grotesk 400), secondary-voice body, encoded control/surface geometry
(36px height, 0px radius), and a scoped dark subtree painting
differently from light (driver section 14). The full registry-install
path (clean Vite consumer, exact-pinned deps, SSR both themes) is
proven by the #18 consumer-install smoke; `registry:check` reports no
drift on this revision.

## 4. Deterministic checks on the reviewed revision

All observed passing (commands in `EXECUTION-LOG.md` per issue):
frozen install · `designmd lint DESIGN.md` (0 errors) · `oxlint` ·
`tsc --noEmit` · workspace smoke · `tokens:check` (IDENTICAL) ·
`tokens:verify-failures` (4/4 controlled probes) · `registry:check`
(no drift) · font fixture driver (10 roles) · `vitest` (70/70) · docs
builds at both base paths · `verify-markdown` both paths ·
`verify-docs` 458/458 both paths · acceptance matrix 120/120.

## 5. Recorded limitations and deviations (no silent exceptions)

1. **Brand artwork**: official production masters remain unsupplied
   (`PROVENANCE.md` §3; `augur-ecosystem/brand-assets` lookup 404 on
   2026-09-06 — availability observation only). The shipped identity is
   the maintainer-approved text fallback (#43). No mark was drawn,
   extracted, or reconstructed.
2. **Assertion exemptions, all documented in code**: the
   `EmptyStateIcon` decorative slot is exempt from the no-artwork rule
   (the component's own documented slot, established pre-#52); palette
   chips assert painted primitive tokens that are theme-invariant by
   design; pinned light/dark record pairs keep their own themes under
   any host (the pair criterion's intent).
3. **Sub-pixel tolerances**: the 65ch measure and pair-geometry
   comparisons use 0.5–1px tolerances (computed-style rounding).
4. **Fixture evidence volume**: the full 120-combination matrix is
   reproducible by script; only curated per-issue captures are
   committed to keep the repository lean.
5. **Known honest catches during the pass** (all fixed): two unclosed
   `docs.css` blocks nesting specimen rules (#44); a missing
   `[data-theme="light"]` container scope in `theme.css` found by the
   pair criterion (#49); prose line-height distorting demonstrated role
   values on the fonts page (#45); several driver assertions corrected
   against real semantics (primitive-token theme invariance,
   `textContent` of `<br>`-joined copy, pinned-pair signal behavior).

## 6. What remains for the maintainer (pending human actions)

1. **Visual acceptance**: review the curated captures (and/or run the
   matrix) against the visual contract and the cited PDF pages; record
   acceptance or exceptions in #53.
2. **Link the acceptance to #22** (release review) and to the branch/
   commits — GitHub was deliberately left untouched by this pass.
3. Decide the disposition of `v-track-single-pass`: adopt as the
   integration outcome, cherry-pick per issue, or discard. Nothing has
   been merged to `visual-alignment-review` or `main`; no issues or
   milestones were updated; no PRs exist.
4. Release/publication decisions stay in #20/#21/#22 as recorded —
   #53 acceptance does not publish or merge anything.
