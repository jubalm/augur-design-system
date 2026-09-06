# Independent review of the consolidated V-track implementation

**Verdict: ready for final human visual acceptance; not release-approved.**
The corrected direction now satisfies the concrete implementation findings.
Final human visual acceptance, GitHub issue reconciliation, and release remain
maintainer decisions.

Reviewed existing `v-track-single-pass` commits through
`0335f1b` (the execution packet), then made focused, uncommitted corrections in
the same worktree. No issue replay, branch replacement, architecture change,
merge, publication, or GitHub status changes. `EXECUTION-LOG.md` was inspected
and appended locally; its earlier MET claims are executor claims, superseded by
this review where they conflict.

The final rendered source is identified by
[the source manifest](review-evidence/source-manifest.json), which hashes the
actual source files, including the new composition CSS. A base commit alone does
not identify these uncommitted corrections. Review dates: 2026-09-06–07.

Authority: the maintained visual-direction contract and #42 reference frames,
DESIGN.md, architecture, and the actual #52/#53 issue criteria. The PDF's
physical pages 3, 18, 20, 22, 23, and 25 were visually inspected against the
retained source renders. The existing exact palette, font families/weights,
square geometry, density, and scope boundaries were preserved.

## Findings and disposition

| ID / severity | Observed defect and conflict | Disposition / affected work | Verification |
| --- | --- | --- | --- |
| R1 / High | The fresh installed consumer had **0px Card padding**, a **16px editorial title**, Sora body copy, and a light-pinned record that stayed dark. Registry generation exported a color subset but omitted spacing/rounded variables, typography classes, and the explicit light scope. Workspace-only parity and successful Vite builds hid the failure. This defeats #45/#49/#50/#51/#53 consumer parity. | **Fixed.** The existing generator now exports all generated foundation variables, installs the maintained typography stylesheet through its existing theme item, and emits the explicit light scope. No parallel tokens or new architecture. | Fresh pinned-CLI source installation passed; independent consumer renders passed **6/6**. Card padding is 24px desktop / 16px mobile; titles are 40px / 32px; body is Schibsted; record panels remain White / Surface 2 under either host. See consumer JSON and images below. |
| R2 / Medium | At 390px, the type comparison's auto-sized spec column squeezed samples to **34–53px**, splitting words into two-letter fragments despite no page overflow. Support headings inherited **600**, contradicting their regular role; tablet notes stayed in one column. The provenance table also broke short header words. | **Fixed, #44/#48.** Samples have bounded columns, then stack over their specs below 600px. The prose boundary preserves the actual 400 role and 24px body line height. Tablet notes use three equal tracks; mobile retains the contract's supporting 20/26 step. A named, keyboard-focusable overflow region keeps provenance columns readable. | New role/width/grid assertions pass in both themes at all three viewports. Six retained typography detail captures show readable whole words and regular supporting headings. |
| R3 / High | Package controls remained 32/36/40px on touch; Dialog close was 32×32px. The light Input/outline boundary used Border against White (about **1.31:1**), although VD-06 explicitly selects Graphite for meaningful control edges. | **Fixed, #45/#50/#51.** Coarse-pointer controls and shell actions receive a 44×44px minimum, without changing fine-pointer sizes. Light `--input` references existing Graphite, giving about **8.50:1** against White; dark Mist is unchanged. Dialog gets its contracted 16px mobile inset and close-label clearance. | Touch-emulated browser checks pass for Button, Input, Dialog close, theme controls, and page actions in both themes. Keyboard/focus, modal containment/restoration, and long-content checks pass. This restores an adopted relationship; no new color was selected. |
| R4 / Medium | Dialog still faded/translated for 150/100ms, the loading indicator rotated indefinitely, and filled controls used transparent tints. Destructive hover even borrowed the green primary fill. These conflict with FD-05 immediate feedback and FD-06 neutral state surfaces. | **Fixed, #50/#51.** Dialog and pending indicator are static; hover uses existing neutral accent/foreground roles and pressed states use neutral inversion. Loading keeps the existing width, accessible Loading label, and aria-busy behavior. A future functional animation still requires review. | Package source and regenerated registry agree; 70 unit/accessibility tests pass, browser loading/focus checks pass, and six open-Dialog matrix checks report animation `none` with panels inside the viewport. |
| R5 / Medium | The EmptyState icon tile and Dialog demo scopes retained **8px corners** after the square direction was adopted. | **Fixed, #50/#52.** These surfaces now consume the existing 0px surface token. The documented optional icon API is preserved; no artwork was invented. | Source radius audit and deterministic registry check; existing pattern/browser coverage passes. |
| R6 / Medium | The record said **“Vote on this query”**, fabricated a recorded Yes response, omitted the real question and closing row, used an 8px choice gap, and exposed inert pressed toggles. Its 28px question treatment also differed from frame C's 20/26 role. | **Fixed, #52.** Restored “Open query”, LQ-042, the contracted question, equal Yes/No choices, Open, Not submitted, and a separate Closes / 14:32 UTC row. Used heading-2, 24/16px choice gaps, quiet separators, and separate pinned outer fields/panels. Static choices explicitly announce unavailable interaction instead of a fabricated selection. The same composition stylesheet travels with the example into the consumer. | New exact-content, disabled-semantics, equal-choice, and gap assertions pass across six combinations; paired screenshots show identical content/order/geometry and readable mobile wrapping. Source and rendered Markdown checks pass. |
| R7 / Medium | The acceptance server returned **HTTP 200 for missing files**, recorded registered font count rather than loaded faces, lacked runtime/request-failure capture and revision identity, and did not open Dialog in its full matrix. Its “all criteria MET” language exceeded the evidence. | **Fixed, #53.** Missing files return 404; both themes are explicitly pinned; loaded-face evidence, errors, source metadata, and six open Dialog states are recorded. Actual consumer rendering supplements the workspace fixture. Immediate Dialog close also exposed a test race; the driver now waits for the exact trigger to regain focus before checking restoration. | Final matrix **126/126**, six open-Dialog checks, independent consumer **6/6**, browser verification passed at root and subpath. Source manifest covers untracked correction files as well as tracked source. |
| R8 / Low | The footer claimed components had not landed, the homepage omitted the new reference-record route, and DESIGN.md still said spacing/radius could not be represented and remained unresolved. These mislead readers and implementation agents. | **Fixed, #45/#46/#47/#53.** Corrected availability/adoption wording, added the route, fixed missing spaces around the source link, and marked historical component proposals as superseded. README now acknowledges implemented browser checks and components. | Homepage route resolution and Markdown checks pass. DESIGN.md prose-only changes were followed by deterministic token/provenance regeneration. |
| R9 / Medium | #52 also requires an **applied full-page example with one task and one primary action**. The branch supplied only an inline paired specimen. | **Fixed, #52.** `/proposal-review` composes the existing PageHeader, reference record, and Button around the specified question. Yes/No remain equal, unavailable, and unselected. `Review details` is the one primary action and truthfully submits only to the page's static `#proposal-details` explanation; no voting logic, backend, or component API was added. | Browser assertions passed in light/dark at 1440×1000 and 390×844: exact task copy, equal unavailable choices, one in-page action, fragment navigation, and no horizontal overflow. The final matrix records all six contract combinations. |

## Visual assessment

The opening retains the intended unboxed rail/message relationship, regular
Sora title, one short orienting signal, and quiet three-part footer. It reads as
an editorial opening rather than a component-card dashboard. The palette uses
visible fields and keeps the supplied naming. The corrected typography specimen
now distinguishes regular editorial headings from stronger display/UI roles
without broken-word columns. The record's question, equal choices, and aligned
lower facts now reproduce the compact information hierarchy of PDF pages 20/23/25.
The reference fields retain identical geometry in light and dark.

Reviewed live work at `http://localhost:4331` and fresh rendered evidence at
1440×1000, 768×1024, and 390×844. The full matrix checks every substantive route;
close visual inspection concentrated on opening, typography, record, and
installed-consumer surfaces where the material defects occurred. Automated
matrix success is not a claim of pixel-by-pixel inspection of all 126 captures.

## Retained evidence and reproduction

- [Final route matrix](review-evidence/matrix.json): 21 routes × 2 themes × 3 viewports; loaded fonts, errors, overflow, and open-Dialog observations.
- [Independent consumer observations](review-evidence/consumer.json): six combinations, no workspace imports or docs stylesheet.
- [Typography, mobile light](review-evidence/foundations_fonts-light-390x844-detail.png), [tablet dark](review-evidence/foundations_fonts-dark-768x1024-detail.png), [desktop light](review-evidence/foundations_fonts-light-1440x1000-detail.png).
- [Record, desktop light](review-evidence/patterns_reference-record-light-1440x1000-detail.png), [mobile dark host](review-evidence/patterns_reference-record-dark-390x844-detail.png).
- [Applied review, desktop light](review-evidence/proposal-review-light-1440x1000-detail.png), [mobile dark](review-evidence/proposal-review-dark-390x844-detail.png).
- [Installed consumer, desktop dark](review-evidence/consumer-dark-1440.png), [mobile light](review-evidence/consumer-light-390.png).
- All six typography and record detail captures and six consumer captures are retained in `review-evidence/`. Earlier per-issue captures remain historical before-state evidence.

Observed passing on the corrected runtime source: frozen install; design lint;
code lint; typecheck; 70 unit/accessibility tests; token drift check; all four
controlled token-failure probes; registry drift check; fresh source-install
smoke; root/subpath docs builds and Markdown checks; browser verification at
each base mode; 126 matrix combinations; six independent consumer combinations.

Reproduce the root matrix after a root build:

```sh
bun run --cwd apps/docs build
bun apps/docs/fixtures/acceptance/capture-matrix.mjs /tmp/augur-review-matrix
bun apps/docs/fixtures/verify-docs.mjs
bun apps/docs/fixtures/verify-markdown.mjs
```

For the independent consumer, run `bun run scripts/consumer-smoke.ts --keep`,
then pass its disposable **app directory** to `prepare-consumer.mjs`. That script
replaces only the disposable App and copies the exact reference composition.
Serve that app with Vite and pass its origin to `verify-consumer.mjs`.
Do not run the preparation script against a real application.

Unchanged limitations: official artwork masters remain missing; the approved
text fallback remains in use. Cross-browser/physical-device testing is not
established by the Chromium evidence. Final human visual acceptance, GitHub
integration/acceptance status, and release remain outstanding.
