# Augur Design System

A shared interface language for Augur: maintained design guidance, generated tokens, reusable React components, and documentation for humans and agents.

## Start here

- [Architecture](ARCHITECTURE.md): repository structure, boundaries, distribution, and tooling.
- [Design specification](DESIGN.md): maintained design values and rationale in Google DESIGN.md format.
- [Agent and contributor instructions](AGENTS.md): how to select, implement, verify, and hand off work.
- [Changelog](CHANGELOG.md): consumer-facing change history.
- [Docs application](apps/docs/README.md): the documentation site, its fixtures, and its deployment.
- [GitHub Project](https://github.com/users/jubalm/projects/6): current priority, readiness, and execution status.
- [Issues](https://github.com/jubalm/augur-design-system/issues): scope, dependencies, decisions, and acceptance evidence.
- [Brand foundation reference](resources/brand/augur-brand-foundation.pdf): upstream source material, not a runtime implementation.

## What this repository contains

One lightweight Bun workspace contains `packages/design-system` (`@augur/design-system`) and `apps/docs` (plain Astro with React and Markdown/MDX). Components follow shadcn conventions where appropriate. Values representable by the pinned `@google/design.md` schema come from `DESIGN.md`; generated tokens feed a thin semantic light/dark mapping layer.

The external distribution path is a GitHub-hosted shadcn-compatible source registry. The docs provide rendered pages, clean Markdown equivalents, and `llms.txt`, deployed as a static site. Architectural detail and decisions live in [ARCHITECTURE.md](ARCHITECTURE.md).

## Development

Requires [Bun](https://bun.com) **1.4.0**, pinned through `packageManager`. The workspace consumes `@augur/design-system` through `workspace:*`.

| Command | What it does |
| --- | --- |
| `bun install` | Installs the workspace from the committed `bun.lock`. |
| `bun install --frozen-lockfile` | Frozen install; fails if `package.json` and the lockfile disagree. This is the install CI uses. |
| `bun run lint` | Validates `DESIGN.md` against the schema of the exactly pinned `@google/design.md`. |
| `bun run lint:code` | Lints TypeScript/TSX with [oxlint](https://oxc.rs). |
| `bun run typecheck` | Type-checks package sources, workspace tooling, and the test harness. |
| `bun run check:workspace` | Smoke-checks workspace boundaries and the documented package exports. |
| `bun run test` | Runs the Vitest + Testing Library + axe suite against the real workspace package. |
| `bun run --cwd packages/design-system tokens:check` | Regenerates the base tokens in memory and fails on drift. |
| `bun run --cwd packages/design-system tokens:verify-failures` | Proves the controlled token-generation failure paths exit nonzero and write no artifacts. |

There is deliberately no `build` command yet: a bundled package stays deferred until actual package output is required. Browser and docs checks run through `apps/docs/fixtures` after `bun run --cwd apps/docs build`; see [apps/docs/README.md](apps/docs/README.md).

Use an issue branch and a pull request for implementation. Read the issue's prerequisites before beginning; milestone order alone does not determine readiness. Find ready work through the [GitHub Project](https://github.com/users/jubalm/projects/6) and repository issues.

## Status and ownership

The initial repository is [jubalm/augur-design-system](https://github.com/jubalm/augur-design-system), separate from the earlier OpenDesign repository `jubalm/augur-design-system-od`. A future organization transfer is a separate decision. Code licensing, asset redistribution, and the documentation domain are tracked in the Project and issues; no license grant is implied by repository visibility.
