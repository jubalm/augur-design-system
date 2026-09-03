# Augur Design System Architecture

> Working architecture and project specification. This document is
> expected to evolve alongside the system.

## 1. Purpose

The **Augur Design System** is the canonical, versioned source for Augur's interface language.

It should provide both:

1. **Human- and AI-readable design guidance** — how Augur interfaces should look, behave, and be composed.
2. **Reusable frontend implementation** — components, tokens, styles, and other primitives that Augur applications can consume directly.

The goal is for independently developed Augur applications to share a common interface language without repeatedly implementing or interpreting the same design decisions.

An application should eventually be able to consume the system approximately like:

``` tsx
import {
  Button,
  Card,
  Input,
  Dialog,
} from "@augur/design-system"

import "@augur/design-system/styles.css"
```

The design system should therefore function as both a **design specification** and an **executable implementation of that specification**.

---

## 2. Core Principles

### One canonical source

Design guidance and its implementation should live together wherever practical.

A component's documentation, design rationale, tokens, implementation, examples, and tests should not evolve as disconnected projects.

### Designed for reuse

The system should contain interface concepts that are reusable across Augur products.

Product-specific functionality should remain inside the product that owns it.

**Design system examples:**

-   Button
-   Input
-   Dialog
-   Card
-   Form Field
-   Empty State
-   Page Header
-   shared layout patterns

**Product examples:**

-   Portfolio Performance Chart
-   Trade Order Form
-   Customer Profile Panel
-   product-specific workflows

> If something describes how Augur interfaces generally work, it
> probably belongs in the design system. If it describes how a
> particular Augur product works, it probably belongs in that product.

### AI-friendly by design

The repository should be understandable by both human contributors and coding/design agents.

Important design intent should be explicit rather than existing only implicitly inside CSS or component implementations.

Agents should be able to determine:

-   what the system is
-   how it is organized
-   what design principles govern it
-   which components already exist
-   when those components should be used
-   which tokens are available
-   what conventions contributions must follow
-   where product-specific concerns should live
-   how to verify that a change conforms to the system

### Incremental architecture

The system should be capable of expanding without requiring every possible abstraction or package boundary upfront.

Internal boundaries should be clear enough that pieces can later be extracted if independent consumers emerge.

---

## 3. Terminology

### Design System

The **Augur Design System** is the overall set of decisions, rules, conventions, reusable assets, and implementations governing Augur interfaces.

It is not a separate package by definition. In this project, the repository is the canonical home of the design system.

### Foundations

Fundamental design decisions such as color, typography, spacing, sizing, radius, elevation, layout/grid, and motion.

### Design Tokens

Machine-readable representations of design decisions.

Examples:

``` text
color.surface
color.text.primary
color.action.primary

space.xs
space.sm
space.md
space.lg

radius.control
radius.surface
```

### Primitive

A low-level interface building block. Primitives may provide behavior, accessibility, interaction, or basic structure from which Augur components are constructed.

Libraries such as Radix may be used internally where appropriate.

### Component

A reusable implementation of an Augur interface element, such as Button, Input, Select, Dialog, Card, Tabs, Tooltip, or Badge.

### Pattern

A reusable composition or solution involving multiple interface elements, such as Form Field, Page Header, Empty State, Filter Bar, or Search Interface.

### Component Library

The code-facing portion of the design system:

``` tsx
import { Button } from "@augur/design-system"
```

### Documentation Site

The human-facing representation of the design system. It documents foundations, components, patterns, usage guidance, examples, and rationale while rendering the real components provided by the package.

---

## 4. Conceptual Layers

The system should generally follow this dependency direction:

``` text
Foundations
     ↓
Tokens
     ↓
Primitives
     ↓
Components
     ↓
Patterns
     ↓
Product Interfaces
```

Dependencies should primarily flow downward.

-   `Button` may depend on design tokens.
-   `FormField` may depend on `Input`.
-   `Input` should not depend on `FormField`.
-   tokens should know nothing about components.
- the design system should know nothing about product-specific features.

This layering is conceptual. It does not require each layer to become an independently published package.

---

## 5. Repository

GitHub repository:

```text
jubalm/augur-design-system
```

The initial repository is owned by `jubalm`. A future transfer to
`AugurProject` is a separate decision; the older `augur-design-system-od`
repository is not this implementation's source of truth.

Workspace package:

```text
@augur/design-system
```

The package name is the code-facing identity used inside the workspace and eventually by consuming Augur applications. It does not imply that the package is already published to npm or any other registry. Package distribution remains a separate decision.

The repository contains both the importable design-system package and its documentation website.

Current lightweight workspace:

```text
augur-design-system/
├── README.md
├── ARCHITECTURE.md
├── DESIGN.md
├── AGENTS.md
├── CHANGELOG.md
├── package.json
├── bun.lock
│
├── resources/
│   └── brand/
│       └── augur-brand-foundation.pdf
│
├── packages/
│   └── design-system/
│       ├── src/
│       │   ├── foundations/
│       │   ├── tokens/
│       │   ├── primitives/
│       │   ├── components/
│       │   ├── patterns/
│       │   └── styles/
│       ├── package.json
│       └── tsconfig.json
│
└── apps/
    └── docs/
        ├── src/
        ├── content/
        │   ├── foundations/
        │   ├── components/
        │   └── patterns/
        └── package.json
```

This is intentionally a small Bun workspace/monorepo. No Turborepo, Nx, or equivalent orchestration layer is required initially.

---

## 6. Key Repository Documents

### `ARCHITECTURE.md`

This document. It describes what is being built: repository structure, boundaries, distribution, tooling, documentation architecture, and evolution strategy.

### `DESIGN.md`

`DESIGN.md` follows the Google Labs `design.md` format specification.

It is the canonical source for design values that fit the format's schema, combining machine-readable YAML tokens with human-readable design rationale.

The project should pin an exact version of `@google/design.md` rather than following a floating range. Upgrades to the format/tooling should be deliberate migration events.

Conceptually:

```text
DESIGN.md
   │
   ├── lint with pinned @google/design.md
   ├── export machine-readable tokens
   ├── export runtime theme representations
   └── feed docs and component implementation
```

Generated token files, CSS theme output, or other runtime representations derived from `DESIGN.md` should be treated as build artifacts rather than independently maintained sources of truth.

Where the design system requires concepts that the `DESIGN.md` schema cannot represent cleanly, those concerns should remain in normal component code, documentation, or configuration rather than forcing them into the format.

### `AGENTS.md`

Operational instructions for AI agents and contributors working in the repository: repository conventions, contribution rules, validation expectations, and how to use `DESIGN.md` and the component library.

### `README.md`

Entry point for humans: what the project is, installation, basic usage, development commands, and links to the documentation site.


### `resources/`

Upstream source material that informs the design system but is not itself the production implementation source of truth.

The current WIP brand foundation belongs here:

```text
resources/brand/augur-brand-foundation.pdf
```

It may also be linked from the documentation site as a reference resource. As the design system evolves, current tokens, components, `DESIGN.md`, and current docs should make it clear when implementation has moved beyond an older reference artifact.

---

## 7. Workspace Tooling

### Bun

Bun is the preferred initial package manager/runtime.

``` json
{
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

The documentation application can consume the local design-system package:

``` json
{
  "dependencies": {
    "@augur/design-system": "workspace:*"
  }
}
```

Bun-specific assumptions should remain minimal enough that another package manager/runtime could be adopted if a tooling incompatibility appears.

No Turborepo, Nx, or equivalent orchestration layer is currently required.

### Pinned `@google/design.md`

The repository should use an exact pinned version of `@google/design.md` for linting and export behavior.

Example:

```json
{
  "devDependencies": {
    "@google/design.md": "X.Y.Z"
  }
}
```

Avoid `^` or `~` ranges for this dependency. A tool-version change should be reviewed as an intentional design-system migration.

### Theme mapping

`DESIGN.md` remains canonical for design values that its pinned schema can represent. Light/dark runtime theming should not duplicate those raw values in separately maintained files.

Where additional runtime semantics are needed, use a thin theme-mapping layer that references generated tokens:

```text
DESIGN.md
   ↓
generated base tokens
   ↓
semantic theme mapping
├── light
└── dark
   ↓
CSS variables / runtime theme
```

The mapping layer should primarily express relationships and semantic roles. Raw values should only live outside `DESIGN.md` when the pinned schema genuinely cannot represent the required concept.


---

## 8. Package Structure

Initial internal structure:

``` text
packages/design-system/src/

foundations/
    color
    typography
    spacing
    radius
    motion

tokens/
    primitive
    semantic

primitives/
    ...

components/
    button/
    input/
    dialog/
    card/
    ...

patterns/
    form-field/
    empty-state/
    page-header/
    ...

styles/
    globals.css
    themes.css

index.ts
```

The exact structure should evolve based on actual requirements rather than attempting to model every future possibility immediately.

### Theme mapping

`DESIGN.md` should remain authoritative for raw design values that fit its pinned schema.

When runtime light/dark theming requires relationships the schema does not express directly, introduce a thin semantic mapping layer:

```text
DESIGN.md
   ↓
generated base tokens
   ↓
semantic theme mapping
├── light
└── dark
   ↓
CSS variables / component consumption
```

The mapping layer should reference generated tokens rather than repeat raw values. Its job is to express runtime relationships, not create a second token source of truth.


---

## 9. Public API

Consumers should interact with a stable public API rather than importing arbitrary internal files.

``` tsx
import {
  Button,
  Card,
  Input,
} from "@augur/design-system"

import "@augur/design-system/styles.css"
```

Additional entry points may eventually be exposed where there is a genuine need:

``` tsx
import { tokens } from "@augur/design-system/tokens"
```

Internal file organization should not automatically become public API.

### Optional bundled package output

The primary near-term consumption path is the shadcn-compatible GitHub registry/source-install workflow.

If a bundled package artifact is needed for workspace use or future registry publication, use **tsup** initially to produce the package output. Keep this build layer secondary to the source-based shadcn workflow and avoid coupling the architecture to a specific bundler beyond what is necessary.


---

## 10. Package Build Strategy

The GitHub/shadcn registry path is the primary initial distribution mechanism, so a bundled package build should remain secondary.

If or when `@augur/design-system` needs distributable package artifacts, use **tsup** as the initial package build tool. It is intentionally scoped to package output rather than becoming a larger repository orchestration layer.

The build strategy should remain compatible with shadcn-oriented source distribution. Registry-installed source should not depend on the existence of a bundled npm package.

---

## 11. Component Foundation

shadcn/ui should be treated as the primary compatibility model and implementation starting point where appropriate.

The goal is to stay intentionally close to shadcn conventions so the system is familiar to developers and compatible with shadcn-oriented tooling and installation flows where useful.

```text
Augur DESIGN.md / foundations
       ↓
generated Augur tokens
       ↓
Augur component specifications
       ↓
Augur-owned shadcn-compatible components
       ↑
shadcn / Radix implementation patterns
```

Augur should own the resulting APIs, styling, tokens, documentation, and conventions even when implementations originate from shadcn.

Where practical, the project may use shadcn registry conventions such as `registry.json`, registry item schemas, `components.json`, and CLI-based source installation.

Applications should not need to care whether a component originated from shadcn, Radix, or a custom implementation.

---

## 12. Documentation Website

The design system should have a first-class documentation website similar in spirit to shadcn.

The docs application should use **plain Astro**, without Starlight or another docs framework layer initially. The intent is to keep the site architecture straightforward, flexible, and easy for coding agents to understand and modify directly from Astro's own conventions and documentation.

It should eventually provide:

-   design-system introduction
-   principles
-   foundations
-   token documentation
-   component documentation
-   live component examples
-   variants and states
-   usage guidance
-   accessibility guidance
-   patterns
-   implementation/API documentation
-   migration guidance where necessary

A component page might contain:

``` text
Button

Overview
When to use
When not to use

Examples
  Primary
  Secondary
  Destructive
  Loading
  Disabled

Variants
Sizes
States

Accessibility
API
Design rationale
```

The documentation site should render components from the actual workspace package wherever possible:

``` tsx
import { Button } from "@augur/design-system"
```

This ensures the documentation demonstrates the implementation consumers actually receive.

Documentation content and documentation-only dependencies should remain isolated under `apps/docs` so they do not become part of the consumable component source or package output.

Preferred direction:

```text
apps/docs/
├── src/
│   ├── pages/
│   ├── components/
│   └── content/
│       ├── foundations/
│       ├── components/
│       └── patterns/

packages/design-system/
└── src/
    ├── components/
    ├── tokens/
    └── styles/
```

MDX/shared Markdown-oriented content under the docs app should be the primary authoring format for documentation pages. The docs app may import from `@augur/design-system`; the design-system package must not import from `apps/docs`.


---

## 13. Documentation Delivery for Humans and LLMs

The documentation site should expose each substantive page in two representations:

1. **Rendered documentation** — the normal website experience with navigation, live component examples, visual previews, and interactive content.
2. **Clean Markdown** — a plain Markdown representation of the same documentation suitable for copying, direct linking, indexing, and use as LLM context.

Conceptually:

```text
Documentation source
        │
        ├──→ rendered website page
        │
        └──→ clean Markdown representation
```

Examples:

```text
/docs/foundations/color
/docs/foundations/color.md

/docs/components/button
/docs/components/button.md
```

The exact URL convention may change, but every substantive documentation page should have a predictable Markdown equivalent.

The rendered documentation UI should expose actions similar to:

```text
Copy page
View as Markdown
```

`Copy page` should copy the clean Markdown representation rather than rendered HTML or navigation chrome.

`View as Markdown` should open the plain Markdown representation directly.

This is a first-class architectural requirement, not an optional convenience. The goal is to make the docs easy to consume by humans, coding agents, and other LLM-based tools without requiring them to parse the full presentation layer.

### Documentation source strategy

Where practical, the Markdown representation should come from the same source content used to render the page rather than being maintained separately.

The preferred relationship is:

```text
shared documentation source
        │
        ├──→ website renderer
        └──→ Markdown output
```

This reduces drift between the human-facing and LLM-facing representations.

Interactive examples, live previews, and other UI-only elements may be represented in Markdown by their source code, description, or a stable link to the rendered example.

### `llms.txt`

The public documentation site should provide an `llms.txt` file at a predictable root URL:

```text
/llms.txt
```

Its purpose is to help LLMs understand what the Augur Design System documentation contains and where to find authoritative information.

It should remain concise and navigational rather than attempting to duplicate the entire documentation set.

It may include:

- a short description of the Augur Design System
- the canonical docs base URL
- where to find the design foundations
- where to find component documentation
- where to find patterns
- where to find the Markdown version of pages
- where to find `DESIGN.md`
- where to find package/API usage
- where to find changelogs or migration guidance
- guidance about which sources are authoritative
- links to machine-readable indexes if later added

Conceptually:

```text
llms.txt
   │
   ├── foundations → /docs/foundations/
   ├── components  → /docs/components/
   ├── patterns    → /docs/patterns/
   ├── DESIGN.md   → /DESIGN.md or documented canonical location
   └── package API → /docs/reference/
```

The `llms.txt` file should guide retrieval rather than restating design rules.

If a more detailed LLM-oriented index becomes useful later, the system may additionally expose something such as:

```text
/llms-full.txt
```

or another machine-oriented manifest. This should only be added when there is a concrete need.

### Authority and source precedence

The system should make source precedence explicit.

For design values representable by the Google `DESIGN.md` schema:

```text
DESIGN.md
   ↓
generated runtime tokens / CSS / theme output
   ↓
components and docs
```

For concepts outside that schema, component implementation and current design-system documentation remain authoritative for their own domain.

Upstream reference material such as the WIP Brand Foundation PDF informs the system but should not silently override current `DESIGN.md`, generated outputs, component implementation, or current docs.

Agents should never have to guess whether an older reference artifact overrides the maintained design system.

---

## 14. AI and Contributor Architecture

A useful information hierarchy is:

``` text
AGENTS.md
    ↓
How should I work in this repository?

DESIGN.md
    ↓
What is Augur's visual/design language?

Documentation
    ↓
What are the detailed rules for this concept/component?

Tokens / Components
    ↓
How are those decisions implemented?

Examples / Tests
    ↓
What does correct usage look like?
```

`AGENTS.md` may eventually define rules such as:

-   consult `DESIGN.md` before making visual design decisions
-   prefer existing components over creating duplicates
-   prefer semantic tokens over hard-coded values
-   respect dependency layering
-   do not introduce product-specific behavior into shared components
-   document new reusable patterns
-   preserve accessibility behavior
-   update relevant documentation when public behavior changes
-   add or update tests/examples for component changes

---

## 15. Component Documentation

Where useful, components may keep documentation close to their implementation:

``` text
components/
└── button/
    ├── button.tsx
    ├── button.test.tsx
    ├── button.stories.tsx
    └── button.md
```

The exact documentation mechanism remains an implementation decision.

Component documentation should capture information that cannot reliably be inferred from code alone, particularly intended use, inappropriate use, hierarchy, behavior, composition, accessibility, and design rationale.

---

## 16. Documentation Website Deployment

The documentation website should be capable of static generation.

Initial intended deployment:

``` text
GitHub repository
       ↓
GitHub Actions
       ↓
build apps/docs
       ↓
static output
       ↓
GitHub Pages
       ↓
custom domain
```

The hosting architecture should remain replaceable. Moving the docs application to another host later should not require restructuring the design-system package.

---

## 18. Validation and Review

Validation should separate deterministic facts from design judgment.

### Deterministic testing

Use:

- **Vitest** for unit-level behavior and utilities.
- **Testing Library** for component interaction and rendered behavior.
- **axe** for automated accessibility checks.
- **Playwright** for browser-level behavior and, once useful, screenshot-based visual regression.

The Astro docs/demo routes can provide the browser surfaces used by Playwright, avoiding the need to introduce Storybook initially.

Deterministic CI should cover facts such as builds, types, linting, `DESIGN.md` validity, broken token references, component behavior, and automatable accessibility failures.

### AI design review

AI review should cover coherence and judgment that would otherwise require brittle custom validation scripts.

`AGENTS.md` should define a review procedure that asks agents to compare changes against:

- `DESIGN.md`
- affected documentation
- related existing components
- token reuse and semantic consistency
- shadcn/API conventions
- accessibility intent
- design-system versus product-specific boundaries

Initially, this review can be run by contributors or coding agents as part of normal development. If automated PR review becomes useful later, it should begin as an advisory, non-blocking report. Deterministic CI remains the blocking layer until AI review behavior has demonstrated sufficient reliability.

---

## 19. Versioning

The design system should be explicitly versioned.

``` text
1.3.0
+ Alert component
+ new semantic status tokens

1.4.0
+ EmptyState pattern
+ Button loading state

2.0.0
! changed typography scale
! removed deprecated Button variant
```

Documentation may deploy more frequently than package releases.

``` text
merge to main
├── test/build design system
└── deploy latest documentation

release
├── version the design system
├── publish/update GitHub registry artifacts as needed
├── optionally publish @augur/design-system later if adopted
└── record changelog
```

---

## 20. Future Applications and Distribution

Future Augur applications may live in completely separate repositories and consume the same interface system.

Inside this repository, `apps/docs` can use the local workspace package directly:

```json
{
  "dependencies": {
    "@augur/design-system": "workspace:*"
  }
}
```

Initial external distribution should remain GitHub-first rather than requiring npm publication.

The preferred initial path is a public GitHub repository with shadcn-compatible registry/install conventions where practical. This lets projects pull Augur-owned component source using familiar shadcn workflows without requiring an npm package release.

An npm-published `@augur/design-system` package may be added later if there is a concrete need, but it is not part of the initial plan.

If package publication is added later, an application could consume a released version such as:

```json
{
  "dependencies": {
    "@augur/design-system": "^1.4.0"
  }
}
```

---

## 21. Evolution

The initial architecture intentionally avoids prematurely separating concerns into many packages.

Start with:

``` text
packages/
└── design-system/
```

If independent consumers eventually require it:

``` text
packages/
├── design-system/
├── tokens/
├── icons/
└── charts/
```

Extraction should happen because a real dependency or distribution boundary exists, not merely because the conceptual layers are different.

---

## 22. Initial Technical Direction

Current working decisions:

- **Repository:** `jubalm/augur-design-system` initially; any future organization transfer is a separate decision
- **Workspace package:** `@augur/design-system`
- **Initial external distribution:** GitHub-first, using shadcn-compatible registry/install conventions where practical
- **npm publication:** Possible later addition, not currently planned
- **Repository structure:** Lightweight monorepo/workspace
- **Package manager/runtime:** Bun
- **UI framework:** React
- **Component model:** Stay very close to shadcn conventions for familiarity and compatibility
- **Optional bundled package build:** tsup
- **Primitive layer:** Radix or equivalent where appropriate
- **Design-value source:** Google Labs-compatible `DESIGN.md`
- **`@google/design.md`:** Exact pinned version; upgrades are deliberate migrations
- **Generated design outputs:** Runtime tokens/theme representations should be generated from `DESIGN.md` where supported
- **Theme strategy:** Thin semantic light/dark mapping layer over generated tokens; avoid duplicated raw values
- **Documentation:** Dedicated plain Astro docs app in the same repository
- **Docs source:** MDX/shared Markdown-oriented content, rendered to the site and exposed as clean Markdown
- **Docs representations:** Rendered pages plus clean Markdown for each substantive page
- **LLM navigation:** `/llms.txt`
- **Hosting:** GitHub Pages
- **Domain:** Custom design-system/docs domain
- **Architecture specification:** `ARCHITECTURE.md`
- **Agent guidance:** `AGENTS.md`
- **Deterministic testing:** Vitest + Testing Library + axe; Playwright for browser/visual coverage
- **AI review:** Agent-guided coherence review; advisory PR automation may be added later
- **Upstream brand reference:** `resources/brand/augur-brand-foundation.pdf`
- **Design rationale/history:** Maintained primarily in the docs site

These are working decisions and may change as implementation requirements become clearer.

---

## 22. Decisions and Future Questions

### Decisions already made

- The docs site will use plain Astro rather than Starlight.
- The docs site will be statically deployable to GitHub Pages and use a custom domain.
- Documentation will use MDX/shared Markdown-oriented source under `apps/docs`, isolated from consumable component source.
- Every substantive docs page should have a clean Markdown representation in addition to the rendered page.
- The docs UI should expose `Copy page` and `View as Markdown` actions.
- The docs site should expose `/llms.txt` to guide LLMs through authoritative documentation.
- Bun will be used for the initial workspace/package-management setup.
- The initial repository is `jubalm/augur-design-system`; a future organization transfer is a separate decision.
- The workspace package will be named `@augur/design-system`.
- Initial external distribution will be GitHub-first using shadcn-compatible registry/install conventions where practical.
- npm publication is a possible later addition, not currently planned.
- The component system should stay very close to shadcn conventions for familiarity and ecosystem compatibility.
- `DESIGN.md` will follow the Google Labs `design.md` specification and be canonical for design values representable by its schema.
- `@google/design.md` will be pinned to an exact version; upgrades are deliberate migrations.
- Runtime token/theme representations should be generated from `DESIGN.md` where supported.
- Light/dark runtime themes should use a thin semantic mapping layer over generated tokens rather than duplicate raw values.
- The WIP Augur Brand Foundation PDF will live under `resources/brand/` as upstream reference material.
- The initial Augur `DESIGN.md` is present at the repository root. Its foundation gaps and authority wording must be reconciled with this architecture during foundation implementation.
- If bundled `@augur/design-system` artifacts are needed, **tsup** is the initial build-tool choice; the GitHub/shadcn source-install path remains primary.
- Deterministic testing will use **Vitest + Testing Library + axe**, with **Playwright** for browser coverage and visual regression when useful.
- Storybook is not required initially because the Astro docs site can provide component demo/test surfaces.
- AI review will handle design coherence and cross-file judgment using instructions in `AGENTS.md`; automated PR AI review can be added later as advisory/non-blocking.
- Design rationale and ongoing design-system explanation should primarily live in the docs site.

### Future questions

The initial architecture is now sufficiently specified to begin implementation. Remaining questions should be resolved when concrete implementation pressure appears rather than designed upfront, including whether npm publication becomes useful, whether Storybook adds value beyond the docs site, and whether AI PR review should become automated or blocking.

---

## 23. Current Goal

The immediate goal is **not** to build a large component catalog.

It is to establish a small, understandable foundation that lets Augur progressively define its interface language and turn those decisions into reusable, documented, versioned components.

``` text
Define
   ↓
Document
   ↓
Implement
   ↓
Showcase
   ↓
Use in products
   ↓
Learn
   ↓
Refine
   └────────→ version and repeat
```

The repository should make that loop easy for both human and AI contributors.
