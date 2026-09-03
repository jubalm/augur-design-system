# `@augur/docs` — the Augur design system documentation app

Plain Astro with React rendering and MDX/Markdown content — deliberately
no Starlight or other docs framework layer (see
[ARCHITECTURE.md](../../ARCHITECTURE.md), "Documentation Website").
Established by issue #7; content schema and example conventions are
issue #8, Markdown URL parity and `llms.txt` are issue #9, browser CI is
issue #15.

The app consumes the real workspace package
(`@augur/design-system` via `workspace:*`): the stylesheet entry
`@augur/design-system/styles.css` is the only color/font style source
(shell chrome in `src/styles/docs.css` uses semantic role custom
properties exclusively), and pages/components import the package entry
constants (`AUGUR_FONTS`, `AUGUR_FONT_FAMILIES`). Docs-only dependencies
live only in this package; the design-system package does not import
docs code.

## Commands

Run from the repository root:

| Command | What it does |
| --- | --- |
| `bun run --cwd apps/docs dev` | Astro dev server. |
| `bun run --cwd apps/docs build` | Static production build into `apps/docs/dist`. |
| `bun run --cwd apps/docs check` | `astro check` diagnostics (0 errors required). |
| `bun run --cwd apps/docs typecheck` | `tsc --noEmit` over the app's TS/TSX. |
| `bun apps/docs/fixtures/verify-docs.mjs` | Browser verification of the built site (see `fixtures/README.md`). |

## Deployment base (repository subpath and custom-domain root)

The base is environment-driven in `astro.config.mjs`; no source changes
are needed to switch between the two supported deployment shapes:

- **Custom-domain root** (future default per ARCHITECTURE.md):
  build with no overrides — `base` defaults to `"/"`.
  ```sh
  bun run --cwd apps/docs build
  ```
- **Repository subpath** (e.g. a GitHub Pages project site):
  ```sh
  DOCS_BASE_PATH=/augur-design-system bun run --cwd apps/docs build
  ```

All internal links and public-asset references go through
`src/lib/base.ts#withBase()`, so both builds are correct by construction.
The browser fixture stages `dist` under the base and verifies each mode.

## TypeScript pin

The repository root pins TypeScript 7.0.2 (the native compiler), which
does not yet expose the programmatic API `astro check` requires
(Upstream: [withastro/roadmap#1321](https://github.com/withastro/roadmap/discussions/1321)).
This app therefore carries its own exact `typescript@6.0.3` dependency —
the version the Astro language server supports — used by `check` and
`typecheck` here only. Like the root's oxlint choice, this is a
deliberate, documented compatibility pin; revisit when the upstream
gap closes.
