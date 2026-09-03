---
name: Malformed YAML Fixture
description: Controlled bad input for the degenerate-export failure path (issue #3).
description2: [broken
  flow: {{{
omitted:
  - spacing
  - rounded
colors:
  primary: "#0E0E21"
---

# Malformed YAML fixture

The front matter above is tolerated by the YAML parser with a warning (no error
findings), so the lint gate passes — but the parsed token set is empty or
degraded. The pinned `design.md export` then emits an empty token document
without failing. `tokens:generate` must detect the degenerate output and exit
nonzero, proving the "fail on export failures" path beyond command exit codes.
