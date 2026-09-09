# Semantic themes (`DESIGN.md` → generated tokens → shadcn-compatible roles)

This document records the semantic theme mapping in
[`src/styles/theme.css`](../src/styles/theme.css), the public
[`src/styles/styles.css`](../src/styles/styles.css) entry, and the decisions
behind them. Run the executable evidence with `bun test` in this package.

## Authority chain

Per `ARCHITECTURE.md` ("Theme mapping"), the layering is:

```text
DESIGN.md                          (canonical for schema-representable values)
   ↓  pinned @google/design.md toolchain
src/tokens/tokens.css              (generated --augur-color-* primitives)
   ↓  this mapping
src/styles/theme.css               (semantic color roles; references generated variables only)
   ↓
import "@augur/design-system/styles.css"   (public entry; aggregates everything)
```

Rules held by this layer (enforced by `test/semantic-theme.test.ts`):

- **No raw color values.** `theme.css` contains only `var(--augur-color-*)`
  references; a literal hex/rgb/hsl value fails the tests. Raw values live
  exclusively in generated output.
- **Color roles only.** `theme.css` maps color roles. Spacing and corner
  radius are generated `--augur-spacing-*` / `--augur-rounded-*` primitives
  consumed directly by component CSS; control sizing, focus geometry, and
  motion are structural CSS, not theme roles.
- **Themes swap color roles only.** Typography roles (`typography.css`),
  the focus rule, the reduced-motion gate, and the canvas application are
  each defined exactly once outside the theme scopes, so light and dark
  are equivalent by construction.

## Theme selection model

| Situation | Result |
| --- | --- |
| No attribute, light system preference | Light (default, `:root`) |
| No attribute, `prefers-color-scheme: dark` | Dark (system fallback scope) |
| `[data-theme="dark"]` on `html` or any container | Dark for that subtree |
| `[data-theme="light"]` under a dark system preference | Light (explicit pin wins) |

Each scope also sets `color-scheme` (`light`/`dark`) so native form
controls, scrollbars, and UA dark rendering follow the selected theme.
`data-theme` works at any container level because the roles are ordinary
cascading custom properties.

## Role mapping

shadcn role names describe **jobs**, not colors. Two name collisions with
brand companion names are deliberate and documented:

- shadcn `--primary` (the main action slot) is **Deep** in light and
  **Green** in dark; `--augur-color-primary` remains the Navy companion and
  fills the dark canvas and the light text role.
- shadcn `--accent` (the hover/highlight surface slot) is a neutral step,
  not the Green companion (see decision D2).

### Light theme (default)

| Role pair | Generated references | Pairing source | Contrast |
| --- | --- | --- | --- |
| `--foreground` / `--background` | `primary` on `surface-light` | page-canvas-light (inherited) | 17.49:1 |
| `--card-foreground` / `--card` | `primary` on `surface-light-raised` | panel-light (inherited pairing) | 19.03:1 (recomputed) |
| `--popover-foreground` / `--popover` | `primary` on `surface-light-raised` | raised step | 19.03:1 (recomputed) |
| `--primary-foreground` / `--primary` | `surface-light-raised` on `accent-deep` | action-primary-light (inherited) | 7.80:1 |
| `--secondary-foreground` / `--secondary` | `primary` on `surface-light-muted` | muted-region-light (inherited) | 16.17:1 |
| `--muted-foreground` / `--muted` | `secondary` on `surface-light-muted` | new pairing (decision D4) | 7.22:1 (recomputed) |
| `--accent-foreground` / `--accent` | `primary` on `surface-light-muted` | muted-region-light (inherited) | 16.17:1 |
| `--destructive-foreground` / `--destructive` | `surface-light-raised` on `primary` | decision D1 | 19.03:1 (recomputed) |
| `--border`, `--input` | `border-light` | divider-light (inherited) | hairline (see D5) |
| `--ring` | `accent-deep` | focus-ring role | ≥ 6.63:1 on all role surfaces |

### Dark theme (`[data-theme="dark"]` and system fallback)

| Role pair | Generated references | Pairing source | Contrast |
| --- | --- | --- | --- |
| `--foreground` / `--background` | `surface-light` on `primary` | page-canvas-dark (inherited) | 17.49:1 |
| `--card-foreground` / `--card` | `surface-light` on `surface-dark-1` | panel-dark-1 (inherited pairing) | 16.34:1 (recomputed) |
| `--popover-foreground` / `--popover` | `surface-light` on `surface-dark-2` | panel-dark-2 (inherited) | 15.19:1 |
| `--primary-foreground` / `--primary` | `primary` on `accent` | action-primary-dark (inherited) | 11.87:1 |
| `--secondary-foreground` / `--secondary` | `surface-light` on `surface-dark-2` | panel-dark-2 (inherited) | 15.19:1 |
| `--muted-foreground` / `--muted` | `secondary-dark` on `surface-dark-1` | secondary-text-dark family | 7.03:1 (recomputed) |
| `--accent-foreground` / `--accent` | `surface-light` on `surface-dark-2` | panel-dark-2 (inherited) | 15.19:1 |
| `--destructive-foreground` / `--destructive` | `primary` on `secondary-dark` | decision D1 | 7.53:1 (reversed documented pair) |
| `--border`, `--input` | `surface-dark-mist` | divider-dark (inherited) | hairline (see D5) |
| `--ring` | `accent` | focus-ring role | ≥ 10.31:1 on all role surfaces |

"Recomputed" ratios are calculated with the WCAG 2.x relative-luminance
formula in `test/semantic-theme.test.ts` from the *generated* values at
test time; the test also asserts that every ratio DESIGN.md records for a
mapped pairing reproduces exactly (17.49, 7.80, 16.17, 15.19, 11.87, 7.53).
New pairings introduced by this mapping (D1, D4, card/popover steps) were
rechecked before shipping per the DESIGN.md pairing rule.

## Schema-external decisions (recorded with rationale)

The pinned `@google/design.md` schema represents colors, typography, and
component pairings. The following semantics are outside that schema and
therefore recorded here rather than in `DESIGN.md`:

### D1 — `--destructive` maps to the strongest neutral action pairing

The brand palette defines **no danger hue**. Inventing one would import an
off-brand color; using Green would invert its meaning (green = intent/go);
using Deep would mint a second green signal. Because the inherited state
rule already carries meaning in words ("never hide meaning in color
alone"), destructive actions are named by label and the slot is filled
with the strongest neutral action pairing: White on Navy in light
(19.03:1), Navy on Pewter in dark (7.53:1). Component work must pair this
slot with explicit destructive labeling. Revisit if the brand ever defines
a danger companion.

### D2 — `--accent` is a neutral hover/highlight surface, not Green or Wash

shadcn uses `--accent` for menu/command hover states — potentially many
simultaneously visible tints. The brand reserves green for the primary
action, active state, focus, or a short orienting rule (one green signal
per view), and Wash "does not replace Deep for readable green text".
Filling the hover slot with Muted (light) / Surface 2 (dark) keeps hover
neutral; the green signal stays with `--primary` and `--ring`.

### D3 — Surface step allocation

Light: canvas Paper → quiet Muted (secondary/accent) → raised White
(card/popover). Dark: canvas Navy → Surface 1 (card, muted) → Surface 2
(popover, secondary, accent). Popovers sit one step above cards because
they float over them; secondary controls sit one step above their
surrounding surface (cards in dark, canvas in light). Surface 3 and Wash
are not consumed by the base shadcn role set; they remain available to
pattern/component work (e.g. the documented Pewter-on-Surface-3 and
signal-wash pairings).

### D4 — New `muted-foreground` pairings

Graphite on Muted (7.22:1) and Pewter on Surface 1 (7.03:1) are new
pairings introduced by the shadcn role decomposition; both were recomputed
and pass AA for normal text. They extend the documented secondary-text
pairings to the muted surfaces rather than inventing values.

### D5 — Hairline borders carry no 3:1 claim

Border/Input use the inherited hairline companions (Border in light, Mist
in dark). They are separators, not the sole carrier of meaning (WCAG
1.4.1/1.4.11): component boundaries and state indication rely on the
focus ring, which is validated at ≥ 3:1 (non-text) against every role
surface in both themes.

### D6 — Deliberate omissions

- **No shadcn `--radius` role.** Components consume the generated
  `--augur-rounded-control` / `--augur-rounded-surface` primitives (0px)
  directly; the theme maps color roles only.
- **No `--chart-*`, `--sidebar-*` roles.** No current requirement; extend
  the mapping only with a documented need.
- **No hover/pressed/disabled/loading tokens.** States are component
  contracts, not theme tokens.

## Focus and reduced motion (required behavior, structural form)

- **Focus:** one shared rule paints a 2px ring with a 2px offset for
  `:focus-visible` only, colored by the theme's `--ring` (Deep light,
  Green dark). Keyboard focus only; never suppressed. The 2px/2px geometry
  is intentional CSS structure, not an emitted token.
- **Reduced motion:** one shared `@media (prefers-reduced-motion: reduce)`
  gate collapses transition/animation durations to the canonical 0.01ms,
  stops looping animations, and disables smooth scrolling — in both themes,
  including for consumer-authored motion. No duration tokens are emitted;
  the treatment is structural.

## Verification

```bash
cd packages/design-system
bun test                    # references, switching, contrast, structure,
                            # package consumption
bun run tokens:check        # generated tokens still match DESIGN.md
```

From the repository root: `bun run typecheck`, `bun run lint`,
`bun run check:workspace` cover the rest of the workspace contract.
