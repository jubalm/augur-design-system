---
name: Missing Foundation Sections Fixture
description: >-
  Controlled input used by packages/design-system/src/tools/generate-tokens.ts
  to prove that token generation fails when the adopted spacing and rounded
  sections of DESIGN.md (issue 45) are missing from an otherwise valid source
  (degenerate-export). Not a design system; never consumed as design authority.
colors:
  primary: "#0E0E21"
typography:
  body:
    fontFamily: Schibsted Grotesk
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
---

# Missing foundation sections fixture

The front matter above is valid and exports colors and typography, but the
adopted `spacing` and `rounded` sections (issue 45) are absent. The pinned
`design.md export` emits those groups empty instead of failing; the dtcg and
css-vars count guards must detect the missing groups and exit nonzero so
generated artifacts can never silently drop adopted foundation values.
