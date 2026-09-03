# Brand asset provenance and font delivery record

> **Status: maintained record (issue #5).** This file records where every
> brand-related asset in this repository came from, what it may be used for,
> and which production assets are still missing. It also documents the font
> delivery provenance for `@augur/design-system`.

- Issue: [jubalm/augur-design-system#5](https://github.com/jubalm/augur-design-system/issues/5)
- Branch at time of record: `issue-5-font-assets-provenance`
- Sources inspected: `DESIGN.md`, `ARCHITECTURE.md`,
  `apps/docs/src/content/foundations/foundation-decisions.md`, and the
  supplied PDF itself (`pdftotext` extraction, no visual recreation)

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
matches both `ARCHITECTURE.md` ("Key Repository Documents → resources/")
and the PDF's own decision hierarchy ("Product tokens and component
libraries remain the implementation source of truth", PDF §01.1).

## 2. Supplied asset inventory

| Asset | Present | Origin | Size | SHA-256 |
| --- | --- | --- | --- | --- |
| `resources/brand/augur-brand-foundation.pdf` | Yes | Supplied artwork; "Augur Brand Foundation" v1.0, revised 31 August 2026, marked *Internal reference* (PDF cover) | 392,759 bytes | `65acce8b247ddda10834d0c068e84bc315f7afc118f5570d1d90386de8ed9c0c` |

That is the **only** brand asset supplied to this repository. The PDF
documents an identity system (logo system with horizontal lockup, vertical
lockup, glyph, token icon; clearspace and minimum-size rules; color
variants; typography on page 04.1) but is a reference document, not a
source of production files.

### Usage constraints for the PDF

- Reference and documentation only. Nothing renders it at runtime.
- Preserve the artwork as supplied. Do not edit, filter, or regenerate it.
- Do **not** extract, trace, sample, or redraw any mark from it (see §3).
- Its values are already audited: `DESIGN.md` front matter was verified
  against the PDF in the foundation decision record (§3.1 there), and
  typographic facts cited in this repository (e.g. "Sora as primary voice,
  Schibsted Grotesk as secondary", PDF page 04.1) come from that audit.

## 3. Missing production masters (explicit)

The PDF names where masters live — "Logo, glyph, and token icon masters
are at `augur-ecosystem/brand-assets`. Always start from a supplied file.
Nothing in this guide licenses redrawing a mark, and a mark rebuilt by eye
will not match the one already in production." (PDF §01.1, "Where the
artwork lives").

**None of those master files have been received in this repository.** The
following are explicitly missing and must not be recreated from the PDF
screens or by eye:

| Missing master | Referenced by | Needed for |
| --- | --- | --- |
| Logo horizontal lockup master (vector) | PDF §02 "Horizontal lockup" | Product headers, docs site |
| Logo vertical lockup master (vector) | PDF §02 "Vertical lockup" | Cover/landing surfaces |
| Glyph mark master (vector) | PDF §02 "Glyph" | Favicons, avatars, compact UI |
| Token icon master | PDF §02 "Token icon" | Product token surfaces |
| Favicon/app icon export set | Derived from glyph/token icon | Web deployment (#19) |

### Interim rule: text identity

Until masters are supplied, all Augur identity in this repository and its
products is **text identity**: the word "Augur" (or a product name) set in
the system's own typography — Sora for display/headings, per the
`DESIGN.md` typography roles — with no drawn mark. Implementation surface
today: the typography roles in
`packages/design-system/src/styles/typography.css`. There is no logo
component, no logo image, and none may be derived from the PDF. When
masters arrive (dependency: maintainer supplies `augur-ecosystem/brand-assets`),
this section must be updated and a real logo asset decision recorded.

## 4. Font delivery provenance

Fonts are delivered as npm dependencies of `@augur/design-system` —
legitimately self-hostable, OFL-licensed Fontsource packages — never from
Google Fonts CDNs or other third-party hosts at runtime.

| Family (voice) | Package | Version | License | Copyright (must accompany redistribution) | Upstream |
| --- | --- | --- | --- | --- | --- |
| Sora (primary) | `@fontsource/sora` | `5.3.0` (exact pin) | OFL-1.1 | Copyright 2019 The Sora Project Authors (https://github.com/sora-xor/sora-font) | https://github.com/sora-xor/sora-font |
| Schibsted Grotesk (secondary) | `@fontsource/schibsted-grotesk` | `5.3.0` (exact pin) | OFL-1.1 | Copyright 2023 The Schibsted-Grotesk Project Authors (https://github.com/schibsted/schibsted-grotesk) | https://github.com/schibsted/schibsted-grotesk |

- Weights delivered: **Sora 400 + 600** (all DESIGN.md Sora roles), **Schibsted
  Grotesk 400** (body + metadata roles). No other weights are used by
  `DESIGN.md`; add them only with a DESIGN.md change.
- Delivery mechanism: `packages/design-system/src/styles/styles.css`
  imports `@fontsource/sora/400.css`, `600.css`, and
  `@fontsource/schibsted-grotesk/400.css`. These reference subset-split
  woff2/woff files with `unicode-range` and `font-display: swap`; browsers
  fetch only the subsets used. Delivered latin/latin-ext files:
  `sora-latin{,-ext}-{400,600}-normal.woff2` (14,724/15,000/7,340/7,536
  bytes) and `schibsted-grotesk-latin{,-ext}-400-normal.woff2`
  (24,344/11,504 bytes).
- Fallback stacks and family custom properties:
  `packages/design-system/src/styles/fonts.css`
  (`--augur-font-primary`, `--augur-font-secondary`; system-ui fallbacks).
- Machine-readable provenance for consumers:
  `packages/design-system/src/fonts.ts` (`AUGUR_FONTS`, `AUGUR_FONT_FAMILIES`),
  exported from the package entry point.
- License redistribution copies (verbatim from the installed packages):
  `resources/brand/licenses/OFL-1.1-sora.txt`
  (SHA-256 `1ec9623d38c445eb4dfe5fcc783e0f0ee728cc97ca157ce1f8cb2b3bf9d9b0d9`),
  `resources/brand/licenses/OFL-1.1-schibsted-grotesk.txt`
  (SHA-256 `15222412a95d70042e66e79bfb3b985653e0693e4d41703bc131bee9c5aa1aa7`).
- Fontsource upstream: `github.com/fontsource/font-files` (the packages are
  build artifacts of the upstream font projects listed above).

### Browser verification evidence (2026-09-04)

Fixture: `packages/design-system/fixtures/fonts.html`, driven by
`packages/design-system/fixtures/verify-fonts.mjs` (see that directory's
README for the exact commands; playwright is deliberately not a workspace
dependency). Chromium build 1228 via playwright 1.61.1, static server rooted
at the repository, exit code 0, **41/41 assertions PASS**:

- No console errors/warnings; no responses ≥ 400; **zero third-party
  requests** (delivery is fully self-hosted).
- 6 `@font-face` rules registered (`document.fonts.size` = 6: Sora
  latin/latin-ext × 400/600, Schibsted Grotesk latin/latin-ext × 400).
- `document.fonts.status` = `loaded`; `document.fonts.check()` true for
  `16px Sora`, `600 40px Sora`, `16px 'Schibsted Grotesk'`.
- Computed styles of all seven `DESIGN.md` typography roles match
  specification exactly (family stack, weight, size/line-height, letter
  spacing — e.g. display −0.4px, heading-1 −0.14px).

Verification gap honesty: the driver guards a real trap discovered during
this work — `document.fonts.check()` returns `true` even when **zero** font
faces exist (nothing to load ⇒ text silently renders in fallbacks). The
driver therefore also asserts faces are registered and loaded, and
registers network listeners before navigation. Docs-app-level typography
checks remain pending issue #7.

## 5. Maintenance rules

1. Bump a fontsource version → update the exact pin in
   `packages/design-system/package.json`, the constants in
   `packages/design-system/src/fonts.ts`, this table, and re-run the
   fixture driver.
2. Change a `DESIGN.md` typography role → regenerate/update
   `packages/design-system/src/styles/typography.css` (and replace it with
   generated output once the token pipeline from issue #3 exists).
3. Never add a font from an unverified source or a runtime CDN.
4. Never add logo/mark assets to this repository without a maintainer
   decision updating §3.
