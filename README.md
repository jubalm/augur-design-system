# Augur Design System

A shared interface language for Augur: maintained design guidance, generated tokens, reusable React components, and documentation for humans and agents.

This repository is in **early development**. The architecture, the initial design specification, and the Bun workspace exist; the component library, registry, and documentation site are still planned work. There is no published package or live documentation deployment yet.

## Start here

- [Architecture](ARCHITECTURE.md): what to build and the boundaries to preserve.
- [Design specification](DESIGN.md): maintained design values and rationale in Google DESIGN.md format.
- [Agent and contributor instructions](AGENTS.md): how to select, implement, verify, and hand off work.
- [Delivery roadmap](ROADMAP.md): milestone outcomes and issue entry points.
- [GitHub Project](https://github.com/users/jubalm/projects/6): current priority, readiness, and execution status.
- [Issues](https://github.com/jubalm/augur-design-system/issues): scope, dependencies, decisions, and acceptance evidence.
- [Brand foundation reference](resources/brand/augur-brand-foundation.pdf): upstream source material, not a runtime implementation.

## Technical direction

One lightweight Bun workspace will contain `packages/design-system` (`@augur/design-system`) and `apps/docs` (plain Astro with React and Markdown/MDX). Components follow shadcn conventions where appropriate. Values supported by the pinned `@google/design.md` schema come from `DESIGN.md`; generated tokens feed a thin semantic light/dark mapping layer.

The initial external distribution path is a GitHub-hosted shadcn-compatible source registry. npm publication and a bundled package are not required. The docs will provide rendered pages, clean Markdown equivalents, and `llms.txt`, with static GitHub Pages delivery.

## Development

Requires [Bun](https://bun.com) **1.4.0**, pinned through `packageManager` in the root `package.json`. The workspace contains the `@augur/design-system` package under `packages/design-system` and the docs app manifest under `apps/docs` (the Astro app itself is [#7](https://github.com/jubalm/augur-design-system/issues/7)), which consumes the package via `workspace:*`.

Verified commands:

| Command | What it does |
| --- | --- |
| `bun install` | Installs the workspace from the committed `bun.lock`. |
| `bun install --frozen-lockfile` | Frozen install; fails if `package.json` and the lockfile disagree. This is the install CI uses. Verified from a wiped `node_modules`. |
| `bun run lint` | Validates `DESIGN.md` against the schema of the exactly pinned `@google/design.md` **0.4.0**. Covers the design specification; code is linted by `lint:code`. |
| `bun run lint:code` | Lints TypeScript/TSX with [oxlint](https://oxc.rs) (typescript, react, and jsx-a11y rule families). oxlint is used because the pinned TypeScript 7.0.2 is not yet supported by typescript-eslint (upstream issue #10940). |
| `bun run typecheck` | Type-checks the `packages/design-system` sources, workspace tooling, and the `tests/` harness with `tsc --noEmit` (TypeScript 7.0.2). |
| `bun run check:workspace` | Smoke-checks the workspace boundaries: loads `@augur/design-system`, resolves its documented `./styles.css` export, and verifies `apps/docs` can resolve the package through its `workspace:*` dependency. |
| `bun run test` | Runs the Vitest + Testing Library + axe suite in jsdom under `tests/`, against the real workspace package. See [Continuous integration](#continuous-integration). |
| `bun run --cwd packages/design-system tokens:check` | Regenerates the base tokens (#3) in memory and byte-compares them with the committed artifacts; nonzero exit on drift. |
| `bun run --cwd packages/design-system tokens:verify-failures` | Proves the controlled token-generation failure paths (invalid references, missing source, malformed YAML) exit nonzero and write no artifacts. |

There is deliberately no `build` command yet: tsup stays deferred until actual package output is required (#1 decision). Browser-level checks (Playwright) land with [#15](https://github.com/jubalm/augur-design-system/issues/15); until then, browser behavior is verified with the manual font fixture (#5). Commands are documented here only once they do real work.

Use an issue branch and a pull request for implementation. Read the issue's prerequisites before beginning; milestone order alone does not determine readiness. Start from the [delivery roadmap](ROADMAP.md) and the [GitHub Project](https://github.com/users/jubalm/projects/6) to find ready work.

### Tool versions and upgrades

- **Bun** is pinned to an exact version via the `packageManager` field, and `engines.bun` records the supported minor window. Bun itself does not enforce either field at install time; CI pins the same version through the workflow-level `BUN_VERSION` environment variable (kept in sync with `packageManager` by review).
- **`@google/design.md`** is pinned to an exact version per the architecture. Upgrading it is an intentional migration: update the pin and the lockfile in one reviewed change and re-verify `bun run lint` and the token checks against `DESIGN.md`.
- Other dependency ranges are unlocked, but the committed `bun.lock` makes every install reproducible. Lockfile changes happen only through deliberate dependency changes, and `bun install --frozen-lockfile` is the frozen-install path used by CI.
- **tsup is deferred.** No bundled package artifact is needed while consumption is source-based (workspace use and the future shadcn-compatible registry path). Revisit only when actual package output is required.
- **oxlint is pinned loosely** (`^1.x` range) but every CI run installs from the committed `bun.lock`, so the effective version is frozen. Upgrades are ordinary reviewed dependency changes.
- **TypeScript 7.0.2 is exact**; typescript-eslint does not support TS 7 yet (upstream issue #10940), which is why the code linter is oxlint. Revisit when typescript-eslint ships TS 7 support.

### Styling compatibility choice (initial)

Recorded from current upstream [shadcn](https://ui.shadcn.com) guidance, so components stay compatible with shadcn conventions. Subject to reconciliation with the foundation decisions in [#2](https://github.com/jubalm/augur-design-system/issues/2):

- Components theme through **semantic CSS custom properties** (`--background`, `--foreground`, `--primary`, …). Upstream uses and recommends CSS variables for theming (`tailwind.cssVariables: true`) and generates exactly this shape by default.
- **Tailwind CSS v4** is the current shadcn default utility layer, configured CSS-first through `@theme` rather than `tailwind.config.js`.
- Token CSS is generated from `DESIGN.md`, never hand-duplicated. `design.md export css-tailwind` of the pinned CLI already targets Tailwind v4 `@theme` output, to be exercised by [#3](https://github.com/jubalm/augur-design-system/issues/3).
- Until the foundation work (#3–#5) produces real token CSS, no styling dependency is committed. Docs-only dependencies stay out of `packages/design-system` and live under `apps/docs`.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`, with `contents: read` permissions and cancellation of superseded runs on the same ref. Every job installs from the committed `bun.lock` with `--frozen-lockfile`.

Stable check names (GitHub check runs; candidates for required status checks when branch protection is enabled — see the PR that established CI for the recorded recommendation):

| Check name | What it proves |
| --- | --- |
| `design-lint` | `DESIGN.md` is valid under the pinned `@google/design.md` schema. |
| `code-lint` | TypeScript/TSX passes oxlint (typescript, react incl. `rules-of-hooks`, jsx-a11y correctness rules). |
| `typecheck` | `tsc --noEmit` passes for package sources, workspace tooling, and the test harness. |
| `tokens` | Committed token artifacts match a clean regeneration (`tokens:check`), and the controlled generation failure paths exit nonzero (`tokens:verify-failures`, #3). |
| `workspace-smoke` | The workspace links load: package entry, `./styles.css` export, `apps/docs` resolution. |
| `unit-tests` | The Vitest + Testing Library + axe suite passes against the real workspace package. |

Deliberately **not** in CI yet, so the workflow stays honest about absent checks: browser coverage (Playwright, #15), a package build (deferred, no build command exists), and AI design review (advisory only, never a blocking gate).

## Ownership and release status

The initial repository is [jubalm/augur-design-system](https://github.com/jubalm/augur-design-system). It is separate from the earlier OpenDesign repository, `jubalm/augur-design-system-od`. A future organization transfer is a separate decision.

Code licensing, asset redistribution, and the documentation domain are tracked in [#20](https://github.com/jubalm/augur-design-system/issues/20). No license grant is implied by repository visibility. No custom domain or release has been configured.
