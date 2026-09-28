# Changelog

Consumer-facing changes to the Augur Design System are recorded here, one section per release. Changes merged since the latest release collect under **Unreleased** until the next release is cut. Implementation detail and per-change evidence live in pull requests and commits.

Releases are immutable Git tags (`vX.Y.Z`) that describe the whole consumer-facing surface: theme and tokens, components, patterns, registry artifacts, and approved brand assets. Individual registry items are not versioned separately. Before 1.0, a patch release carries compatible fixes and refinements, and a minor release carries meaningful consumer-facing additions or breaking contract changes. `1.0.0` will mark the component API, registry distribution path, tokens and foundations, and release process as stable. The procedure is in [RELEASING.md](RELEASING.md).

## Unreleased

## [0.1.0] - 2026-09-28

The first versioned release. Consumers adopt it by tag: `jubalm/augur-design-system/<item>#v0.1.0`, or the built item at `https://raw.githubusercontent.com/jubalm/augur-design-system/v0.1.0/public/r/<item>.json`.

### Added

- **Versioned releases.** A documented release procedure, a release verification script (`bun run check:release`), and a manual release workflow that creates the immutable tag and GitHub Release. Registry items at a release tag address their `registryDependencies` to that same tag (`#v0.1.0`), so transitive installs cannot drift to `main`. CI now fails when the committed registry artifacts differ from their sources, when the registry fails shadcn schema validation, or when the independent-consumer install smoke fails.

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

- `Button` accepts `asChild` (shadcn's Slot pattern) to style a single child element, typically a link, without rendering a `<button>`. The registry `button` item now depends on `radix-ui`. Its installed `button-variants.ts` imports `button.css`, so class-only consumers of `buttonVariants()` get the styles. The Button margin reset now has zero specificity, so consumer layout margins win regardless of stylesheet order.
- Approved favicon and app icon: the token icon published at augur.net (SVG, 32px PNG, 180px touch icon) ships byte-identical under `resources/brand/assets/icon/` with a verified manifest, as the one documented exception to the REP token usage rule. The docs site uses it instead of the scaled-down glyph PNG.
- Dark `--accent` (the neutral hover/highlight surface) is now Surface 3 instead of Surface 2. It previously equalled `--popover`, so outline/ghost hovers and the Dialog close button showed no hover inside floating layers in dark.
- The `augur-theme` registry item now delivers semantic role values in its `css` payload (`:root` and `.dark`) instead of `cssVars.light`/`dark`. Installs no longer write invalid `--role: var(----role)` entries into the consumer's `@theme inline` block. Role values, `.dark` co-delivery and `data-theme` behavior are unchanged.
- Separated control edges from panel edges: light `--input` is now Mist (still at least 3:1 on Paper and White) and dark `--border` is now Surface 3, so Card and Dialog bounds stay distinct from Input and outline Button edges in both themes. Input and the outline Button gain a stronger `--input-hover` edge on hover.
- Filled Button variants now hover to a neighboring palette color in their own family (`--primary-hover`, `--primary-hover-foreground`, `--secondary-hover`, `--destructive-hover`) instead of the neutral `--accent`, so a hovered primary no longer reads as disabled. `outline` and `ghost` keep the neutral hover.
- Encoded the adopted visual foundations in `DESIGN.md`: the six-step component spacing scale, 0px control and surface radius, and the three editorial typography roles.
- Consolidated the documentation page actions into a single Copy page split control.
- Made document tables readable at every viewport.
- Replaced the flat docs header with a scalable navigation and reading shell derived from one collection-backed model.
- Reworked the docs presentation to follow its own guidance: a product-first home page (message, one primary action, and a live query record), entry points with live previews, a two-lane reading shell that shares one left edge, tonal example stages, quiet example rules, and section spacing on the layout steps.
- Made the copyable example source consumer code: each sample shows one theme with no docs-site class names or wrappers, and the example frame renders it in labeled light and dark scopes. The Dialog sample now shows the full composition, not only its trigger.
- Replaced the docs masthead's three-button theme control with a single sun/moon toggle. With no saved choice the site follows `prefers-color-scheme`, including live system changes; pressing the toggle pins and persists the other theme as an explicit light/dark override. The toggle now matches the GitHub link beside it: an 18px solid glyph in the same color and hit area.
- Adopted the augur.net mobile menu treatment in the docs masthead: below 960px the navigation opens as a full-height sheet under the header with a Menu/Close control, a scroll lock, Escape and outside dismissal, and rule-led 48px rows. The theme toggle joins the sheet with its name spelled out beside the icon, and the masthead row keeps only the brand and the menu control; repository access stays in the footer, which every page renders.
- Put the On-this-page rows on the spacing scale's 24px rhythm: each row carries the sidebar links' 4px block padding instead of sitting on a bare 4px gap, on both the desktop rail and the collapsed ToC beneath the page opening.

### Fixed

- Fenced code blocks in docs pages follow the host light/dark theme on the semantic muted surface instead of always rendering in Shiki's default dark theme.
- `PageHeader` keeps a back affordance or other first-row child at its intrinsic width from the start edge instead of stretching it across the header; the breadcrumb and content rows still span the full width.
- The docs masthead lockup returns to the 150px horizontal-lockup minimum, and the descriptor, masthead edge, and neighboring controls stay outside the 1a clearspace.
- Docs views now carry one green signal: proposal review and the home page quiet the record's rule when the primary action is green, and project status appears once, in the footer.
- Restored installed-registry typography and spacing and explicit light scopes.
- Repaired responsive typography and reference-record fidelity.
- Applied the adopted touch targets, control-edge contrast, square geometry, and immediate neutral state feedback.
