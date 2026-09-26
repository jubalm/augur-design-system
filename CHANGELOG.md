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
- Reworked the docs presentation to follow its own guidance: a product-first home page (message, one primary action, and a live query record), entry points with live previews, a two-lane reading shell that shares one left edge, tonal example stages, quiet example rules, and section spacing on the layout steps.
- Made the copyable example source consumer code: each sample shows one theme with no docs-site class names or wrappers, and the example frame renders it in labeled light and dark scopes. The Dialog sample now shows the full composition, not only its trigger.

### Fixed

- Fenced code blocks in docs pages follow the host light/dark theme on the semantic muted surface instead of always rendering in Shiki's default dark theme.
- `PageHeader` keeps a back affordance or other first-row child at its intrinsic width from the start edge instead of stretching it across the header; the breadcrumb and content rows still span the full width.
- The docs masthead lockup returns to the 150px horizontal-lockup minimum, and the descriptor, masthead edge, and neighboring controls stay outside the 1a clearspace.
- Docs views now carry one green signal: proposal review and the home page quiet the record's rule when the primary action is green, and project status appears once, in the footer.
- Restored installed-registry typography and spacing and explicit light scopes.
- Repaired responsive typography and reference-record fidelity.
- Applied the adopted touch targets, control-edge contrast, square geometry, and immediate neutral state feedback.
