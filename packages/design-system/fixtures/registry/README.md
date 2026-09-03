# Registry contract fixture (issue #16)

A minimal, schema-validated instance of the shadcn registry and consumer
installation contract specified in
[`../docs/registry-contract.md`](../../docs/registry-contract.md). This is a
contract fixture, not the registry: the real `registry.json` and item
generation land with issue #17.

## Files

| File | What it is |
| --- | --- |
| `registry.fixture.json` | Minimal root registry (index) instance — one `augur-theme` item, inline payload, no `files`. Validates against `schema/registry.schema.json`. |
| `registry-item.fixture.json` | The same item in built-item form — byte-for-byte the `public/r/augur-theme.json` produced by `bunx shadcn@4.20.1 build` from `registry.fixture.json` on 2026-09-04. Validates against `schema/registry-item.schema.json`. |
| `invalid/registry-item.missing-type.json` | Deliberate mutation of the item fixture (required `type` removed). Must fail validation. |
| `invalid/registry-item.font-without-metadata.json` | Deliberate mutation (`type` → `registry:font` without the required `font` metadata). Must fail the schema's `allOf` branch. |
| `schema/registry.schema.json` | Verbatim `https://ui.shadcn.com/schema/registry.json` (fetched 2026-09-04). |
| `schema/registry-item.schema.json` | Verbatim `https://ui.shadcn.com/schema/registry-item.json` (fetched 2026-09-04). |
| `schema/draft-07.meta-schema.json` | Verbatim JSON Schema draft-07 meta-schema from `https://json-schema.org/draft-07/schema` (fetched 2026-09-04). |
| `validate-registry-fixtures.mjs` | Fail-closed validator: positives must pass, mutations must fail, ajv version pin enforced at runtime. |

## Schema provenance (SHA-256, as vendored)

```text
692e1d165e47afcb5f11b2ce1c639635ffa834035d6ecb6bcf3087481dae8404  schema/draft-07.meta-schema.json
cdf0fba75a26ebf594018264eff2d55407ec14deb3071d0fce0e2b20848e5d44  schema/registry-item.schema.json
e716ebe595bbc189db2627cb75f0484cd765a09eb397a89b1f1c49074220d4bb  schema/registry.schema.json
```

The schema files are verbatim upstream bytes. The validator registers them
under their canonical URL keys (`addSchema`) instead of editing them, because
the registry (index) schema `$ref`s the item schema by URL and ajv v8 keys the
bundled draft-07 meta-schema under the `http://` id while the files declare
`https://…#`.

## Run

ajv is deliberately not a workspace dependency (same pattern as the font
fixture's linked playwright install):

```sh
mkdir -p /tmp/augur-ajv && cd /tmp/augur-ajv
bun init -y >/dev/null && bun add ajv@8.20.0
ln -s /tmp/augur-ajv/node_modules \
      <repo>/packages/design-system/fixtures/registry/node_modules
cd <repo>
bun packages/design-system/fixtures/registry/validate-registry-fixtures.mjs
```

### Recorded output (2026-09-04, ajv 8.20.0, Bun 1.4.0)

```text
PASS  registry.fixture.json: valid (expected valid) — minimal root registry (index) instance
PASS  registry-item.fixture.json: valid (expected valid) — minimal registry item instance (built-item form)
PASS  invalid/registry-item.missing-type.json: invalid (expected invalid) — data must have required property 'type', data must have required property 'font', data must match "then" schema, data must have required property 'type'
PASS  invalid/registry-item.font-without-metadata.json: invalid (expected invalid) — data must have required property 'font', data must match "then" schema
registry contract fixture validation passed
```

Exit code `0`. Any `FAIL` line, a passing mutation, or an ajv version
mismatch exits `1`.

## Complementary CLI validation

Schema validation does not enforce root `name`/`homepage` (the upstream schema
leaves them optional for included chunks). The pinned CLI enforces them — a
root registry missing both fails with exit `1` and actionable messages
(recorded against the CLI 4.20.1):

```text
registry.json
  - Root registry.json must define "name".
    Add a top-level "name" field to the root registry.json.
  - Root registry.json must define "homepage".
    Add a top-level "homepage" field to the root registry.json.
```

The full install-flow verification (validate → build → serve → `add` into a
fresh consumer → production build) is specified and evidenced in
[`../docs/registry-contract.md`](../../docs/registry-contract.md), "Local
predeployment test path".
