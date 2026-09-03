# Augur Design System

A shared interface language for Augur: maintained design guidance, generated tokens, reusable React components, and documentation for humans and agents.

This repository is at the **project foundation and planning stage**. The architecture and initial design specification exist; the workspace, component library, registry, and documentation site are planned work. There is no published package or live documentation deployment yet.

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

Start with [#1: Bootstrap the Bun workspace](https://github.com/jubalm/augur-design-system/issues/1). Installation and validation commands will be documented here when implemented and verified. No build or test scripts exist at this planning stage.

Use an issue branch and a pull request for implementation. Read the issue's prerequisites before beginning; milestone order alone does not determine readiness.

## Ownership and release status

The initial repository is [jubalm/augur-design-system](https://github.com/jubalm/augur-design-system). It is separate from the earlier OpenDesign repository, `jubalm/augur-design-system-od`. A future organization transfer is a separate decision.

Code licensing, asset redistribution, and the documentation domain are tracked in [#20](https://github.com/jubalm/augur-design-system/issues/20). No license grant is implied by repository visibility. No custom domain or release has been configured.
