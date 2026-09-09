---
title: Foundation decisions
description: The current Augur foundation decisions, their source precedence, superseded rules, and the provenance needed to understand why they exist.
order: 8
---

This page records provenance. It is not an alternate source of design values.

Use the maintained foundation pages for day-to-day design decisions and `DESIGN.md` for adopted values representable by the pinned schema. Use this page when you need to understand why a rule exists, what it superseded, or where acceptance evidence lives.

## Source precedence

When sources appear to disagree, use this order:

1. `DESIGN.md` for adopted values representable by the pinned schema.
2. Generated token and theme artifacts as derived outputs of those values.
3. Maintained foundation guidance for system decisions that do not fit the schema cleanly.
4. Component and pattern documentation for local usage, behavior, and composition contracts.
5. Brand material, issue discussions, fixtures, and historical records as evidence and provenance.

Historical evidence does not silently override maintained guidance.

## Current decisions

| Concern | Current decision | Primary home |
| --- | --- | --- |
| Local spacing | 4 / 8 / 12 / 16 / 24 / 32px | `DESIGN.md`, Layout and geometry |
| Composition spacing | 48 / 64 / 80px for major page regions | Layout and geometry |
| Docs reading shell | 1400px maximum frame, 64px wide gutters / 24px below 960px, 65ch prose; dense content may use the wider document column | Layout and geometry |
| Control sizing | 32 / 36 / 40px structural heights; at least 44×44px actionable targets on coarse pointers | Layout and geometry |
| Shape | 0px control and surface radius; intrinsic circles and verified artwork are exceptions | `DESIGN.md`, Layout and geometry |
| Focus | 2px `:focus-visible` ring with 2px offset through the semantic `--ring` role | Interaction |
| Motion | Immediate state feedback; no decorative transitions by default | Interaction |
| State communication | Disabled, loading, invalid, selected, and record states are explicit in semantics or copy; color is reinforcement | Interaction |
| Typography | Sora primary voice, Schibsted Grotesk supporting voice; regular editorial roles coexist with stronger interface roles | `DESIGN.md`, Fonts and typography |
| Color signal | Green is reserved for primary intent, focus, active state where appropriate, or a short orientation signal | Color system |
| Theme parity | Light and dark change semantic color roles, not geometry, order, or behavior | Theming |
| Interim identity | Live-text Augur wordmark + Design system descriptor until verified official masters are supplied | Brand identity |

## Superseded guidance

The following are historical and must not be reintroduced as current system rules:

- 8px surface radius and 6px control radius;
- universal 150ms / 250ms motion durations;
- proposal-era wording that treats spacing, sizing, radius, focus, or state behavior as pending adoption;
- the earlier 1200px maximum for the documentation reading shell;
- treating source observations or one reference composition as universal web tokens.

The docs-shell change to 1400px is intentionally scoped: it solves dense reference-table readability while leaving other composition contracts to their own guidance.

## Brand-source facts

The pinned brand foundation establishes the core palette, typography families and inherited interface roles, state vocabulary, contrast reference pairings, and the principle that Augur Green is a signal rather than a decorative wash.

`DESIGN.md` records the adopted values that fit its schema. The package test suite recomputes and verifies the maintained contrast pairings from generated values.

## Historical record

The original foundation audit and proposal-era rationale remain available in the pinned pre-adoption record:

- [Pre-adoption foundation audit](https://github.com/jubalm/augur-design-system/blob/88a6ccf46b201b921344bfa1411ed41b1ec17ba0/apps/docs/src/content/foundations/foundation-decisions.md)
- [Pinned brand foundation PDF](https://github.com/jubalm/augur-design-system/blob/88a6ccf46b201b921344bfa1411ed41b1ec17ba0/resources/brand/augur-brand-foundation.pdf)
- [Asset provenance](https://github.com/jubalm/augur-design-system/blob/main/resources/brand/PROVENANCE.md)

Later implementation decisions encoded the adopted typography, spacing, shape, border, and interaction foundations and updated the docs reading shell when dense-table evidence required a wider reference frame. The issue history remains useful evidence, but contributors should not need it to discover the current rule.

## Acceptance boundary

Deterministic tests, token parity, browser fixtures, and standalone-consumer checks prove implementation consistency. They do not establish final visual acceptance.

Final human visual acceptance remains tracked in [issue 53](https://github.com/jubalm/augur-design-system/issues/53). Release and publication remain separate maintainer decisions.
