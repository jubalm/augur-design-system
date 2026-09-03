---
# Deliberate INVALID fixture (issue #8) — do not fix, do not import.
#
# Foundations entry missing the REQUIRED `title` metadata. Used by
# `fixtures/verify-content-failures.mjs` to prove that invalid required
# metadata fails the docs build with a clear, actionable error.
# Staged temporarily into src/content/foundations/ and removed again.
description: Deliberate invalid fixture — this foundations entry is missing the required title metadata field.
order: 99
---

## Deliberately invalid

This entry must never render: its `title` is missing, so the zod schema
in `src/content.config.ts` must reject it at sync/build time.
