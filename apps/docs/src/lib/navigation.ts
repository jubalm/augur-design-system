/**
 * Primary navigation model for the docs shell (issue #7).
 *
 * A single flat list is deliberate for this bounded shell slice: the
 * content schema, section taxonomy, and sidebar conventions are owned by
 * issue #8 and will extend or reshape this model. Paths are site-absolute
 * and must go through `withBase()` at render time (see `src/lib/base.ts`).
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
] as const;
