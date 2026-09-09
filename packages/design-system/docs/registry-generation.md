# Registry generation policy

The root `registry.json` and all per-item registry JSON are **generated
artifacts**, like the token output (`src/tokens/`). They are never edited by
hand. Authority chain (contract: [`registry-contract.md`](registry-contract.md)
§3, `token-generation.md`):

```
DESIGN.md → tokens.css (pinned toolchain)
src/styles/theme.css, fonts.css, styles.css   (canonical relationships)
src/components/*, src/patterns/*              (canonical component source)
        ↓  bun run registry:generate   (this policy)
registry.json (repo root, index form)          — committed
public/r/<name>.json (built-item form)         — committed
packages/design-system/registry-src/utils.ts   — committed
```

## Commands (packages/design-system)

| Command | What it does |
| --- | --- |
| `bun run registry:generate` | Regenerates all three artifact groups from canonical sources. |
| `bun run registry:check` | Regenerates in-memory and fails on any drift (mirrors `tokens:check`). |
| `bun run registry:validate` | `bunx shadcn@4.20.1 registry validate registry.json` from the repo root (pinned CLI, contract §1). |

The registry scripts are not part of the default CI workflow; run them
locally or in release preparation. Schema-level validation with the vendored
schemas (ajv `8.20.0`, fail-closed positives + mutations) lives in
`fixtures/registry/validate-registry-fixtures.mjs`; the generator
additionally runs internal completeness checks (every referenced file exists,
every `registryDependencies` resolves inside the registry, every npm
dependency is exact-pinned, no `devDependencies`, theme+utils required on
every component item).

## What is derived, never hand-copied

- **Base tokens**: parsed from the generated `src/tokens/tokens.css`
  (`--augur-color-*`, uppercased hex) — the curated delivery subset mirrors
  the registry fixture (D5).
- **Semantic roles**: parsed from `src/styles/theme.css` `:root` (light) and
  `[data-theme="dark"] {` (dark) blocks; the generator hard-fails if the
  system-preference fallback block differs from the explicit dark block.
- **Fonts**: voice values derived from `src/styles/fonts.css` (first quoted
  family per voice, plus the system fallback stack); `@import` lines derived
  from `src/styles/styles.css`; exact-pinned `@fontsource` dependencies per
  contract §9 (`registry:font` rejected, D4).
- **Structural CSS** (body canvas, `:focus-visible` ring, reduced-motion
  gate, `@custom-variant dark`): structural rules referencing roles only.
- **Component file content**: canonical component source (contract §5.1 —
  `path` always points at the canonical repository file) with three
  documented consumer-shape transforms:
  1. `import { cx } from ".../internal/cx"` → `import { cx } from "@/lib/utils"`
     (consumer utils alias, §7);
  2. cross-item relative imports → alias imports
     (`../input/input` → `@/components/ui/input`,
     `../page-header/page-header` → `@/components/page-header`);
  3. a side-effect `import "./<name>.css"` is prepended to the primary
     component file, and the component CSS ships as a `registry:file` with an
     explicit `@ui/…`/`@components/…` target. Installed source therefore never
     imports `@augur/design-system` (§11) and never relies on bundled npm
     output.

The generated `augur-theme` item is verified equal (css byte-identical,
cssVars key/value identical) to the pinned registry fixture
`fixtures/registry/registry-item.fixture.json` — the executable evidence for
§12's build check.

## Item catalog (starter set, contract §4)

| Item | Type | Target(s) | Extra deps |
| --- | --- | --- | --- |
| `augur-theme` | `registry:theme` | css/cssVars merged | `@fontsource/sora@5.3.0`, `@fontsource/schibsted-grotesk@5.3.0` |
| `utils` | `registry:lib` | `@lib/utils.ts` | `clsx@2.1.1`, `tailwind-merge@3.3.1` |
| `button` | `registry:ui` | `@ui/…` | — |
| `card` | `registry:ui` | `@ui/…` | — |
| `input` | `registry:ui` | `@ui/…` | — |
| `form-field` | `registry:ui` | `@ui/…` | registry-depends on `input` |
| `dialog` | `registry:ui` | `@ui/…` | `radix-ui@1.6.7` |
| `page-header` | `registry:block` | `@components/…` | — |
| `empty-state` | `registry:block` | `@components/…` | registry-depends on `button`, `page-header` |

Every component/pattern item also depends on `augur-theme` and `utils` via
full GitHub addresses (`jubalm/augur-design-system/<item>`, contract §6.2).

## Pinning and determinism

- Output is deterministic; `registry:check` fails on drift when run locally or
during release preparation (it is not part of the default CI workflow).
- `registryDependencies` are committed **without** a ref (resolve to the
  default branch). `AUGUR_REGISTRY_SHA=<40-char sha>` stamps `#<sha>` pins at
  release time (contract §14); consumer installs should pin full SHAs.
- `public/r/` is the GitHub-Pages-compatible built channel; the root
  `registry.json` is the GitHub source-registry index consumed directly by
  the CLI for `jubalm/augur-design-system/<item>` installs.

## Theme item and visual parity

The theme item exports every generated color, spacing, and rounded variable,
the maintained typography stylesheet as `src/styles/augur-typography.css`,
and explicit light and dark container scopes. The import is installed through
the existing registry theme mechanism. `registry:check` detects output drift;
`apps/docs/fixtures/acceptance/verify-consumer.mjs` checks rendered values after
a fresh source install. Build success alone does not establish visual parity.
