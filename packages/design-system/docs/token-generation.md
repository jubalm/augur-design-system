# Base token generation (`DESIGN.md` → generated tokens)

How `packages/design-system` turns the repository-root `DESIGN.md` into
machine-readable base tokens using the pinned `@google/design.md` toolchain.

## Authority chain

Per `ARCHITECTURE.md` ("Theme mapping", "Authority and source precedence"):

```text
DESIGN.md (repository root — canonical for schema-representable values)
   ↓  pinned @google/design.md lint + export
generated base tokens (packages/design-system/src/tokens — derived artifacts, never edited)
   ↓  semantic theme mapping (light/dark)
CSS variables / component consumption
```

The generator is a transport layer, not a design authority. It runs the pinned
CLI verbatim and adds provenance metadata; it never interprets, renames,
restructures, or extends design values.

## Generated file set and policy

Everything in `packages/design-system/src/tokens` is generated **except**
`README.md`:

| File | Format | Contents |
| --- | --- | --- |
| `tokens.css` | `design.md export --format css-vars --prefix augur` | Colors as `--augur-color-*`, spacing as `--augur-spacing-*`, and radius as `--augur-rounded-*` custom properties |
| `tokens.tailwind.css` | `design.md export --format css-tailwind` | Tailwind v4 `@theme` block: colors, typography, spacing, and radius tokens |
| `tokens.dtcg.json` | `design.md export --format dtcg` | W3C Design Tokens (color, typography, spacing, rounded groups), wrapped in a `$provenance` envelope under a `tokens` key |
| `manifest.json` | built by the generator | Provenance + per-artifact sha256/bytes; machine-checkable generation record |

Policy:

1. **Never hand-edit generated artifacts.** Regenerate instead:
   `bun run tokens:generate` in `packages/design-system`.
2. **Never hand-maintain copies of raw `DESIGN.md` values** anywhere else —
   components and docs reference generated tokens (and, from #4, semantic
   mappings of them).
3. Every artifact carries provenance: source content hash, tool name/version,
   exact command, and the lint summary at generation time. `tokens.css` and
   `tokens.tailwind.css` carry it as a header comment; `tokens.dtcg.json`
   carries it as the `$provenance` member (the CLI's verbatim output is the
   `tokens` member); `manifest.json` records hashes of all artifacts.
4. After any `DESIGN.md` change, regenerate and commit the artifacts together
   with the `DESIGN.md` change.

## Commands

Run from `packages/design-system`:

| Command | What it does | Exit behavior |
| --- | --- | --- |
| `bun run tokens:lint` | Lints the repository-root `DESIGN.md` with the pinned CLI | Nonzero on lint errors |
| `bun run tokens:generate` | Lint gate → export → verify → write artifacts + manifest | Nonzero on any gate/export/verification failure |
| `bun run tokens:check` | Regenerates in memory and byte-compares with committed artifacts; also flags unexpected files in `src/tokens` | `0` identical, `1` drift |
| `bun run tokens:verify-failures` | Runs the real pipeline against controlled invalid inputs and asserts every failure path exits nonzero and writes nothing | `0` all paths fail as designed, `1` otherwise |

Fixtures (controlled invalid inputs, not design sources):
`src/tools/fixtures/invalid-ref/DESIGN.md` (unresolvable `{ref}`) and
`src/tools/fixtures/malformed-yaml/DESIGN.md` (parser-tolerated YAML that
degrades exports).

## Toolchain pin

`@google/design.md` is pinned to **exactly `0.4.0`** in
`packages/design-system/package.json` (`ARCHITECTURE.md`, "Pinned
`@google/design.md`"). The generator enforces the pin at runtime:

- the declared version must be an exact semver (no `^`, `~`, or ranges);
- the installed copy must match the declared version;
- generation refuses to run otherwise.

The pinned CLI is executed with the same runtime that runs the generator
(`bun` in this workspace), from the workspace install resolved by walking up
from `packages/design-system`.

## Failure contract

`export` alone is not safe: `design.md export` **silently drops** unresolvable
references and emits empty output for parser-tolerated malformed YAML while
exiting `0`. Generation therefore fails closed on three paths, each proven by
`bun run tokens:verify-failures`:

1. **Invalid references** — the lint gate reports any error finding (e.g.
   `broken-ref`); the pipeline refuses to generate.
   *Proven with:* `fixtures/invalid-ref/DESIGN.md` → pipeline exits nonzero
   with `[broken-ref] components.broken-component: Reference
   {colors.does-not-exist} does not resolve to any defined token.`
2. **Export failures** — any export command exiting nonzero, or a missing
   source, stops the pipeline.
   *Proven with:* a nonexistent source path → `source-missing`, exit nonzero.
3. **Degenerate exports** — outputs are verified structurally and
   cross-artifact (dtcg parses with non-empty `color`, `typography`,
   `spacing`, and `rounded` groups; css-vars custom-property count equals
   the dtcg color + spacing + rounded counts; css-tailwind contains the
   `@theme` block with matching color, spacing, and radius counts plus
   typography properties). Verification checks structure and counts, never
   hardcoded design values. Since issue 45 a controlled fixture
   (`missing-45-sections`) proves the guard fires when the adopted
   spacing/rounded sections go missing from an otherwise valid source.
   *Proven with:* `fixtures/malformed-yaml/DESIGN.md` → lint passes with
   warnings only, export emits an empty token document, verification fails the
   pipeline with `degenerate-export`.

In all three paths no artifacts are written. Re-run the proofs any time with
`bun run tokens:verify-failures`.

## Determinism

Generated output contains **no timestamps or volatile metadata**. Provenance
ties each artifact to the source content sha256 and the exact tool version, so
the same `DESIGN.md` bytes + same tool version always produce byte-identical
output. (The git commit is deliberately excluded: embedding it would make a
regeneration diff against unchanged `DESIGN.md`, creating false drift.)

Reproduce:

```bash
cd packages/design-system
bun src/tools/generate-tokens.ts --out /tmp/run-a
bun src/tools/generate-tokens.ts --out /tmp/run-b
diff -r /tmp/run-a /tmp/run-b   # → no differences
diff -r /tmp/run-a src/tokens   # → no differences (committed == regenerated)
```

`manifest.json` is the machine-readable record of per-artifact hashes and the
source `DESIGN.md` sha256; `bun run tokens:check` fails on any drift, so hash
values are not duplicated in prose.

## Supported schema boundaries (pinned toolchain 0.4.0)

What the pinned toolchain supports, and therefore what this generator emits:

- **Exported as base tokens:** the `colors`, `typography`, `spacing`, and
  `rounded` front-matter groups (the toolchain's exportable groups). Since
  the spacing scale (xs–2xl = 4/8/12/16/24/32px) and the 0px
  control/surface radius are adopted and emitted. This is the
  complete emitted surface — no more, no less.
- **Validated but not exported:** the `components` section (pairings such as
  `action-primary-light`). The linter checks its `{references}`; no 0.4.0
  export format emits it. Pairings remain a `DESIGN.md` concern and are
  expected to inform the semantic theme mapping, which must reference
  generated base tokens rather than restate raw values.
- **Not representable by the schema → no tokens:** control sizing, focus
  treatment, motion/reduced motion, and interaction-state treatment have no
  schema sections and stay owned by foundation
  documentation and component implementation per `ARCHITECTURE.md`. The
  generator cannot emit them without inventing semantics, and does not.

Consequence: any token concept not produced by the pinned CLI's export does not
exist as a base token. Do not add hand-written token files to `src/tokens`;
extend `DESIGN.md` within the schema, or resolve a foundation decision through
maintainer review first.

## Upgrade procedure (exact)

A tool-version change is a deliberate design-system migration, reviewed as
such:

1. Choose the target version and read its changelog/release notes
   (`github.com/google-labs-code/design.md`). Note any export-format or
   lint-behavior changes.
2. In `packages/design-system/package.json`, change the
   `@google/design.md` devDependency to the new **exact** version (no ranges).
3. Run `bun install` at the repository root (updates `bun.lock`).
4. Regenerate: `cd packages/design-system && bun run tokens:generate`.
5. Review the artifact diff as a design review: token set changes, value
   changes, ordering, naming, CSS/JSON shape. Anything unexpected is a
   migration question, not a mechanical bump.
6. Run all gates: `bun run tokens:lint`, `bun run tokens:check`,
   `bun run tokens:verify-failures`, plus the repository `typecheck`.
7. Update the version table below and this document wherever behavior changed.
   Record the migration (rationale + diff highlights) in the PR and, after
   merge, in the changelog.

## CI integration

`.github/workflows/ci.yml` runs the deterministic gates on every pull request
and push to `main`:

- `bun run lint` — `DESIGN.md` validity under the pinned schema.
- `bun run --cwd packages/design-system tokens:check` — drift gate:
  regeneration must equal the committed artifacts.
- `bun run --cwd packages/design-system tokens:verify-failures` — the
  controlled generation failure paths exit nonzero and write no artifacts.

The package scripts are the stable contract; CI invokes them directly.

## Toolchain version history

| Version | Status | Notes |
| --- | --- | --- |
| `0.4.0` | **current** | Initial pin. Exports: `css-vars`, `css-tailwind`, `json-tailwind`, `dtcg`. Colors, typography, spacing, and rounded values exported; `components` validated only. `lint --format text` still emits JSON (tool quirk, harmless). |
