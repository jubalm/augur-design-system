# Palette and theme pages — issue #49

Rendered evidence for the color and theming pages organized around
visible color fields and true paired records. Comparison sources: PDF
physical pages 18 (square swatch fields, two unequal inventories with
shared alignment), 20/23 (equal light/dark query records), rendered at
[`../visual-alignment/evidence/source/`](../visual-alignment/evidence/).

## What changed

- **Color page order**: the live palette leads with Brand anchors,
  then Companions (Deep/Wash/Graphite/Pewter), then the Light and Dark
  surface ladders — core identity before implementation detail. The
  contrast-pairing table and naming rules follow. No hex value is
  restated anywhere; every chip paints a generated `--augur-color-*`
  primitive.
- **True paired theme records**: the theming demonstration pins one
  light and one dark panel side by side — identical content, order, and
  geometry under either host theme. This exposed a real package gap:
  `theme.css` had no `[data-theme="light"]` container scope, so a light
  pin inside a dark host silently stayed dark. The package now applies
  the light role set at any `[data-theme="light"]` scope (the mappings
  mirror `:root` exactly — one maintained light contract, two
  selectors).
- Both guides retain their complete clean Markdown exports and linked
  implementation detail (verify-markdown, both base paths).

## Captures

color light/dark 1440 + light 390; theming paired light/dark 1440 +
light 390.

Computed assertions in `the browser suite`: pair themes/bgs differ under
BOTH host themes, geometry identical, content parity (title aside), 12
swatches, palette group order, plus the prior chip-field guarantees.

## Reproduce

```sh
bun run --cwd apps/docs build
bun run test:browser
```
