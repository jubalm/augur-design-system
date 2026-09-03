# Agent and contributor instructions

## Orient before changing files

1. Read `README.md`, `ARCHITECTURE.md`, `DESIGN.md`, and the selected GitHub issue.
2. Inspect current files, Git status, related issues/PRs, and existing checks. Planned paths and commands are not evidence of implemented behavior.
3. Check every native blocking issue and the issue's dependency section. Choose an unblocked, bounded slice; do not absorb prerequisites or adjacent issues silently.

GitHub issues/PRs own execution details and evidence. The [Project](https://github.com/users/jubalm/projects/6) owns priority, readiness, and live status. `ROADMAP.md` is a navigation map, not a duplicate live task tracker.

## Source authority

- `ARCHITECTURE.md` governs structure, tooling direction, distribution, and boundaries.
- `DESIGN.md` is canonical for adopted values representable by its pinned schema. Generated outputs are derived artifacts, never independent editable sources.
- Current component code and maintained documentation govern concepts outside that schema.
- `resources/brand/augur-brand-foundation.pdf` informs the system; it does not silently override current maintained decisions.
- The current DESIGN.md has unresolved spacing/radius and product-ownership language. Resolve this through issue #2 before establishing shared scales. Do not import old OpenDesign artifacts or memory as current authority.

## Boundaries

- Keep one Bun workspace package under `packages/design-system` and plain Astro docs under `apps/docs`.
- Dependencies flow from foundations/tokens to primitives, components, patterns, and products. The package must not import the docs app.
- Keep React component APIs close to shadcn conventions; Augur owns resulting APIs, styles, and documentation.
- Prefer semantic tokens. Do not duplicate raw DESIGN.md values in theme maps, docs examples, or registry copies.
- Keep product workflows outside this repository. npm publication, Storybook, orchestration frameworks, and package extraction need concrete requirements.
- Every substantive docs page must have a clean Markdown equivalent from shared content. Docs examples use the real workspace package.
- Preserve supplied artwork. Missing production masters are a documented dependency, not permission to redraw the brand.

## Claim and execute an issue

- Record the intended scope and branch in the issue before editing. Check for an existing active owner/PR.
- Use `issue-<number>-<short-description>` branches. Coordinate shared configuration; use isolated worktrees when contributors work concurrently. Preserve unrelated changes.
- Set Project Status to In Progress only while work is active. Readiness is Ready, Blocked, or Decision needed; reevaluate it from current prerequisites, not stale field values.
- Implement the issue's acceptance criteria and exclusions. Record any material design decision with rationale and source; seek maintainer direction where the issue requires a choice.
- Future execution must be explicitly requested. An issue marked Ready does not authorize an agent to autonomously implement the entire backlog.

## Verify and review

Run relevant repository checks once they exist: frozen install, types, lint, pinned design lint/export, deterministic generation, builds, Vitest/Testing Library/axe, and Playwright where browser behavior matters. Deterministic CI (`.github/workflows/ci.yml`) currently runs: frozen install, `designmd` design lint, oxlint code lint, typecheck, token drift + controlled-failure checks (`tokens:check`, `tokens:verify-failures`), the workspace smoke check, and the unit/accessibility suite. Browser coverage lands with #15. Never claim missing commands passed.

For visual changes, inspect real rendered examples in both themes and relevant viewport sizes. Verify font loading with computed styles, `document.fonts.check()`, and console/network evidence. Check keyboard/focus behavior and actual contrast pairings; automated accessibility is not a substitute for interaction review.

Review the diff against DESIGN.md, affected docs, existing components, semantic token consistency, shadcn/API conventions, accessibility intent, and product boundaries. Deterministic CI is the blocking validation layer once implemented; AI design review starts as advisory.

## Hand off and finish

Open a PR linked with `Closes #<number>`. Include outcome, changed surfaces, commands and observed results, screenshots when useful, and remaining limitations. Update docs and changelog when public behavior changes.

Before stopping, leave a concise handoff in the issue or PR:

- Branch/commit and PR link.
- Completed acceptance criteria and verification evidence.
- Remaining work and exact next action.
- Blockers or decisions needed.

Do not mark work Done or close issues without acceptance evidence. A prepared PR is not a merged change. Leave merge, release publication, public deployment, DNS changes, licensing decisions, and repository transfer to explicit maintainer direction. When a prerequisite completes, reassess its dependents and update readiness; project fields are not automatically maintained by this bootstrap.
