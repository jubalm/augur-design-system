# shadcn registry and consumer installation contract (issue #16)

Status: **specified by issue #16; implemented by issue #17.** This document is
the contract the Augur registry must satisfy. It defines item naming, file
targets, dependency rules, CSS/theme/font delivery, import-alias
expectations, version-pinned installation URLs, and the local predeployment
test path. It is backed by upstream evidence (schemas and docs fetched
2026-09-04) and by an end-to-end empirical run of the pinned CLI recorded in
§12. The fixture proving schema validation lives in
[`../fixtures/registry/`](../fixtures/registry/README.md). The executable
consumer proof of this contract (issue #18) and versioned-artifact pinning
are documented in [`consumer-install.md`](consumer-install.md).

This is a distribution contract for source-installed components. It does not
introduce an npm package, a bundler layer, or framework promises beyond the
verified path (§10, §14).

---

## 1. Upstream baseline and pinned tooling

Everything in this contract is checked against the current official shadcn
sources, fetched 2026-09-04:

| Source | Reference | Evidence |
| --- | --- | --- |
| Item schema | `https://ui.shadcn.com/schema/registry-item.json` | Vendored verbatim at `../fixtures/registry/schema/registry-item.schema.json`; SHA-256 `cdf0fba7…e5d44` |
| Registry (index) schema | `https://ui.shadcn.com/schema/registry.json` | Vendored verbatim; SHA-256 `e716ebe5…20d4bb` |
| JSON Schema draft-07 meta-schema | `https://json-schema.org/draft-07/schema` | Vendored verbatim; SHA-256 `692e1d16…e8404` |
| Registry docs | `ui.shadcn.com/docs/registry`, `/docs/registry/github`, `/docs/registry/namespace`, `/docs/registry/registry-json`, `/docs/registry/registry-item-json`, `/docs/registry/getting-started` | Read 2026-09-04 |
| `components.json` / theming docs | `ui.shadcn.com/docs/components-json`, `/docs/theming` | Read 2026-09-04 |
| CLI | `shadcn` on npm | **`4.20.1`** current on 2026-09-04 |

### Pinned versions (repository pin policy applies)

| Tool | Pin | Reason |
| --- | --- | --- |
| `shadcn` CLI | `4.20.1` (exact) | Produces and validates the schemas this contract pins. All documented commands invoke `bunx shadcn@4.20.1 …`, never a floating `@latest`. |
| `ajv` | `8.20.0` (exact) | Fixture schema validation (§13). Enforced at runtime by the validator script. |

Both follow the same discipline as the `@google/design.md` and Bun pins:
upgrading is a deliberate, reviewed migration that re-runs every check in
§12–13 and updates this document, the vendored schemas, and the fixture.

---

## 2. Distribution model

Per `ARCHITECTURE.md` ("Package Build Strategy", "Initial Technical
Direction"), distribution is **GitHub-first source installation** through
shadcn-compatible conventions. Two delivery channels exist; the first is
primary:

1. **GitHub-native registry** (upstream "GitHub Registries"): the CLI reads
   the repository's root `registry.json`, resolves refs, and installs source
   files directly from the repository. Install address shape:
   `jubalm/augur-design-system/<item>` with an optional `#<ref>`.
2. **Built static JSON** (upstream "Getting Started", Option A): `shadcn
   build` emits flattened per-item JSON into `public/r/`, served as static
   files — the form the GitHub Pages docs deployment (#19) will expose and
   that namespace/URL installs consume.

Both channels carry the same contract. `shadcn build` is the bridge: it
compiles the root registry (resolving `include`) into the per-item JSON that
channel 2 serves.

**Requirements the GitHub-native path imposes on the repository** (upstream
"Requirements"): a `registry.json` **at the repository root**, valid
schemas, and referenced source files that exist. The root `registry.json`
required by #17 therefore lives at the repository root — not under
`apps/` or `packages/`.

---

## 3. Registry source and the no-duplicate rule

- The root `registry.json` and all item definitions are **generated from
  canonical sources** (component source under `packages/design-system/src`,
  token/theme output under `src/tokens` and `src/styles`), never
  hand-maintained in parallel (issue #17: "Generate and validate the starter
  source registry"; token-generation.md: "never hand-maintain copies of raw
  values").
- The registry must not import from or reference `apps/docs` (dependency
  direction, `ARCHITECTURE.md` §12).
- Generated registry artifacts follow the same policy as generated tokens:
  deterministic output, provenance recorded, drift-checked (issue #17
  acceptance criteria).

---

## 4. Item naming

Observed upstream conventions: items are identified by a unique `name`
(unique across the whole resolved registry, including `include`d files);
components are named in kebab-case (`button`, `input-form`); themes and
foundational artifacts use descriptive kebab-case names.

Augur contract:

| Item | Type | Name |
| --- | --- | --- |
| The mandatory base theme (tokens + roles + fonts + structure) | `registry:theme` | `augur-theme` |
| `cn()` utility | `registry:lib` | `utils` (upstream-conventional name) |
| Components | `registry:component` / `registry:ui` | kebab-case component name, unprefixed (`button`, `card`) |
| Patterns/blocks (later) | `registry:block` | kebab-case descriptive name |

Rules:

1. **`augur-` prefix only for registry-owned foundational artifacts**
   (`augur-theme` today). The prefix marks items a consumer installs before
   anything else.
2. **Component items are unprefixed kebab-case** to match shadcn muscle
   memory and `components.json` migration paths; the `@augur` namespace
   prefix (`@augur/button`) or the GitHub address
   (`jubalm/augur-design-system/button`) already carries provenance.
3. Names are unique across the registry; item names containing `/` are not
   used (they are legal upstream but complicate GitHub addresses, where
   `owner/repo/<name-with-slashes>` is ambiguous).
4. The name `augur-theme` and the `augur-` prefix are reserved.

Type restrictions verified in the pinned item schema (§13 fixture): only
`registry:base` items may set `style`, `iconLibrary`, `baseColor`, or
`theme`; only `registry:font` items may set `font` (and must). Augur uses
neither `registry:base` nor `registry:font` (§9).

---

## 5. File targets

Schema facts (pinned `registry-item.json`): each `files` entry has `path`
(source location relative to the registry root), `content` (inline payload,
used by built output), `type`, and `target` (consumer-relative destination).
`target` supports the placeholders `@components/`, `@ui/`, `@lib/`,
`@hooks/`, which resolve to the consumer's `components.json` aliases —
independent of the project's import prefix. `target` is schema-required only
for `registry:file`/`registry:page` files, but the CLI derives destinations
from item type when omitted.

Augur contract:

1. **`path` always points at the canonical repository source** (e.g.
   `packages/design-system/src/components/button/button.tsx`). One source of
   truth; the registry never carries a second copy of component code.
2. **`target` is always explicit**, using alias placeholders:

   | Item type | Target |
   | --- | --- |
   | `registry:ui` / component source placed in the consumer UI dir | `@ui/<name>.tsx` |
   | multi-file consumer components/blocks | `@components/…` |
   | `registry:lib` (`utils`) | `@lib/utils.ts` |
   | `registry:hook` | `@hooks/<name>.ts` |
   | plain files (rare; e.g. a docs snippet item) | project-relative path with `~/` prefix |

3. Items must not target consumer files outside the alias directories except
   via explicit `registry:file` targets, and must never target the
   consumer's `components.json`, `package.json`, or global CSS file (global
   CSS integration goes through `cssVars`/`css`, §8, which the CLI merges).

---

## 6. External and registry dependencies

Schema facts: `dependencies`/`devDependencies` are arrays of npm specifiers
and support `name@version`; `registryDependencies` are item references —
bare names, namespaced names, or URLs.

Augur contract:

1. **npm dependencies are exact-pinned in every item**
   (`"@fontsource/sora@5.3.0"`). Empirically verified (§12): the consumer's
   `package.json` receives the exact version. Component runtime dependencies
   come from the verified upstream scaffold: the single `radix-ui` package,
   `clsx` + `tailwind-merge` (via `utils`), `class-variance-authority` for
   variant-driven components, `lucide-react` for icons. Items must not
   introduce dependencies outside the consumer framework stack without a
   documented decision.
2. **`registryDependencies` always use full GitHub item addresses**
   (`jubalm/augur-design-system/augur-theme`, optionally `#<ref>`), never
   bare names. Upstream documents that same-repository dependencies in
   GitHub registries use full addresses; a bare name resolves against the
   default shadcn registry — a silent wrong-source hazard. Full addresses
   also work when the consumer installs via namespace or URL, because the
   CLI understands GitHub addresses in every mode.
3. **Items never depend on `@augur/design-system`** (§11).
4. `devDependencies` are not used by Augur items (consumers install runtime
   source only).

---

## 7. Import alias expectations

Consumers are expected to have the standard shadcn alias set (the CLI
`init` default, verified in §12):

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Contract:

1. Augur source relies only on this alias set — no other cross-file import
   assumptions about consumer projects.
2. `utils` (the `cn()` helper) is a registry item; components that format
   class names import it via the consumer's `utils` alias. `init` already
   provides it; the Augur `utils` item exists to (re)install Augur's own
   when needed and is kept compatible with the upstream signature.
3. Installed source must resolve under the consumer's TypeScript path
   mapping (or `package.json#imports`, which upstream supports via the same
   `aliases` keys). Augur documents the default `@/` tsconfig mapping and
   does not require consumers to adopt alternates.
4. Installed components import React as a peer (consumer-provided; React 19
   in the verified path) and nothing from this repository's package surface
   (§11).

---

## 8. CSS and theme delivery

### What the schema offers (pinned item schema)

- `cssVars`: `{ theme, light, dark }` — custom properties merged into the
  consumer's Tailwind CSS file configured in `components.json`
  (`tailwind.css`). `theme` feeds the Tailwind v4 `@theme inline` block;
  `light`/`dark` merge into the consumer's `:root` / `.dark` scopes.
- `css`: an object of `cssValue` — strings or arbitrarily nested
  selectors/at-rules — "CSS definitions to be added to the project's CSS
  file. Supports at-rules, selectors, nested rules, utilities, layers."

### Augur delivery (all mechanics empirically verified, §12)

The `augur-theme` item carries the complete Augur look in one install:

1. **Generated base tokens** (`--augur-color-*`, from `src/tokens/tokens.css`
   via the pinned toolchain) → `css[":root"]`. They merge into the
   consumer's existing `:root` block.
2. **Semantic role values** (`--background` … `--ring`, exactly the #4
   mapping in `src/styles/theme.css`) → `cssVars.light` and `cssVars.dark`,
   which overwrite the init-scaffold neutral values in `:root` and `.dark`.
   This keeps the shadcn `.dark` convention working for consumers who use a
   `dark` class.
3. **Augur's selector model** → `css` payload, appended verbatim:
   `[data-theme="dark"]` block (same role values), and the
   `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
   system fallback. Nested selectors inside at-rules survive the CLI merge
   (verified).
4. **`color-scheme`** → `:root` (light), `.dark` and `[data-theme="dark"]`
   and the system-fallback scope (dark), so UA rendering follows the
   selected theme.
5. **Structural behavior** → `css`: the `body` canvas application, the
   `:focus-visible` 2px/2px ring rule, and the reduced-motion gate — each
   defined once, theme-independent, as in `theme.css`.
6. **Tailwind utility mappings** → `cssVars.theme`: `--color-<role>` →
   `var(--<role>)` for the mapped role set plus `--font-sans` →
   `var(--augur-font-primary)`. This is what makes `bg-background`,
   `text-foreground`, etc. work.
7. **`@custom-variant dark`** → bare at-rule key in `css`, redefining the
   dark variant to follow `[data-theme="dark"]` and the system fallback.
   Verified: the CLI appends the redefinition, Tailwind v4 uses the last
   definition, and all compiled `dark:` utilities resolve through the
   `data-theme` selectors.

Not delivered (deliberate, per the #4 decision record D6): `--radius`,
`--chart-*`, `--sidebar-*`. FD-03 (radius) is Proposed, not adopted;
components that require `--radius` wait for adoption. The consumer's
init-scaffold values for those roles remain.

**Relationship to the package entries:** `@augur/design-system`'s
`./styles.css` and `./fonts.css` exports (used by the workspace docs app)
remain the in-repo consumption path. The registry item content is generated
from the same canonical files (§3) so the two paths cannot drift; the
registry item is self-contained and never instructs a consumer to import the
package.

---

## 9. Font delivery

**`registry:font` is rejected.** The pinned schema restricts it to Google
provider metadata with a `next/font/google` import (verified in the schema:
`provider` enum is `["google"]`; `import` is described as "the import name
for the font from next/font/google"). That couples font delivery to
Next.js-specific mechanics and third-party hosting assumptions, contradicting
`resources/brand/PROVENANCE.md` §4 (self-hosted OFL Fontsource packages
only, exact pins, no third-party CDN at runtime) and framework neutrality.

**Verified delivery instead** (§12): the `augur-theme` item

1. declares `dependencies: ["@fontsource/sora@5.3.0",
   "@fontsource/schibsted-grotesk@5.3.0"]` — the consumer receives the
   exact pinned versions in its `package.json`, and the OFL license
   obligations recorded in PROVENANCE.md travel with the packages; and
2. delivers the `@import "@fontsource/…"` lines as bare at-rule keys of its
   `css` payload. Verified behavior: the CLI **hoists `@import` statements
   to the top of the consumer CSS file** (alongside the init imports), the
   consumer's bundler resolves the bare specifiers from the installed
   packages, and the production build emits self-hosted `woff2` assets with
   `@font-face` rules — zero third-party requests.

The `--augur-font-primary` / `--augur-font-secondary` voice custom
properties (`fonts.css` content) are delivered in `css[":root"]`; the
`--font-sans` utility mapping points at the primary voice. Weights stay
exactly the PROVENANCE.md set (Sora 400 + 600, Schibsted Grotesk 400);
adding weights requires a `DESIGN.md` change first.

---

## 10. Consumer expectations and verified stack

The verified consumer path (§12): a fresh **Vite + React 19 + Tailwind CSS
v4** project produced by `bunx shadcn@4.20.1 init -t vite -b radix -p nova`,
with `components.json` exactly as generated (`style` set by the chosen
base/preset, `tailwind.css: "src/index.css"`, `tailwind.cssVariables: true`,
default `@/` aliases, `registries: {}`). The contract guarantees what was
verified against that stack and nothing more:

- components theme through semantic CSS custom properties and Tailwind v4
  utilities mapped via `@theme inline`;
- CSS-variable theming (`tailwind.cssVariables: true`) is assumed; the
  `--no-css-variables` path is not supported;
- other upstream templates (Next.js, Astro, React Router, Laravel) are
  expected to work by upstream design but are **not verified**; docs-app
  verification arrives with #7. Do not document them as supported until
  tested.

Namespace configuration (optional, for `@augur/…` installs once the built
JSON channel exists, #19):

```json
{
  "registries": {
    "@augur": "https://<docs-host>/r/{name}.json"
  }
}
```

---

## 11. Independence from `@augur/design-system`

`ARCHITECTURE.md` §10: "Registry-installed source should not depend on the
existence of a bundled npm package." This contract operationalizes that:

1. **No package imports.** Registry-installed source never imports
   `@augur/design-system` or any `@augur/*` specifier. It depends only on:
   the consumer's React, the item-declared npm dependencies (§6), and the
   consumer's alias-resolved files (§7).
2. **No npm publication dependency.** Nothing in the install flow reads or
   requires an npm package named `@augur/design-system`; none exists. The
   workspace package remains `private: true`; its `exports` (`.`,
   `./styles.css`, `./fonts.css`) serve the in-repo docs app via
   `workspace:*` only.
3. **Styles are self-contained.** The theme item delivers tokens, roles,
   fonts, and structure into the consumer's CSS (§8–9). A consumer that
   never installs the package gets the same visual system as the docs app.
4. **Update model.** Components are updated by re-running `add` with
   `--overwrite` against a pinned ref; the consumer's lockfile pins the
   exact npm dependencies the items declare. tsup/bundled output stays
   deferred (root README); if it ever lands, it cannot become a hidden
   dependency of registry installs.
5. **Reverse isolation.** The registry (and the package) must not import
   from `apps/docs` (§3).

---

## 12. Local predeployment test path (verified 2026-09-04)

Every registry change is verified end-to-end locally before a ref is
published for consumers. Recorded transcript, run in this branch's
verification (all commands with the pinned CLI; fresh consumer in
`/tmp/augur-consumer`):

```text
1. Schema validation (fixture + real registry, §13)
   bunx shadcn@4.20.1 registry validate ./registry.json
   → ✔ Registry is valid. ✔ Checked 1 registry file and 1 item.  (exit 0)

2. Build static JSON
   bunx shadcn@4.20.1 build
   → ✔ Building augur-theme… ✔ Building registry.  (exit 0)
   → public/r/augur-theme.json (registry-item form, $schema registry-item.json)

3. Serve statically (any static file server)
   cd public && python3 -m http.server 4173

4. Install into a fresh consumer (created once via
   bunx shadcn@4.20.1 init -t vite -b radix -p nova -n augur-consumer)
   bunx shadcn@4.20.1 add "http://127.0.0.1:4173/r/augur-theme.json" -y
   → ✔ Installing dependencies. ✔ Updating src/index.css.  (exit 0)

5. Verify the consumer build
   bun x vite build                                   → exit 0
   grep -c '@font-face'     dist/assets/*.css         → 11
   grep -o 'data-theme=dark' dist/assets/*.css | wc -l → present (dark blocks + variant)
   ls dist/assets | grep -c 'sora\|schibsted'          → 12 (self-hosted woff2)
   grep '@fontsource' package.json                     → exact pins 5.3.0
```

Observed delivery mechanics this transcript proves: exact-pinned npm
dependencies installed; `cssVars.theme` merged into `@theme inline`
(`--font-sans` switched from the init font to `var(--augur-font-primary)`);
`cssVars.light`/`dark` overwrote the scaffold values in `:root`/`.dark`;
`css` selectors (including the nested `@media` fallback, `body`,
`:focus-visible`, reduced-motion) appended; `@import` lines hoisted above
all rules; `@custom-variant dark` redefinition honored by the Tailwind
build.

For GitHub-native verification (`add jubalm/augur-design-system/<item>#<ref>`
against this repository), the same steps apply once the root `registry.json`
exists (#17); the upstream CLI resolves refs via `git ls-remote` and reads
public repos anonymously.

**Gate:** a ref may be published for consumer pinning only after steps 1–5
pass on that exact tree.

---

## 13. Contract fixture and schema validation

Fixture: [`../fixtures/registry/registry.fixture.json`](../fixtures/registry/registry.fixture.json)
— one `augur-theme` item, inline payload (the exact object installed in
§12), plus its built-item form
[`registry-item.fixture.json`](../fixtures/registry/registry-item.fixture.json)
(byte-for-byte the `shadcn build` output). Schemas are vendored verbatim
(§1). Validation (ajv pinned `8.20.0`; setup and recorded output in the
fixture README):

```sh
bun packages/design-system/fixtures/registry/validate-registry-fixtures.mjs
# → 4/4 PASS (2 positives valid, 2 deliberate mutations invalid), exit 0
```

The deliberate mutations prove the validator fails closed: a missing
required `type`, and a `registry:font` item without the `allOf`-required
`font` metadata both fail.

Schema-level validation has known limits, so it is paired with CLI
validation (§12 step 1). Verified example: the upstream schema does not
require root `name`/`homepage` (they are optional for `include`d chunks),
but `bunx shadcn@4.20.1 registry validate` exits `1` with actionable
messages when they are missing.

### Schema facts this contract relies on (pinned item schema)

- Required: `name`, `type`. Item types enum: `registry:lib | block |
  component | ui | hook | theme | page | file | style | base | font | item`.
- `files` entries: `path`, `content`, `type`, `target` (`target` required
  for `registry:file`/`registry:page`); alias placeholders `@components/`,
  `@ui/`, `@lib/`, `@hooks/`.
- `registry:font` requires `font` metadata; every other type must not set
  it (`allOf` branches). Only `registry:base` may set `style`,
  `iconLibrary`, `baseColor`, `theme`.
- `cssVars`: `{ theme, light, dark }` maps of string→string. `css`: object
  of recursive `cssValue` (string | nested object), explicitly supporting
  at-rules and nested selectors.
- Registry (index) schema: `$schema`, `name`, `homepage` (required at root
  by the CLI, not the schema), `include` (explicit relative `registry.json`
  paths; flattened by `build`), `items`, `pagination`.

---

## 14. Version-pinned installation URLs

The repository is `jubalm/augur-design-system` (any future transfer is a
separate decision per `ARCHITECTURE.md`). Upstream GitHub registries accept
`owner/repo/item` with `#<branch>`, `#<tag>`, or `#<40-char-sha>`; the CLI
resolves branch/tag refs to a commit SHA via git, and uses full SHAs
directly without git.

Consumer-facing pinning policy:

1. **Reproducible installs pin the full 40-character commit SHA:**

   ```sh
   bunx shadcn@4.20.1 add "jubalm/augur-design-system/augur-theme#<full-sha>"
   ```

2. **Release tags name the human-friendly pins.** #17 introduces the tag
   scheme for registry snapshots (aligned with the repository versioning in
   `ARCHITECTURE.md` §19); a tag must pass the §12 gate before it is
   documented as installable.
3. **`main` is the development channel.** Unpinned installs
   (`jubalm/augur-design-system/augur-theme`) resolve to the default branch
   and are never documented as stable.
4. **Built-JSON channel** (post-#19): `https://<docs-host>/r/<item>.json`
   served from GitHub Pages, refreshed by the release flow; namespace
   config in §10. Tag-scoped raw URLs
   (`https://raw.githubusercontent.com/jubalm/augur-design-system/<ref>/…`)
   remain available for tools that want URL-shaped access to committed
   artifacts, if #17 commits them.
5. All documented consumer commands pin the CLI (`bunx shadcn@4.20.1`), not
   `@latest`.

---

## 15. Out of scope

- npm publication of `@augur/design-system`, or any bundled package output
  (deferred by architecture; tsup decision recorded in the root README).
- The registry implementation itself, item generation, CI wiring, tag
  scheme, and GitHub Pages serving — issue #17 (generation/validation),
  #19 (deployment), #6-owned CI extends as needed.
- Framework support beyond the verified Vite + React + Tailwind v4 path
  (§10), MCP server / `open in v0` integrations, private-registry
  authentication, and consumer framework documentation (#7).
- Component item definitions (components land with #12–#14 first).

## 16. Decision log (this issue)

| # | Decision | Source of necessity |
| --- | --- | --- |
| D1 | CLI pinned `shadcn@4.20.1`, invoked `bunx shadcn@4.20.1` in all documented commands | npm current version 2026-09-04; repository exact-pin policy |
| D2 | Root `registry.json` at repository root | Upstream GitHub registry requirement |
| D3 | `registryDependencies` use full GitHub item addresses, never bare names | Upstream same-repo dependency rule; bare names would resolve against the default shadcn registry |
| D4 | `registry:font` rejected; fonts via exact-pinned `@fontsource` dependencies + hoisted `@import` CSS | Schema (`provider: ["google"]`, `next/font/google` coupling) vs PROVENANCE.md self-hosting + framework neutrality |
| D5 | Theme via `cssVars` (light/dark/theme) + `css` selectors delivering Augur's `data-theme` model, `.dark` co-delivery, system fallback, `@custom-variant` override | Empirical §12 run; #4 `theme.css` selector model |
| D6 | No `--radius`/`--chart-*`/`--sidebar-*` delivery | semantic-themes.md D6; FD-03 Proposed, not adopted |
| D7 | Component items unprefixed kebab-case; `augur-` prefix reserved for foundational items | Upstream naming conventions; namespace/address provenance |
| D8 | Fixture validation via ajv `8.20.0`, linked node_modules, verbatim vendored schemas registered by URL key | ajv v8 id-key mismatch + `$ref`-by-URL; repo fixture precedent (font fixture) |
| D9 | Consumers pin full commit SHAs (strongest), tags after #17 defines them; `main` never stable | Upstream ref resolution semantics |
