# Frame review checklist — issue #55 phase 0

Reviewer map from the #55 acceptance criteria to the frame evidence.
Frames: `evidence/` — full pages per theme × {1440×1000, 768×1024,
390×844} for both the short (`short-*`) and dense (`dense-*`) cases,
plus `masthead-*`, `sidebar-*`, and `drawer-*` close-ups.

| #55 requirement | Where to look | Expected |
| --- | --- | --- |
| Quiet masthead: identity, "Design system" context, theme + repository access, one row | `masthead-light/dark-1440.png`; full pages at all three widths | One deliberate row per width; no wrapping, collision, clipping, or horizontal overflow (asserted) |
| Grouped sidebar, Foundations → Components → Patterns → Reference, every route discoverable | `sidebar-light/dark-1440.png` | Getting started lead-in; four groups led by Overview; active page marked |
| Active-page state: restrained text + short rule, not cards/icons/green wall | `sidebar-*.png`, drawer captures | Foreground text + 24×2px rule on the active document only (asserted) |
| Current/keyboard focus visible in both themes, not color-only | `sidebar-*.png` (ring on first link); verification.json | 2px ring, 2px offset via `:focus-visible`; skip link is the first tab stop (asserted) |
| On this page from real H2s; short pages never render an empty rail | Rail on both pages at 1440; collapse beneath the opening below 960 | Rail link count equals the page's real H2 count (asserted); collapse mirrors it |
| Dense page: readable prose AND tables on the wider region, no broken words / narrow columns | `dense-light/dark-1440.png`, `dense-*-768x1024.png` | Tables span the document column (≥ the prose measure; asserted), internal scroll for cell overflow |
| Mobile: one clearly named disclosure; identity/theme coherent; DOM order = reading order | `drawer-light/dark-390.png`, `short-*-390x844.png` | "Browse documentation" opens the grouped model mirroring the sidebar (asserted); skip link → masthead → main |
| Light and dark: same content, order, geometry, responsive behavior | Any light/dark pair | Geometry parity asserted per combination; themes swap colors only |
| Copy page / View as Markdown subordinate, keyboard accessible | Page opening on every frame | Rendered below the lede, metadata-quiet; inert in the fixture (limitation) |

## Decisions to confirm at acceptance

1. **Breakpoints:** sidebar ≥960, rail ≥1200, disclosure <960. The 768
   frame intentionally uses the disclosure: with a retained sidebar the
   document column falls to ~61ch and dense tables squeeze between
   rails, defeating requirement 7. (Issue text allows "retained or
   intentionally collapsed" at 768; this records the choice.)
2. **Compact masthead (<600):** lockup stacks (identity + context
   retained); Repository moves to the footer; theme trigger keeps its
   full label with a fixed width.
3. **Overview entries** labeled "Overview" leading each group; routes
   land in phase 1 at `/foundations`, `/components`, `/patterns`,
   `/reference` with clean Markdown equivalents.
4. **Reading order** (sidebar, pager, phase-1 overviews and `llms.txt`):
   Getting started, then per group Overview + pages in the normalized
   `order` sequences committed for #55.
5. **Table release:** tables span the document column (`100cqw`),
   leaving the 65ch measure symmetrically; internal scroll when cells
   need more; below 960 they go full-width.

## Verification performed by `review.mjs` (per combination)

Fonts loaded (Sora 400/600, Schibsted Grotesk 400); no horizontal
overflow; masthead single row (vertical centers); sidebar/rail/disclosure
visibility contract; active-document rule 24×2px; rail derives from real
H2s; dense tables use the document column; light/dark geometry parity;
nav contrast ≥ 4.5:1; skip link first; focus ring 2px/2px; drawer opens
and mirrors the sidebar; zero console/network failures. Details and
SHA-256 provenance in `evidence/verification.json`.
