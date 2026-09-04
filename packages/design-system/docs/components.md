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
