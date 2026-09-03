---
name: Invalid Reference Fixture
description: >-
  Controlled invalid input used by packages/design-system/src/tools/generate-tokens.ts
  to prove that token generation fails on invalid references (issue #3).
  This is not a design system and is never consumed as design authority.
omitted:
  - spacing
  - rounded
  - typography
colors:
  primary: "#0E0E21"
components:
  broken-component:
    backgroundColor: "{colors.does-not-exist}"
    textColor: "{colors.primary}"
---

# Invalid reference fixture

`components.broken-component` references `{colors.does-not-exist}`, which is not
defined. The pinned `@google/design.md` linter must report `broken-ref` errors
(exit 1), and `tokens:generate` must refuse to generate tokens. The gate exists
because `design.md export` silently drops unresolvable references instead of
failing, which would otherwise produce incomplete tokens without warning.
