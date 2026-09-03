# Changelog

## Unreleased

- Established the architecture, initial DESIGN.md, and upstream brand reference.
- Added contributor instructions and a dependency-linked GitHub delivery plan.
- No runtime implementation or released artifacts yet.

### Added

- Bootstrapped the Bun workspace with the `@augur/design-system` package (`exports` entry point plus `styles.css`), root `packageManager`/`engines` pins, exact `@google/design.md` 0.4.0 pin, frozen-installable `bun.lock`, TypeScript project references, and a workspace smoke check. (#1)
- Audited DESIGN.md against the architecture and brand foundation; corrected the light quiet-region color name to Muted (#ECECF2) and documented Mist (#71728A) as the dark edges/rules companion. (#2)
- Added the foundation decision record with proposals FD-01 through FD-06 (spacing, sizing, radius, focus, motion, state semantics), all explicitly `Proposed — pending review`; no proposed values entered DESIGN.md front matter. (#2)
- Added pinned-toolchain token generation: `design.md lint` plus generated base tokens (CSS variables, DTCG JSON, Tailwind variable preview) under `packages/design-system/src/tokens`, with provenance headers, a generated-file policy, determinism checks, and controlled failure-path fixtures. (#3)
- Established font delivery and canonical asset provenance: exact-pinned self-hosted `@fontsource/sora` and `@fontsource/schibsted-grotesk` (OFL-1.1, licenses archived with SHA-256), font/typography styles with fallback stacks, a machine-readable font provenance export, a browser fixture verifying computed faces, and `resources/brand/PROVENANCE.md` recording supplied assets and explicitly missing production masters. (#5)
- Added reliable self-hosted font delivery to `@augur/design-system`: OFL-licensed `@fontsource/sora@5.3.0` (weights 400/600) and `@fontsource/schibsted-grotesk@5.3.0` (weight 400) as exact-pinned package dependencies, aggregated through `styles.css`, with voice-named font-family custom properties (`fonts.css`), the seven DESIGN.md typography roles as classes (`typography.css`), machine-readable provenance exports (`AUGUR_FONTS`), and OFL license copies under `resources/brand/licenses`. (#5)
- Added `resources/brand/PROVENANCE.md` recording supplied-asset inventory (the brand foundation PDF as upstream reference), explicitly missing production masters (logo lockups, glyph, token icon — held at `augur-ecosystem/brand-assets`, not received), the text-identity interim rule, and full font provenance. (#5)
- Added a static font verification fixture (`packages/design-system/fixtures/`) with a browser driver asserting loaded font files, `document.fonts.check()`, computed typography values, and the absence of console/network failures; 41/41 assertions pass in Chromium 1228. (#5)
- Added the semantic light/dark theme layer: `styles.css` now aggregates the generated `--augur-color-*` tokens plus a shadcn-compatible role mapping (`theme.css`) that references generated tokens only — light default with `[data-theme]` opt-in/opt-out and `prefers-color-scheme` fallback, Deep primary actions in light and Green in dark, validated WCAG AA pairs, keyboard-only focus rings, and a structural reduced-motion gate; recorded decisions and contrast evidence in `packages/design-system/docs/semantic-themes.md`, with a package-local `bun test` suite. (#4)
