# Changelog

Consumer-facing changes to the Augur Design System are recorded here. The project is unreleased, so entries are grouped under **Unreleased**. Implementation detail and per-change evidence live in pull requests and commits.

## Unreleased

### Added

- **Workspace and package.** `@augur/design-system` with a public entry point and an aggregated `styles.css` export, in a lightweight Bun workspace with a committed, frozen-installable lockfile.
- **Design tokens.** Base tokens generated from `DESIGN.md` (CSS variables, DTCG JSON, and a Tailwind variable preview), with determinism checks and controlled generation failure paths.
- **Themes.** A semantic light/dark role mapping over the generated tokens, with `data-theme` opt-in/opt-out and a `prefers-color-scheme` fallback.
- **Fonts.** Self-hosted, OFL-licensed Sora and Schibsted Grotesk with documented provenance, machine-readable font exports, and browser verification.
- **Components.** `Button`, `Card`, `Input`, and `Dialog`, with shadcn-compatible, Augur-owned APIs and semantic-role styling.
- **Patterns.** `FormField`, `PageHeader`, and `EmptyState`, composed from the components.
- **Documentation site.** A plain Astro application that renders the real workspace package, with shared MDX content, live examples, a grouped navigation and reading shell, and section overview pages.
- **Clean Markdown and `llms.txt`.** A predictable `.md` representation for every substantive page, `Copy page` and `View as Markdown` actions, and a navigational `llms.txt`.
- **Distribution.** A shadcn-compatible registry contract, generated registry artifacts, and a reproducible independent-consumer install smoke fixture.
- **Verification.** Deterministic CI covering design lint, code lint, typecheck, token drift and controlled failures, workspace smoke, and the unit/accessibility suite, plus docs build and Markdown/browser verification.
- **Deployment preparation.** A manual GitHub Pages workflow and static-artifact verification for the docs and registry channel. Deployment is prepared but not activated.

### Changed

- Encoded the adopted visual foundations in `DESIGN.md`: the six-step component spacing scale, 0px control and surface radius, and the three editorial typography roles.
- Consolidated the documentation page actions into a single Copy page split control.
- Made document tables readable at every viewport.
- Replaced the flat docs header with a scalable navigation and reading shell derived from one collection-backed model.

### Fixed

- Restored installed-registry typography and spacing and explicit light scopes.
- Repaired responsive typography and reference-record fidelity.
- Applied the adopted touch targets, control-edge contrast, square geometry, and immediate neutral state feedback.
