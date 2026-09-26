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

Beyond the shadcn set, the mapping declares Augur extension roles in every
scope: `--border-quiet` (quiet editorial separators), `--input-hover` (the
control hover edge, D7), and the filled-button hover steps
`--primary-hover`, `--primary-hover-foreground`, `--secondary-hover`, and
`--destructive-hover` (D8).

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
| `--primary-hover-foreground` / `--primary-hover` | `primary` on `accent` | decision D8 | 11.87:1 (Green on Navy, reversed) |
| `--secondary-foreground` / `--secondary-hover` | `primary` on `border-light` | decision D8 | 14.49:1 (recomputed) |
| `--destructive-foreground` / `--destructive-hover` | `surface-light-raised` on `secondary` | decision D8 | 8.50:1 (recomputed) |
| `--border`, `--border-quiet` | `border-light` | divider-light (inherited) | hairline (see D5) |
| `--input` | `surface-dark-mist` | control edge (decision D7) | 4.31:1 on Paper, 4.69:1 on White, 3.99:1 on Muted (non-text) |
| `--input-hover` | `secondary` | control hover edge (decision D7) | 7.81:1 on Paper (non-text) |
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
| `--primary-hover-foreground` / `--primary-hover` | `primary` on `accent-wash` | signal-wash (inherited), decision D8 | 17.15:1 (recomputed) |
| `--secondary-foreground` / `--secondary-hover` | `surface-light` on `surface-dark-3` | panel-dark-3 (inherited), decision D8 | 13.94:1 (recomputed) |
| `--destructive-foreground` / `--destructive-hover` | `primary` on `surface-light` | decision D8 | 17.49:1 (Paper on Navy, reversed) |
| `--border`, `--border-quiet` | `surface-dark-3` | panel bound and quiet separator (decision D7) | hairline (see D5) |
| `--input` | `surface-dark-mist` | divider-dark (inherited), control edge (decision D7) | 4.06:1 on Navy, 3.79:1 on Surface 1, 3.52:1 on Surface 2 (non-text) |
| `--input-hover` | `secondary-dark` | control hover edge (decision D7) | 7.53:1 on Navy (non-text) |
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

Scope (narrowed by D8): `--accent` is the hover surface for surface
controls — outline and ghost buttons, the Dialog close control, menu
items. Filled button variants no longer collapse onto it; they step to
their own palette neighbours. Neither path uses alpha tints.

### D3 — Surface step allocation

Light: canvas Paper → quiet Muted (secondary/accent) → raised White
(card/popover). Dark: canvas Navy → Surface 1 (card, muted) → Surface 2
(popover, secondary, accent). Popovers sit one step above cards because
they float over them; secondary controls sit one step above their
surrounding surface (cards in dark, canvas in light). Surface 3 carries
the dark panel bound and quiet rule (D7) and the dark secondary hover
step (D8); Wash carries only the dark primary hover (D8). Both remain
available to pattern/component work (e.g. the documented
Pewter-on-Surface-3 and signal-wash pairings).

### D4 — New `muted-foreground` pairings

Graphite on Muted (7.22:1) and Pewter on Surface 1 (7.03:1) are new
pairings introduced by the shadcn role decomposition; both were recomputed
and pass AA for normal text. They extend the documented secondary-text
pairings to the muted surfaces rather than inventing values.

### D5 — Hairline borders carry no 3:1 claim; control edges do

`--border` and `--border-quiet` are hairlines (Border in light, Surface 3
in dark). They are separators, not the sole carrier of meaning (WCAG
1.4.1/1.4.11), so they carry no contrast claim. Control edges are
different: an input's or outline button's edge is what identifies the
control, so `--input` and `--input-hover` are validated at ≥ 3:1
(non-text) against every surface a control sits on, including the
read-only Muted fill, in both themes (D7). State indication still relies
on the focus ring, validated at ≥ 3:1 against every role surface.

### D6 — Deliberate omissions

- **No shadcn `--radius` role.** Components consume the generated
  `--augur-rounded-control` / `--augur-rounded-surface` primitives (0px)
  directly; the theme maps color roles only.
- **No `--chart-*`, `--sidebar-*` roles.** No current requirement; extend
  the mapping only with a documented need.
- **No pressed/disabled/loading tokens.** Those states are component
  contracts, not theme tokens: pressed is a full `--foreground` /
  `--background` inversion and disabled is 50% opacity in both themes.
  Hover is the exception (D7, D8): its values differ per theme and per
  variant, so the steps are theme roles.

### D7 — Control edges and panel edges are distinct roles

Control edges (`--input`) and panel bounds (`--border`) previously shared
a value in one theme or the other: Graphite control edges read near
ink-weight beside Border hairlines in light, and in dark Card bounds and
input edges were both Mist and indistinguishable. They now resolve to
different steps in both themes:

| Role | Light | Dark |
| --- | --- | --- |
| `--input` | Mist | Mist |
| `--input-hover` | Graphite | Pewter |
| `--border` | Border | Surface 3 |

Mist extends from "dark edges only" to control edges in both themes; it
holds ≥ 3:1 on Paper, White, and Muted, and never carries copy. The
input hover edge is not applied to disabled, read-only, or invalid
fields, so the invalid (`--destructive`) edge is never overridden.

### D8 — Filled buttons hover to a palette neighbour

Collapsing every button variant onto `--accent` on hover made the primary
turn grey (light) or near-canvas (dark) and read as disabled rather than
engaged. Filled variants now step to a neighbouring palette colour in
their own family:

| Variant | Light hover | Dark hover |
| --- | --- | --- |
| default | Green + Navy label | Wash + Navy label |
| secondary | Border + Navy label | Surface 3 + Paper label |
| destructive | Graphite + White label | Paper + Navy label |

Every step is an existing palette colour; no alpha tints. The light
primary hover is the one documented exception to "Green on dark surfaces
only": it is transient, carries a Navy label (11.87:1), and stays inside
the primary action's own green family, so the view still has one green
signal. Pressed (full inversion), focus, disabled, and loading are
unchanged.

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
