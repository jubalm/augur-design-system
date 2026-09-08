---
title: Foundation decisions
description: Inherited brand facts, the original foundation audit, and the adopted visual direction that supersedes the initial proposals.
order: 6
---

## Current decision status

**Implementation direction adopted under delegated maintainer authority on 2026-09-06;
final human visual acceptance remains pending in issue 53.** The full executable
contract is [Visual direction](/foundations/visual-direction). Its
[authority record](https://github.com/jubalm/augur-design-system/issues/42#issuecomment-5556190059)
records the maintainer's delegation of exact visual choices to the Astra visual
director. This is an explicit decision made after the initial issue 2 audit;
closing issue 2 did not adopt its proposals.

No runtime tokens or component geometry change in issue 42. The adopted direction
is a migration contract: issue 45 must encode representable values in canonical
`DESIGN.md` and regenerate outputs before runtime consumers adopt them. Technical
structure remains governed by `ARCHITECTURE.md`; concepts outside the pinned
schema stay in maintained foundations and component implementation.

| ID | Initial proposal | Current decision | Status |
| --- | --- | --- | --- |
| FD-01 | Local 4/8/12/16/24/32px spacing | Retain local steps; add 48/64/80px composition roles, 1200px frame, 64/24px outer gutters, 80/48px section gaps, 65ch reading measure, with exact breakpoints in the visual contract | Adopted and encoded: the six component steps are the `spacing` tokens in `DESIGN.md` (issue 45); 48/64/80px, the frame, gutters, section gaps, and the 65ch measure remain composition roles in the visual contract, not component tokens |
| FD-02 | Desktop heights 32/36/40px; mobile policy open | Retain desktop sizes and 16/20px icons; actionable targets at least 44×44px on coarse pointers | Adopted direction; component migration pending |
| FD-03 | 8px surface / 6px control, subtraction rule | 0px panels, controls, and Dialog; only intrinsic radio circles and supplied identity artwork keep their required shape | Old proposal rejected; 0px encoded as `rounded: {control: 0px, surface: 0px}` in `DESIGN.md` (issue 45); component geometry migrates with the component issues |
| FD-04 | 2px ring / 2px offset; Deep/Green | Adopt geometry and theme relationship; use focus-visible browser heuristics, never hide required input focus | Adopted direction |
| FD-05 | Universal 150/250ms durations | Immediate 0ms state feedback; no decorative motion; retain reduced-motion safety for legacy migration | Old duration proposal rejected; immediate direction adopted |
| FD-06 | Inherited state names; proposed interaction | Keep Open/Closed/Pending/Final; neutral hover/selection; explicit disabled/loading labels, stable loading width and aria-busy | Labels inherited; interaction direction adopted |
| VD-03 | No editorial roles | Add Sora 400 editorial title 40/48 and section 28/34, with mobile rules; preserve seven inherited roles | Adopted and encoded: `editorial-title`/`editorial-section`/`editorial-label` in `DESIGN.md` and the runtime typography layer with the adopted mobile steps (issue 45) |
| VD-05/06 | Signal logic and tonal depth inherited | 32×2px signal; quiet editorial separators distinct from perceivable control edges | Adopted direction; relationships and contrast evidence recorded (issue 45); runtime semantic border roles land with the consuming frame work (#46) |
| Final visual acceptance | Not performed by issue 2 | Maintainer inspects resulting rendered surfaces through issue 53 | Unresolved; do not claim human acceptance or release approval |

## Source precedence and history

`DESIGN.md` owns adopted representable values; generated outputs are derived, never
independently edited. The PDF informs the system but does not silently override
current decisions. The current visual contract distinguishes inherited facts,
observed composition, new web choices, and delegated adoption.

The original audit was performed on 2026-09-04 on `issue-2-foundation-authority`,
based on `6a66172`. Its full proposals, rationale, and contrast evidence remain in
the [pre-adoption decision record](https://github.com/jubalm/augur-design-system/blob/88a6ccf46b201b921344bfa1411ed41b1ec17ba0/apps/docs/src/content/foundations/foundation-decisions.md).
The factual audit below is preserved; historical proposal language in that pinned
record is superseded by the current table. The unresolved radius/spacing wording
in `DESIGN.md` is updated through issue 45's canonical migration, not silently
rewritten by this review fixture.

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


## Verification boundaries

The original audit independently recomputed the listed PDF contrast pairings and
checked naming/type values. It did not prove editorial visual fidelity. Issue 42
adds rendered physical-page review, isolated browser frames in both themes at
three viewport sizes, font/network/computed-style evidence, meaningful boundary
contrast checks, keyboard review, and clean Markdown verification. See the
[visual contract](/foundations/visual-direction) and its retained evidence.
