# Docs shell browser verification fixture (issue #7)

A rendered-surface verification driver for the Astro docs shell, following
the fixture pattern established by issue #5
(`packages/design-system/fixtures/`). It stages the **built** `apps/docs`
output under the configured base path and drives it in headless Chromium.

## What it proves

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
- Content: MDX-evaluated package data and the scoped `[data-theme]`
  demonstration render as built.

## Run

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
