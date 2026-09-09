# Generated base tokens

**Everything in this directory is generated. Do not edit by hand.**

Generated from the repository-root `DESIGN.md` by the pinned
`@google/design.md@0.4.0` toolchain:

- `tokens.css` — colors as `--augur-color-*`, the spacing scale as
  `--augur-spacing-*`, and corner radius as `--augur-rounded-*` CSS custom
  properties
- `tokens.tailwind.css` — Tailwind v4 `@theme` block (colors + typography)
- `tokens.dtcg.json` — W3C Design Tokens in a `$provenance` envelope
- `manifest.json` — provenance + per-artifact hashes

To change a value, edit `DESIGN.md` and regenerate:

```bash
cd packages/design-system
bun run tokens:generate   # regenerate
bun run tokens:check      # verify committed artifacts match regeneration
```

Full policy, schema boundaries, failure contract, determinism evidence, and
the upgrade procedure: [`docs/token-generation.md`](../../docs/token-generation.md)
(repository-relative to `packages/design-system`).

No sizing, focus, or motion tokens exist here; control sizing, focus
geometry, and motion are structural CSS in the component and theme layers.
