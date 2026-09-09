# Brand asset provenance and font delivery record

This file records where every brand-related asset in this repository came from,
what it may be used for, and which production assets are still missing. It also
documents the font delivery provenance for `@augur/design-system`.

## 1. Authority: upstream reference vs maintained runtime tokens

The authority order for anything brand-related in this repository is:

```text
DESIGN.md (maintained specification, pinned schema)
   ↓
generated tokens / runtime styles (packages/design-system)   ← implementation
   ↓
components, docs, registry
```

`resources/brand/augur-brand-foundation.pdf` is **upstream reference
material**. It informs the system; it is never a runtime source and never
silently overrides `DESIGN.md`, generated output, or component code. This
matches `ARCHITECTURE.md` ("Key Repository Documents → resources/") and the
PDF's own decision hierarchy ("Product tokens and component libraries remain
the implementation source of truth", PDF §01.1).

## 2. Supplied asset inventory

| Asset | Present | Origin | Size | SHA-256 |
| --- | --- | --- | --- | --- |
| `resources/brand/augur-brand-foundation.pdf` | Yes | Supplied artwork; "Augur Brand Foundation" v1.0, revised 31 August 2026, marked *Internal reference* (PDF cover) | 392,759 bytes | `65acce8b247ddda10834d0c068e84bc315f7afc118f5570d1d90386de8ed9c0c` |

That is the **only** brand asset supplied to this repository. The PDF documents
an identity system (logo system with horizontal lockup, vertical lockup, glyph,
token icon; clearspace and minimum-size rules; color variants; typography on
page 04.1) but is a reference document, not a source of production files.

### Usage constraints for the PDF

- Reference and documentation only. Nothing renders it at runtime.
- Preserve the artwork as supplied. Do not edit, filter, or regenerate it.
- Do **not** extract, trace, sample, or redraw any mark from it (see §3).
- `DESIGN.md` front matter was verified against the PDF; typographic facts cited
  in this repository (e.g. "Sora as primary voice, Schibsted Grotesk as
  secondary", PDF page 04.1) come from that audit.

## 3. Missing production masters

The PDF names where masters live — "Logo, glyph, and token icon masters are at
`augur-ecosystem/brand-assets`. Always start from a supplied file. Nothing in
this guide licenses redrawing a mark, and a mark rebuilt by eye will not match
the one already in production." (PDF §01.1, "Where the artwork lives").

**None of those master files have been received in this repository.** The
following are explicitly missing and must not be recreated from the PDF screens
or by eye:

| Missing master | Referenced by | Needed for |
| --- | --- | --- |
| Logo horizontal lockup master (vector) | PDF §02 "Horizontal lockup" | Product headers, docs site |
| Logo vertical lockup master (vector) | PDF §02 "Vertical lockup" | Cover/landing surfaces |
| Glyph mark master (vector) | PDF §02 "Glyph" | Favicons, avatars, compact UI |
| Token icon master | PDF §02 "Token icon" | Product token surfaces |
| Favicon/app icon export set | Derived from glyph/token icon | Web deployment |

### Interim rule: text identity

Until masters are supplied, all Augur identity in this repository and its
products is **text identity**: the word "Augur" (or a product name) set in the
system's own typography — Sora for display/headings, per the `DESIGN.md`
typography roles — with no drawn mark. Implementation surface: the typography
roles in `packages/design-system/src/styles/typography.css`. There is no logo
component, no logo image, and none may be derived from the PDF. The maintained
treatment specification — lockup roles, colors, clearspace, minimum sizes, and
delivery rules — lives at `apps/docs/src/content/foundations/identity.mdx`
(route `/foundations/identity`). When masters arrive, update this section and
record a real logo asset decision.

## 4. Font delivery provenance

Fonts are delivered as npm dependencies of `@augur/design-system` — legitimately
self-hostable, OFL-licensed Fontsource packages — never from Google Fonts CDNs
or other third-party hosts at runtime.

| Family (voice) | Package | Version | License | Copyright (must accompany redistribution) | Upstream |
| --- | --- | --- | --- | --- | --- |
| Sora (primary) | `@fontsource/sora` | `5.3.0` (exact pin) | OFL-1.1 | Copyright 2019 The Sora Project Authors (https://github.com/sora-xor/sora-font) | https://github.com/sora-xor/sora-font |
| Schibsted Grotesk (secondary) | `@fontsource/schibsted-grotesk` | `5.3.0` (exact pin) | OFL-1.1 | Copyright 2023 The Schibsted-Grotesk Project Authors (https://github.com/schibsted/schibsted-grotesk) | https://github.com/schibsted/schibsted-grotesk |

- Weights delivered: **Sora 400 + 600** (all DESIGN.md Sora roles), **Schibsted
  Grotesk 400** (body + metadata roles). No other weights are used by
  `DESIGN.md`; add them only with a DESIGN.md change.
- Delivery mechanism: `packages/design-system/src/styles/styles.css` imports
  `@fontsource/sora/400.css`, `600.css`, and
  `@fontsource/schibsted-grotesk/400.css`. These reference subset-split
  woff2/woff files with `unicode-range` and `font-display: swap`; browsers
  fetch only the subsets used. Delivered latin/latin-ext files:
  `sora-latin{,-ext}-{400,600}-normal.woff2` (14,724/15,000/7,340/7,536 bytes)
  and `schibsted-grotesk-latin{,-ext}-400-normal.woff2` (24,344/11,504 bytes).
- Fallback stacks and family custom properties:
  `packages/design-system/src/styles/fonts.css` (`--augur-font-primary`,
  `--augur-font-secondary`; system-ui fallbacks).
- Machine-readable provenance for consumers: `packages/design-system/src/fonts.ts`
  (`AUGUR_FONTS`, `AUGUR_FONT_FAMILIES`), exported from the package entry point.
- License redistribution copies (verbatim from the installed packages):
  `resources/brand/licenses/OFL-1.1-sora.txt`
  (SHA-256 `1ec9623d38c445eb4dfe5fcc783e0f0ee728cc97ca157ce1f8cb2b3bf9d9b0d9`),
  `resources/brand/licenses/OFL-1.1-schibsted-grotesk.txt`
  (SHA-256 `15222412a95d70042e66e79bfb3b985653e0693e4d41703bc131bee9c5aa1aa7`).
- Fontsource upstream: `github.com/fontsource/font-files` (the packages are
  build artifacts of the upstream font projects listed above).

### Font verification

`packages/design-system/fixtures/fonts.html`, driven by
`packages/design-system/fixtures/verify-fonts.mjs`, verifies the delivered faces
(registration, loading, computed styles, no third-party requests) in headless
Chromium. The driver also guards a real trap: `document.fonts.check()` returns
`true` even when zero faces exist, so it asserts faces are registered and loaded
and registers network listeners before navigation. Docs-app-level typography is
covered by the docs verification fixtures.

## 5. Maintenance rules

1. Bump a fontsource version → update the exact pin in
   `packages/design-system/package.json`, the constants in
   `packages/design-system/src/fonts.ts`, this table, and re-run the fixture
   driver.
2. Change a `DESIGN.md` typography role → update
   `packages/design-system/src/styles/typography.css` and regenerate the token
   artifacts.
3. Never add a font from an unverified source or a runtime CDN.
4. Never add logo/mark assets to this repository without a maintainer decision
   updating §3.
