/**
 * Primary navigation model for the docs.
 *
 * Issue #8 introduced the shared content pipeline
 * (`src/content/<kind>/`, routes `/foundations|components|patterns|reference/<slug>`,
 * see `src/content/README.md`); nav entries for collection pages link
 * their stable routes. Shell pages (`/`, `/getting-started`) remain app
 * pages by convention. Paths are site-absolute and must go through
 * `withBase()` at render time (see `src/lib/base.ts`).
 */
export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Getting started", href: "/getting-started" },
  { label: "Foundation decisions", href: "/foundations/decisions" },
  { label: "Fonts and typography", href: "/foundations/fonts" },
  { label: "Theming", href: "/foundations/theming" },
  { label: "Package entries", href: "/reference/package-entries" },
] as const;
