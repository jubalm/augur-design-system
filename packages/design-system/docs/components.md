# Component record — Button and Card (issue #11)

Status: implemented by issue #11 (the first component slice). This file
is the maintained record of the component design decisions behind
`src/components/`, mirroring the role of `semantic-themes.md` for the
theme layer. Consumer-facing guidance lives in the docs app component
pages (`apps/docs/src/content/components/`); the foundation proposals
referenced here are tracked with their review status in
`apps/docs/src/content/foundations/foundation-decisions.md`.

## Authority chain (ARCHITECTURE.md §7, §11)

    DESIGN.md (adopted values; brand guidance)
       ↓  pinned toolchain (issue #3)
    src/tokens/tokens.css (generated --augur-color-* primitives)
       ↓  src/styles/theme.css (issue #4)
    semantic role custom properties (--background … --ring)
       ↓  src/components/ (issue #11)
    component CSS referencing roles only + structural geometry

## Rules enforced by this slice (verified by tests)

- **No raw color values.** Every color in component CSS is a reference
  to a semantic role custom property. The repository stylesheet
  contract fails the build on any undeclared `var()` reference.
- **No new tokens.** No spacing, radius, sizing, or motion custom
  properties are emitted. Geometry appears as structural constants in
  component CSS — the same pattern the theme layer uses for the FD-04
  ring geometry (2px/2px) and the FD-05 reduced-motion collapse.
- **FD-01..FD-06 remain Proposed.** Component values align with the
  recorded proposals (the record explicitly lists this slice's needs);
  nothing presents them as adopted, and no value outside the proposal
  set was invented.

## Decisions (D1–D8, this slice)

- **D1 — Structural geometry from the proposal set.** Button heights
  32/36/40px (FD-02), horizontal padding 12/16/24px with 8px gaps
  (FD-01), radius 6px controls / 8px surfaces (FD-03), Card composition
  padding 24px with 8px inner gaps (FD-01). Rationale: the foundation
  record defines exactly these as the smallest shared needs of the
  starter set; using them keeps the components aligned with the pending
  foundation instead of creating one-offs. Pending: FD adoption
  (maintainer review, issue #2).
- **D2 — Hover/pressed as tints of existing roles.** Filled variants
  mix their own color toward transparency (90% hover, 80% pressed) via
  `color-mix`; `outline`/`ghost` step onto the theme's neutral
  highlight surface `--accent` (70% pressed); `link` gains an
  underline. Rationale: implements FD-06's "adjacent surface step or
  subtle action-color tint" without inventing colors — the plain-CSS
  analog of the shadcn `bg-primary/90` convention. Pending: FD-06
  interaction-treatment review.
- **D3 — One green signal.** Only the `default` variant consumes the
  action pairing (Deep on light, Green on dark). `link` is deliberately
  neutral (`--foreground`): text links must not multiply green marks in
  a view. Hover tints reuse the variant's own color rather than
  introducing new greens.
- **D4 — `destructive` without a danger hue.** The brand palette
  defines no danger color, so the theme maps `--destructive` to the
  strongest neutral action pairing (theme decision D1 in
  `semantic-themes.md`). The component contract therefore requires the
  consequence to be legible in the label; the variant is not a red
  substitute.
- **D5 — Disabled contract.** Native `disabled` attribute (non-interactive),
  50% opacity, `cursor: not-allowed`, label left present and readable in
  the DOM; hover/pressed styles never apply (`:not(:disabled)`).
  WCAG 1.4.3 exempts disabled controls from contrast minimums. FD-06
  Proposed treatment.
- **D6 — Loading contract.** `loading` sets `aria-busy="true"` and
  disables the button while pending. The label stays in the DOM
  (`visibility: hidden`) so the button keeps its width; a centered
  16px spinner (FD-02 inline icon size) rotates with a structural
  0.8s animation — collapsed to a static arc by the package-wide
  reduced-motion gate (no duration token exists; FD-05 Proposed) — and
  a visually hidden "Loading" status keeps the accessible name intact.
  The action color does not change: loading is not a change of intent.
- **D7 — `type="button"` default.** Deviates from upstream shadcn,
  which leaves the browser's `submit` default: accidental submission is
  the costlier failure in a records UI, so forms opt into submission
  explicitly with `type="submit"`.
- **D8 — Card is pure composition.** Six shadcn-shaped parts, no
  variant matrix, no product meaning, no interactive states at the
  container. `CardTitle` renders an `h3` (shadcn convention; real
  heading semantics), `CardDescription` is the metadata voice in
  `--muted-foreground`, `CardContent` the body voice. A `:first-child`
  padding rule keeps headerless compositions from opening flush. The
  one-green-signal rule applies per card: any `Button` in
  `CardFooter` is that panel's signal.

## Verification

- `bun test` in this package: the `buttonVariants` class contract and
  the public-entry exports (`test/components.test.ts`).
- `bun run test` at the repository root: keyboard/activation,
  disabled/loading contracts, HTML semantics, axe findings in light and
  dark scopes, and the stylesheet delivery contract through
  `./styles.css` (`tests/button-card.test.tsx`).
- Rendered review: computed-style assertions in
  `apps/docs/fixtures/verify-docs.mjs` (section "Component slice") —
  geometry, theme-following colors, disabled/loading rendering, and
  control typography in both themes; the docs component pages render
  live examples from the real package.

## Pending (not decided in this slice)

- FD-01..FD-06 adoption — maintainer review (issue #2); components
  re-derive from tokens when spacing/radius land in the toolchain.
- Mobile touch-target policy (foundation record Q2) — the 36px default
  is a dense-records desktop decision; the 44px question stays open.
- Registry items for `button`/`card` (issues #16/#17) — untouched here;
  the source paths already match the registry contract
  (`packages/design-system/src/components/…`).
- Component pages ship with `status: draft`, graduating on maintainer
  acceptance of this slice.

## Component record — Dialog (issue #13)

Status: implemented by issue #13 (the first primitive-backed
component slice). Same authority chain and rules as the #11 record
above; this section records the dialog-specific decisions (D9–D12,
continuing the numbering).

### Decisions (D9–D12, issue #13)

- **D9 — Primitive through the single `radix-ui` package.** The dialog
  consumes `import { Dialog as DialogPrimitive } from "radix-ui"`
  (exact pin `1.6.7`, which resolves to the pinned
  `@radix-ui/react-dialog@1.1.23` internally), not a per-primitive
  `@radix-ui/*` specifier: the registry contract (issue #16, §6) names
  the single `radix-ui` package as the verified upstream scaffold's
  runtime dependency, and future primitives (dropdown, tooltip) then
  add no new runtime dependency. All modal behavior — focus trap and
  loop, focus restoration, Escape/outside-press dismissal, scroll
  lock — is the primitive's; no custom focus-trap engine (issue
  exclusion).
- **D10 — The scrim mixes the theme's own `--foreground`.** No role in
  the dark theme is darker than its Navy canvas, so a single structural
  rule (`color-mix(in srgb, var(--foreground) 40%, transparent)`) is
  the only formulation that behaves identically across explicit light,
  explicit dark, AND the system-preference fallback without a
  theme-keyed selector (which would drift from theme.css's fallback
  scope). Light: a standard dark Navy veil. Dark: a light Paper mist —
  the scrim separates the floating layer by lifting instead, since a
  darker-than-canvas scrim is not expressible from adopted roles. Zero
  raw values; revisit if a scrim role is ever adopted as a token.
- **D11 — Naming enforced against the rendered panel.** Radix wires
  `aria-labelledby`/`aria-describedby` from its own title/description
  presence tracking, but its production build compiles out the dev
  warning. Augur therefore checks the RENDERED panel's attributes after
  the portal settles (a macrotask after mount — the portal mounts its
  children one commit late, and the primitive settles ARIA one render
  after that) and logs a console error for a missing name (no
  `DialogTitle`, no `aria-label`/`aria-labelledby`) and a console
  warning for a missing `DialogDescription`. Reading the rendered
  attributes — rather than tracking children in a parallel registry —
  means the check cannot disagree with the primitive.
- **D12 — `size` on `DialogContent`; `container` for portal theme
  inheritance.** Two Augur-owned additions to the shadcn shape, both
  compositional: `size` (sm 24rem / md 32rem / lg 40rem, capped at
  `100vw − 16px`) is the width axis the docs page contract requires and
  long-content/mobile behavior needs; `container` forwards to the
  internal `DialogPortal` so a dialog inside a scoped `[data-theme]`
  subtree inherits that subtree's theme (the acceptance criterion the
  default `document.body` portal cannot satisfy on its own).

### Verification (issue #13)

- `tests/dialog.test.tsx` (repository harness): open/close via click,
  Enter, and `DialogClose`; Escape and scrim dismissal; focus moves in
  and is trapped; focus restored to the trigger; controlled and
  uncontrolled usage; `aria-labelledby`/`aria-describedby` wiring; the
  D11 warnings (positive and negative); portal rendering and the
  `container` dark-scoped portal; axe-clean open dialogs (light, dark
  scope, attribute-named); stylesheet delivery of the dialog sheet.
- `test/components.test.ts` (in-package): public-entry export surface.
- Docs: `/components/dialog` renders the full section-contract page
  with the static composition example and the interactive playground
  island (default, long-content, and dark-scoped portal dialogs).

### Pending (issue #13)

- Real-browser focus/scroll/computed-style review in both themes —
  owned by #15 (Playwright); the docs page is the review surface.
- Registry item for `dialog` — #17 publishes it; the source path and
  the `radix-ui` dependency already match the registry contract.
---

# Component record — Input and FormField (issue #12)

Status: implemented by issue #12 (the second component slice). This
section extends the record above with the decisions behind
`src/components/input/` and `src/components/form-field/`; the Button
and Card decisions (D1–D8) are unchanged. Consumer-facing guidance
lives in the docs app (`components/input` page and the first
`patterns/form-field` entry).

## Rules enforced by this slice (verified by tests)

- Same authority chain as the first slice: semantic role custom
  properties only, structural geometry from the FD-01/FD-02/FD-03
  proposal set, no new tokens, no raw color values (the stylesheet
  contract fails the build on any undeclared `var()` reference).
- **Input is independent of FormField.** `input.tsx` imports nothing
  from the form-field tree; `FormFieldControl` composes `Input`. The
  harness proves a bare Input works with consumer-owned labeling.
- No product form framework: no validation rules, no form state, no
  submission handling in either module.

## Decisions (D9–D12, this slice)

- **D9 — One input treatment, structural geometry from the proposal
  set.** 36px height (FD-02 `control.height.md`), 12px horizontal
  padding (FD-01; a step tighter than the md button's 16px — text
  fields read better tighter, and the value is from the proposal
  set), 6px radius (FD-03 `radius.control`, which names inputs
  explicitly), transparent background on the `--input` hairline so
  the control sits on any surface, full width by default because the
  container lays fields out. Placeholder in `--muted-foreground`
  (the recorded AA secondary-text pairings, semantic-themes decision
  D4), `opacity: 1` so the UA default dimming does not stack with
  the role color. No variant or size matrix ahead of concrete
  requirements.
- **D10 — Invalid, read-only, and disabled are three distinct
  contracts.** Invalid (`invalid` prop → `aria-invalid="true"`):
  border takes `--destructive`; the visible error MESSAGE carries the
  meaning because the theme defines no danger hue (first-slice D1/D4
  rule) — never color alone. Read-only (native `readOnly`): still
  focusable, value selectable and copyable; a quiet `--muted` surface
  signals "displayed, not edited" — deliberately NOT the disabled
  treatment, so display-and-copy never hides behind a disabled look.
  Disabled: the first slice's D5 contract unchanged (opacity 0.5,
  `not-allowed`). Keyboard focus needs no per-component CSS: the
  theme contract's shared `:focus-visible` ring applies.
- **D11 — FormField wiring contract.** The pattern owns exactly the
  relationships that are easy to get wrong: label `htmlFor` → control
  `id` (a real label association, React `useId`-generated);
  `aria-describedby` lists the description id always and the error id
  exactly when an error is present (no dangling idrefs — they fail
  axe); error presence derives `aria-invalid` and renders the message
  with `role="alert"`; `required` reaches the control as the native
  attribute plus an `aria-hidden` visible marker. The API is
  prop-driven (`label`/`description`/`error`/`required` + a
  `FormFieldControl` slot) so the correct wiring is the default path;
  the parts are exported for custom compositions that take their own
  wiring in hand. Validation stays consumer-side: pass
  `error={undefined}` when valid.
- **D12 — Typography voices.** The control uses the `ui` voice (Sora
  400 14/20) — entered text is content, not the 600-weight control
  label voice Button uses for its own label. FormField labels carry
  the `control` voice (Sora 600 14/20); description and error
  messages carry the `metadata` voice (Schibsted Grotesk 12/16), the
  system's supporting-text register; the error renders in
  `--destructive`, which equals the foreground in light (the text
  carries the meaning there) and Pewter in dark.

## Verification (this slice)

- `bun test` in this package: the public-entry exports
  (`test/input-form-field.test.ts`), plus the stylesheet-consumption
  walk, which now covers the input and form-field aggregates.
- `bun run test` at the repository root: keyboard input (uncontrolled
  and controlled), label `htmlFor`/`id` and `aria-describedby` wiring
  including the no-error case, invalid/disabled/read-only contracts,
  required semantics, Input's independence from FormField, and axe
  findings over compositions with explicit error text in light and
  dark scopes (`tests/input-form-field.test.tsx`).
- Rendered review: the docs component page (`/components/input`) and
  pattern page (`/patterns/form-field`) render live examples in both
  themes with explicit error text; computed-style review of the built
  pages in both themes accompanies the slice's PR.
