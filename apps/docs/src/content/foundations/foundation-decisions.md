---
# Foundation decisions record (issue #2; rendered through the issue #8
# docs content conventions — src/content/foundations/, route
# /foundations/decisions). The title/description metadata below is the
# single H1 source: the page renderer and the future Markdown endpoint
# (#9) synthesize the H1 from it, so the body starts at H2 level.
title: "Foundation decisions"
description: >-
  Audit, naming fidelity, and pending foundation proposals (FD-01 through
  FD-06) for the Augur Design System — the review record referenced by
  DESIGN.md.
order: 3
---

> **Review status: OPEN.** This record separates three kinds of content: inherited brand
> facts verified against the upstream reference, corrections applied to `DESIGN.md`, and
> novel proposals. Every proposal is marked **Proposed** and is **unresolved** until a
> maintainer records review here or in
> [jubalm/augur-design-system#2](https://github.com/jubalm/augur-design-system/issues/2).
> Nothing in this file overrides `DESIGN.md`; until a proposal is adopted, the value it
> describes has no settled system definition.

- Issue: [jubalm/augur-design-system#2](https://github.com/jubalm/augur-design-system/issues/2)
- Branch at time of audit: `issue-2-foundation-authority`, based on `6a66172`
- Audit date: 2026-09-04
- Sources: `DESIGN.md` (repository root), `ARCHITECTURE.md`, and
  `resources/brand/augur-brand-foundation.pdf` (upstream reference only)

## 1. Purpose

`DESIGN.md` arrived with unresolved spacing/radius ownership language and no shared
decision record for the concepts its pinned schema cannot represent. This file is the
foundation review record required before issue #3 (token export), #4 (semantic themes),
and #10 (foundation documentation) can consume settled values. It documents what the
audit verified, what was corrected, what is proposed, and who owns each concept.

## 2. Source precedence

Summary of `ARCHITECTURE.md` ("Authority and source precedence"), applied throughout
this record:

| Rank | Source | Governs |
| --- | --- | --- |
| 1 | `DESIGN.md` (front matter + prose) | Adopted design values representable by the pinned `@google/design.md` schema, and maintained brand guidance |
| 2 | Generated tokens / theme output | Build artifacts derived from `DESIGN.md`; never edited as independent sources |
| 3 | Foundation documentation + component implementation | Concepts the pinned schema cannot represent (spacing, sizing, radius, focus, motion, state semantics) |
| — | `resources/brand/augur-brand-foundation.pdf` | Upstream reference; informs the system, never silently overrides maintained decisions |
| — | This record | Proposals and review status; carries no authority until a value is adopted |

## 3. Audit of `DESIGN.md`

### 3.1 Inherited brand facts verified against the PDF — no drift found

All 15 front-matter color values match the brand foundation PDF (pages 03.1 "Core
palette" and 03.2 "Product surfaces"):

| `DESIGN.md` key | Hex | PDF name | PDF section |
| --- | --- | --- | --- |
| `primary` | `#0E0E21` | Augur Navy | 03.1 |
| `accent` | `#2AE7A8` | Augur Green | 03.1 |
| `neutral` / `surface-light` | `#F5F5F8` | Augur Paper / light canvas | 03.1, 03.2 |
| `secondary` | `#4A4B61` | Augur Graphite | 03.1 |
| `secondary-dark` | `#A1A1B8` | Augur Pewter | 03.1 |
| `surface-light-raised` | `#FFFFFF` | White (elevated light role) | 03.2 |
| `surface-light-muted` | `#ECECF2` | Muted (quiet light region) | 03.2 |
| `border-light` | `#E0E0E7` | Border (hairline rule) | 03.2 |
| `accent-deep` | `#095E42` | Deep | 03.1 |
| `accent-wash` | `#C9FFE5` | Wash | 03.1 |
| `surface-dark-1` | `#161629` | Surface 1 | 03.2 |
| `surface-dark-2` | `#1D1D30` | Surface 2 | 03.2 |
| `surface-dark-3` | `#242438` | Surface 3 / Raised | 03.1, 03.2 |
| `surface-dark-mist` | `#71728A` | Mist | 03.1 |

All seven typography roles match PDF page 04.1 (Display 40/44 semibold −1%;
Heading 1 28/34 semibold −0.5%; Heading 2 20/26 semibold; Body 16/24 regular;
UI 14/20; Metadata 12/16; Sora as primary voice, Schibsted Grotesk as secondary).

Contrast pairings were **independently recomputed** with the WCAG 2.x relative-luminance
formula (evidence in §9); all printed values reproduce exactly:

| Pairing | Claimed | Recomputed | Status |
| --- | --- | --- | --- |
| Navy on Paper | 17.49:1 | 17.49:1 | matches |
| Graphite on Paper | 7.81:1 | 7.81:1 | matches |
| Deep on Paper | 7.17:1 | 7.17:1 | matches |
| Paper on Navy | 17.49:1 | 17.49:1 | matches |
| Pewter on Navy | 7.53:1 | 7.53:1 | matches |
| Green on Navy | 11.87:1 | 11.87:1 | matches |
| Pewter on Surface 3 (PDF §03.2 only) | 6.00:1 | 6.00:1 | matches; added to `DESIGN.md` in this change |

The front-matter component pairings also pass AA text contrast when recomputed:
White on Deep 7.80:1 (`action-primary-light`), Navy on Green 11.87:1
(`action-primary-dark`), Navy on Wash 17.15:1 (`signal-wash`), Paper on Surface 2
15.19:1 (`panel-dark-*`), Navy on Muted 16.17:1 (`muted-region-light`).

State language (Open, Closed, Pending, Final), the one-green-signal rule, logo
variants/clearspace (1a), and minimum sizes (glyph 50px; horizontal lockup 150×50;
vertical lockup 94×93) match the PDF. No inherited fact was contradicted by the
architecture.

### 3.2 Findings requiring change (applied to `DESIGN.md` in this slice)

1. **Naming conflation (corrected).** The Colors prose called the light quiet region
   `#ECECF2` "Mist". In the PDF, `#ECECF2` is **Muted** (light theme, 03.2); **Mist** is
   the `#71728A` Navy companion for edges and rules only (03.1). `DESIGN.md` prose now
   uses Muted for the light region and gives Mist its own companion bullet. The
   front-matter keys were already correct; this was a prose-only error.
2. **Missing pairing (added).** Pewter on Surface 3 6.00:1 is a recorded PDF pairing
   relevant to dark panels; added to the `DESIGN.md` reference pairings as an inherited
   fact.
3. **Authority wording (replaced).** The `omitted` reasons for `spacing` and `rounded`,
   plus the Layout and Shapes prose, said consuming products' implementation tokens
   remain the source of truth. That contradicts `ARCHITECTURE.md`, which places
   foundations inside the design system and casts products as consumers. The wording now
   states that no scale is adopted yet, points to the proposals in this record, and
   keeps the values visibly unresolved instead of delegating ownership to products.

### 3.3 Classification of `DESIGN.md` content

| Region of `DESIGN.md` | Classification |
| --- | --- |
| Front-matter `colors` | Inherited brand facts (verified §3.1) |
| Front-matter `typography` | Inherited brand facts (verified §3.1) |
| Front-matter `components` pairings | Derived translations of PDF §03.2/03.3 surface and text-pairing guidance; validated by recomputation (§3.1, §9) |
| Prose: colors, typography, layout, elevation, shapes, components, do/don'ts | Inherited brand guidance; three corrections per §3.2 |
| `omitted: spacing / rounded` | Deliberate unresolved state; see §5 FD-01/FD-03 |

## 4. Naming fidelity: brand companions vs runtime surfaces

The source deliberately gives some values two names in two contexts. The rule: **brand
companion names describe colors; surface role names describe jobs.** Tokens and prose
must not swap them silently.

| Name | Hex | Kind | Allowed use |
| --- | --- | --- | --- |
| Raised (companion) | `#242438` | Brand companion (Navy family) | Layers Navy in dark UI; identical value to Surface 3. `DESIGN.md` keeps the dual label "Surface 3 / Raised". |
| Raised (role) | `#FFFFFF` | Runtime surface role (light) | The elevated light panel job, filled by White. Role name, not a color name. |
| Mist | `#71728A` | Brand companion (Navy family) | Dark edges and rules only (`divider-dark`); never readable copy; **not** the light quiet region. |
| Muted | `#ECECF2` | Runtime surface role (light) | Quiet light region (`surface-light-muted`, `muted-region-light`). |
| Deep | `#095E42` | Brand companion (Green family) | Readable green for light-surface text/actions (`action-primary-light`, `signal-light`); the accessible green. |
| Wash | `#C9FFE5` | Brand companion (Green family) | Light green fill only (`signal-wash`); never readable green text. |
| Surface 1/2/3 | `#161629` / `#1D1D30` / `#242438` | Runtime surface roles (dark) | Stepped dark layers (`panel-dark-1/2/3`). |

No conflation remains in `DESIGN.md` after the §3.2 corrections. Future tokens must
preserve these distinctions; semantic theme mapping (#4) should reference companions by
companion name and surfaces by role name.

## 5. Proposals pending maintainer review

Scope of the proposal set: the **smallest** shared foundation the starter components
need — Button, Card (issue #11), Input, FormField (#12), Dialog (#13), PageHeader,
EmptyState (#14) — plus the focus/reduced-motion semantics issue #4 requires. Values are
expressed in px with rem equivalents on a 4px base. **All items in this section are
Proposed — pending maintainer review; none is adopted, and none may move into
`DESIGN.md` front matter or generated tokens before review.**

### FD-01 — Shared spacing scale — Proposed

- Proposal: six steps on a 4px base — `space.xs` 4px (0.25rem), `space.sm` 8px
  (0.5rem), `space.md` 12px (0.75rem), `space.lg` 16px (1rem), `space.xl` 24px
  (1.5rem), `space.2xl` 32px (2rem). Naming follows the illustrative token style in
  `ARCHITECTURE.md` §3 ("Terminology").
- Rationale: 4px base aligns with the 16px body and 20px control line-heights already
  adopted; six steps cover every padding/gap need found in the starter set without a
  larger taxonomy (excluded by the issue).
- Starter needs: Button padding 8/16 (12 small), Input horizontal 12, FormField
  label-to-control gap 8–12, Card/Dialog padding 24, PageHeader/EmptyState rhythm 24/32,
  icon-to-label gap 4–8.
- Evidence: no contrast impact; interaction benefit is consistent optical density and
  hit-area spacing across controls.
- Status: **Proposed — pending review.**

### FD-02 — Control sizing — Proposed

- Proposal: control heights `control.height.sm` 32px, `control.height.md` 36px,
  `control.height.lg` 40px; icon sizes 16px (inline) and 20px (standalone).
- Rationale: matches shadcn size conventions (h-8/h-9/h-10), which the architecture
  adopts for familiarity (`ARCHITECTURE.md` §11); 36px default fits the 20px control
  line-height with 8px vertical padding from the FD-01 scale.
- Evidence (interaction): 36px ≥ 24px WCAG 2.5.8 minimum target size. Open sub-question:
  36px is below the 44px mobile touch guidance; the system currently targets dense
  desktop records UI. Maintainer to confirm the touch-target policy (§8, Q2).
- Status: **Proposed — pending review.**

### FD-03 — Corner radius — Proposed

- Proposal: `radius.surface` 8px (panels: Card, Dialog) and `radius.control` 6px
  (inputs, buttons, triggers), with the derivation rule control = surface − 2px,
  mirroring shadcn's `calc(var(--radius) …)` convention. Naming matches the
  `ARCHITECTURE.md` §3 examples.
- Rationale: two values are the smallest shadcn-compatible set; the tonal-depth model
  (no shadows) lets radius carry grouping without competing with fixed identity
  geometry, which remains untouched.
- Evidence: no contrast impact; preserves the PDF constraint that no global radius
  scale is defined upstream — this is a new system decision requiring review.
- Status: **Proposed — pending review.**

### FD-04 — Focus treatment — Proposed

- Proposal: `focus-visible` ring 2px wide with 2px offset; ring color Deep on light
  surfaces, Green on dark surfaces; keyboard focus always visible, pointer-triggered
  focus never painted. Focus is always a second cue alongside an existing state change.
- Rationale: extends the inherited rule that green signals intent/focus, and mirrors the
  adopted action-color split (Deep on light, Green on dark) so focus and intent share one
  voice. Ring-on-offset keeps the brand's no-glow/no-shadow rule.
- Evidence (contrast, recomputed §9): Deep on Paper 7.17:1 and Green on Navy 11.87:1 —
  both exceed the 3:1 non-text minimum (WCAG 1.4.11) and focus-appearance guidance.
- Status: **Proposed — pending review.**

### FD-05 — Motion and reduced motion — Proposed

- Proposal: `motion.duration.fast` 150ms (hover/press/focus state feedback),
  `motion.duration.base` 250ms (overlay enter/exit such as Dialog, collapsible
  regions); ease-out for entrances, ease-in for exits; no springs or decorative loops.
  Under `prefers-reduced-motion: reduce`, durations collapse to ≤ 0.01ms and
  transform-based entrances are replaced with opacity-only equivalents.
- Rationale: the PDF defines no motion values, so any duration is a new system decision.
  150ms sits in the common perceptual band for state feedback; 250ms covers overlay
  transitions without delay. The reduced-motion rule is required by issue #13's examples
  and issue #4's theme contract, and follows the standard `prefers-reduced-motion`
  pattern (WCAG 2.3.3 intent).
- Evidence (interaction): reduced-motion collapse is the established accessibility
  fallback; no motion contrast concerns.
- Status: **Proposed — pending review.**

### FD-06 — State semantics — labels Inherited; interaction treatment Proposed

- Inherited (already adopted in `DESIGN.md`, verified §3.1): record states are named
  Open, Closed, Pending, Final; state is carried by a text label with color as
  reinforcement only; usually one green signal per view.
- Proposal (interaction contract for controls):
  - hover: adjacent surface step or subtle action-color tint; no shadows (tonal depth
    only, per inherited elevation rules)
  - pressed: one step beyond hover on the same ladder
  - focus-visible: FD-04 ring, never suppressed
  - disabled: non-interactive, reduced-contrast label that remains present and
    readable in the DOM; never color-alone (inherited rule), `cursor: not-allowed`
  - loading: width-preserving affordance with `aria-busy`; action color unchanged to
    avoid implying a state change
  - record states map onto the existing `signal-light` / `signal-dark` / `signal-wash`
    pairings; the exact per-state mapping is validated with real pairs in issue #4 and
    is deliberately not fixed here.
- Rationale: issues #11/#12 require disabled/loading contracts; the PDF supplies state
  words but no interaction-state visuals, so the treatment is novel.
- Evidence: WCAG 1.4.1 (use of color); inherited "never hide meaning in color alone";
  contrast for the existing pairings recomputed in §9.
- Status: labels **Adopted (inherited)**; interaction treatment **Proposed — pending
  review.**

## 6. Decision table

| ID | Decision | Source | Proposed value / relationship | Rationale | Contrast / interaction evidence | Adoption status |
| --- | --- | --- | --- | --- | --- | --- |
| FD-01 | Shared spacing scale | New system decision (4px base; `ARCHITECTURE.md` §3 naming) | `space.xs/sm/md/lg/xl/2xl` = 4/8/12/16/24/32px | Covers all starter-set padding/gaps; no larger taxonomy | No contrast impact; consistent density/hit spacing | **Proposed — pending review** |
| FD-02 | Control sizing | shadcn conventions via `ARCHITECTURE.md` §11 | heights 32/36/40px; icons 16/20px | shadcn familiarity; fits 20px control line-height | ≥ 24px WCAG 2.5.8; 44px touch policy open (Q2) | **Proposed — pending review** |
| FD-03 | Corner radius | New system decision (shadcn derivation) | `radius.surface` 8px, `radius.control` 6px (−2px rule) | Smallest shadcn-compatible set; tonal depth needs no shadow | No contrast impact; identity geometry untouched | **Proposed — pending review** |
| FD-04 | Focus treatment | Extension of inherited green-signal rule | 2px ring, 2px offset; Deep (light) / Green (dark); `focus-visible` only painted | One voice for intent + focus; no glow/shadow | Deep on Paper 7.17:1; Green on Navy 11.87:1; ≥ 3:1 non-text | **Proposed — pending review** |
| FD-05 | Motion / reduced motion | New system decision (PDF defines none) | 150ms fast / 250ms base; ease-out in, ease-in out; reduced-motion collapse ≤ 0.01ms | Common perceptual bands; required by #4 and #13 | WCAG 2.3.3 intent; standard reduced-motion pattern | **Proposed — pending review** |
| FD-06 | State semantics | Labels inherited (PDF; `DESIGN.md`); treatment new | Open/Closed/Pending/Final by label; hover/press/focus/disabled/loading contract | Issues #11–#12 contracts; neutrality constraint | WCAG 1.4.1; pairings ≥ AA per §3.1 | Labels **Adopted**; treatment **Proposed — pending review** |
| — | Pewter on Surface 3 pairing | PDF §03.2 (inherited fact) | 6.00:1 added to `DESIGN.md` pairings | Restores a recorded fact relevant to dark panels | Recomputed 6.00:1, AA text | **Adopted (inherited)** |
| — | Muted vs Mist naming | PDF §03.1/03.2 (inherited fact) | Prose corrected in `DESIGN.md`; see §4 | Removes silent companion/role conflation | n/a | **Corrected (source-aligned)** |
| — | Foundation ownership wording | `ARCHITECTURE.md` §13 | Product-ownership language replaced in `DESIGN.md` | Products consume foundations; system owns them | n/a | **Corrected (architecture-aligned)** |

## 7. Ownership of concepts outside the pinned schema

| Concept | In `@google/design.md` schema? | Authority while unresolved | Home once adopted |
| --- | --- | --- | --- |
| Colors, typography, component pairings | Yes | `DESIGN.md` front matter (already) | `DESIGN.md` |
| Spacing | Section exists; omitted here | This record (FD-01), visibly unresolved | `DESIGN.md` `omitted` entry replaced by values; tokens generated via #3 |
| Corner radius | Section exists; omitted here | This record (FD-03) | Same path as spacing |
| Control sizing | No | This record (FD-02), then foundation docs + component code | Docs + component implementation |
| Focus treatment | No | This record (FD-04), then theme mapping (#4) | Semantic theme mapping + component code |
| Motion / reduced motion | No | This record (FD-05), then theme mapping (#4) | Semantic theme mapping + component code |
| State semantics | No (labels are prose guidance) | `DESIGN.md` prose (labels); this record (treatment) | `DESIGN.md` prose + component contracts |

Per `ARCHITECTURE.md`, concepts outside the schema stay in component implementation and
current documentation; they must not be forced into the format. If FD-01/FD-03 are
adopted, moving them into the schema's `spacing`/`rounded` sections is a deliberate
migration made with the pinned toolchain from issue #3 — not a silent edit.

## 8. Open questions for maintainer review

1. Approve or adjust the FD-01 spacing steps (4/8/12/16/24/32) and their names.
2. Approve FD-02 control heights and set the touch-target policy (36px desktop default
   vs 44px mobile guidance; dense-records UI is the current target).
3. Approve the FD-03 two-value radius set and the −2px control derivation.
4. Approve the FD-04 focus ring spec (2px / 2px offset, Deep/Green by theme).
5. Approve FD-05 durations (150/250ms) and the reduced-motion collapse behavior.
6. Confirm the FD-06 interaction-state contract before #11–#14 implement it.
7. Confirm that, once adopted, spacing/radius values migrate into `DESIGN.md` front
   matter via the pinned toolchain (issue #3) rather than runtime-only tokens.

## 9. Verification evidence for this record

Commands were run ad hoc in an isolated sandbox because the repository does not yet
contain a workspace or checks (issues #1/#6 own those). No repo validation command was
available to run, and none is claimed.

- Contrast recomputation: WCAG 2.x relative-luminance script over all `DESIGN.md` and
  PDF pairings — results in §3.1 (all claimed values reproduce; component pairings ≥ 4.5:1;
  Border on Paper 1.21:1 confirms borders may never carry meaning alone).
- Hex/type verification: programmatic comparison of `DESIGN.md` front matter against
  `pdftotext` extraction of `resources/brand/augur-brand-foundation.pdf` (§3.1 tables).
- No design.md lint, token export, type check, or test suite exists at this planning
  stage; the pinned `@google/design.md` validation belongs to issue #3's toolchain.
