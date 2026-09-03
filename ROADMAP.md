# Delivery roadmap

The [GitHub Project](https://github.com/users/jubalm/projects/6) tracks current status, priority, and readiness. Repository issues contain executable scope and acceptance criteria, with native blocked-by relationships. This document provides a stable entry map; it does not mirror live completion status.

## Milestones

| Milestone | Exit outcome | Work items |
| --- | --- | --- |
| [M1: Reproducible workspace](https://github.com/jubalm/augur-design-system/milestone/1) | Frozen Bun installation, clear package boundaries, meaningful CI | [#1 Workspace](https://github.com/jubalm/augur-design-system/issues/1), [#6 CI](https://github.com/jubalm/augur-design-system/issues/6) |
| [M2: Canonical foundations and themes](https://github.com/jubalm/augur-design-system/milestone/2) | Reviewed design decisions, generated tokens, semantic themes, reliable typography | [#2 Decisions](https://github.com/jubalm/augur-design-system/issues/2), [#3 Export](https://github.com/jubalm/augur-design-system/issues/3), [#4 Themes](https://github.com/jubalm/augur-design-system/issues/4), [#5 Fonts/assets](https://github.com/jubalm/augur-design-system/issues/5) |
| [M3: Documentation for humans and agents](https://github.com/jubalm/augur-design-system/milestone/3) | Real examples, shared content, Markdown parity, llms.txt | [#7 Astro](https://github.com/jubalm/augur-design-system/issues/7), [#8 Content](https://github.com/jubalm/augur-design-system/issues/8), [#9 Markdown](https://github.com/jubalm/augur-design-system/issues/9), [#10 Foundations docs](https://github.com/jubalm/augur-design-system/issues/10) |
| [M4: Accessible starter components and patterns](https://github.com/jubalm/augur-design-system/milestone/4) | Seven documented starter elements with interaction and browser evidence | [#11 Button/Card](https://github.com/jubalm/augur-design-system/issues/11), [#12 Input/FormField](https://github.com/jubalm/augur-design-system/issues/12), [#13 Dialog](https://github.com/jubalm/augur-design-system/issues/13), [#14 PageHeader/EmptyState](https://github.com/jubalm/augur-design-system/issues/14), [#15 Browser checks](https://github.com/jubalm/augur-design-system/issues/15) |
| [M5: GitHub-first source distribution](https://github.com/jubalm/augur-design-system/milestone/5) | Validated shadcn registry installed successfully in an independent consumer | [#16 Contract](https://github.com/jubalm/augur-design-system/issues/16), [#17 Registry](https://github.com/jubalm/augur-design-system/issues/17), [#18 Consumer](https://github.com/jubalm/augur-design-system/issues/18) |
| [M6: Documentation launch and first release](https://github.com/jubalm/augur-design-system/milestone/6) | Reviewed deployment, legal/domain decisions, versioned artifacts, adoption evidence | [#19 Pages](https://github.com/jubalm/augur-design-system/issues/19), [#20 Decisions](https://github.com/jubalm/augur-design-system/issues/20), [#21 Versioning](https://github.com/jubalm/augur-design-system/issues/21), [#22 Release review](https://github.com/jubalm/augur-design-system/issues/22) |

Milestones group outcomes rather than impose a strict waterfall. Follow issue dependencies: documentation and registry work can advance alongside components once their prerequisites exist. No deadlines have been invented.

## Initial entry points

- #1 establishes the executable workspace.
- #2 reviews shared foundation gaps and reconciles the initial DESIGN.md with the architecture.
- #20 collects maintainer decisions on licensing, asset redistribution, domain, and any future organization transfer.

Check live readiness before starting. A new contributor should read `AGENTS.md`, inspect current implementation, claim an issue, and leave branch/commit, verification, blockers, and next-action evidence in the issue or PR.

## Deferred by architecture

npm publication, mandatory bundled output, Storybook, automated blocking AI review, large component catalogs, and extracted token/icon packages require concrete future needs. The first release establishes a small reusable system and proves one independent source-install path.
