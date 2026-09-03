# Docs fixtures (issues #7 and #8)

Two verification drivers for the Astro docs app, following the fixture
pattern established by issue #5 (`packages/design-system/fixtures/`).

## Browser verification (`verify-docs.mjs`)

Stages the **built** `apps/docs` output under the configured base path
and drives it in headless Chromium.

### What it proves

- Every page loads with no console errors/warnings, no failed responses,
  and no third-party requests (fonts are fully self-hosted).
- Real font loading: `document.fonts.check()` for Sora 400/600 and
  Schibsted Grotesk 400; computed font-family on `body` (secondary voice)
  and `h1` (primary voice).
- The theme contract: default follows the system preference (no
  `data-theme` attribute), the header toggle pins light/dark on `<html>`,
  the choice persists across reload, and System removes the attribute
  again — driven entirely through the keyboard.
- Keyboard navigation: the skip link receives the first Tab stop and
  header controls are operable with Enter.
- Mobile layout at 375×812: the nav collapses into a native
  `<details>` disclosure, opens via keyboard, links navigate, and the
  page has no horizontal overflow.
- Content: MDX-evaluated package data, the code-synchronized live
  examples (`DocExample` blocks), and the scoped `[data-theme]`
  demonstration render as built.

### Run

Playwright is deliberately not a workspace dependency (browser CI wiring
lands with issue #15). Provide it once via a gitignored link
(playwright 1.61.x pins the Chromium build used):

```sh
mkdir -p /tmp/augur-docs-verify && cd /tmp/augur-docs-verify
bun init -y >/dev/null && bun add playwright@1.61.1
ln -s /tmp/augur-docs-verify/node_modules \
      <repo>/apps/docs/fixtures/node_modules
cd <repo>
bun run --cwd apps/docs build
bun apps/docs/fixtures/verify-docs.mjs
```

For the repository-subpath build, rebuild with the base override and run
the same driver — it stages `dist` under the base automatically:

```sh
DOCS_BASE_PATH=/augur-design-system bun run --cwd apps/docs build
DOCS_BASE_PATH=/augur-design-system bun apps/docs/fixtures/verify-docs.mjs
```

Exit code 0 and a `docs shell verification passed` line mean every
assertion passed. Screenshots are written to `/tmp/augur-docs-verify/`
as visual evidence and are not committed.

## Controlled content-failure verification (issue #8)

`verify-content-failures.mjs` proves the acceptance requirement that
invalid required metadata fails the build **clearly**, plus the
component-page section contract:

1. A foundations entry without the required `title`
   (`content/invalid/broken-metadata.md`) is staged into
   `src/content/foundations/`; the build must fail with
   `InvalidContentEntryDataError` naming the entry and the missing
   field.
2. A component page with valid metadata but a body missing the required
   sections (`content/invalid/missing-sections.mdx`) is staged into
   `src/content/components/`; the build must fail naming the entry and
   the missing headings.

Both fixtures are removed again in all cases. Run from the repository
root:

```sh
bun apps/docs/fixtures/verify-content-failures.mjs
```

Exit code 0 and a `content failure verification passed` line mean both
invalid fixtures failed the build exactly as required. This is the
docs-side analogue of `tokens:verify-failures` (#3) and the registry
invalid fixtures (#16); wiring it into CI is #15's scope.
