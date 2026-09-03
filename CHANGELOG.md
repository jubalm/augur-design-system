# Changelog

## Unreleased

- Established the architecture, initial DESIGN.md, and upstream brand reference.
- Added contributor instructions and a dependency-linked GitHub delivery plan.
- No runtime implementation or released artifacts yet.

### Added

- Bootstrapped the Bun workspace with the `@augur/design-system` package (`exports` entry point plus `styles.css`), root `packageManager`/`engines` pins, exact `@google/design.md` 0.4.0 pin, frozen-installable `bun.lock`, TypeScript project references, and a workspace smoke check. (#1)
- Audited DESIGN.md against the architecture and brand foundation; corrected the light quiet-region color name to Muted (#ECECF2) and documented Mist (#71728A) as the dark edges/rules companion. (#2)
- Added the foundation decision record with proposals FD-01 through FD-06 (spacing, sizing, radius, focus, motion, state semantics), all explicitly `Proposed — pending review`; no proposed values entered DESIGN.md front matter. (#2)
