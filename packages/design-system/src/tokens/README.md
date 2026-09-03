# Generated base tokens

**Everything in this directory is generated. Do not edit by hand.**

Generated from the repository-root `DESIGN.md` by the pinned
`@google/design.md@0.4.0` toolchain (issue #3):

- `tokens.css` — colors as `--augur-color-*` CSS custom properties
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

FD-01…FD-06 in `apps/docs/src/content/foundations/foundation-decisions.md` are
**Proposed, not adopted**: no spacing, radius, sizing, focus, or motion tokens
exist here.
