/**
 * PageHeader (issue #14) — a reusable page-title pattern.
 *
 * First slice of the patterns layer (ARCHITECTURE.md §4: patterns compose
 * components; components never depend on patterns). shadcn-compatible
 * part shape, Augur-owned API: pure composition with no product meaning
 * — the copy, links, and actions come entirely from the consumer.
 *
 * Part set (consumer view: docs "PageHeader" pattern page):
 *
 *   - `PageHeader` renders a real `header` element. Nested in a page's
 *     main region it stays a generic container; used directly at the top
 *     of `body` it reads as the page banner — real HTML semantics, no
 *     invented ARIA.
 *   - `PageHeaderBreadcrumb` wraps the breadcrumb (or equivalent wayfinding)
 *     slot in a `<nav>` whose accessible name is REQUIRED — a nav landmark
 *     without a name is an axe finding, and naming is a product decision.
 *     Render the list (`ol`/`li`/links) yourself; the pattern only lays it
 *     out and voices it. For a single back affordance, skip the nav and
 *     place a quiet Button as the first child of `PageHeader` instead.
 *   - `PageHeaderContent` is the title area row: titles/description grow
 *     in the first column, `PageHeaderActions` holds the right edge and
 *     wraps below when its containing block is narrow (responsive by
 *     structure, not by consumer CSS).
 *   - `PageHeaderTitle` is an `h1` by default — a page header titles the
 *     page. When the pattern is used below the page level, pass
 *     `headingLevel` to emit the element the document outline needs; the
 *     heading-1 typography voice is kept by default so the visual
 *     hierarchy stays stable (visual voice and outline level are
 *     deliberately independent).
 *   - `PageHeaderDescription` is a `p` in the body voice with the muted
 *     pairing — page-level supporting text reads at body size; the
 *     smaller metadata voice stays reserved for compact panels (Card).
 *   - `PageHeaderActions` is a layout-only slot for Buttons. One primary
 *     action per header is the contract: the first `Button` in the
 *     default variant is the view's one green signal; everything after
 *     it should be quiet (outline/ghost/link).
 *
 * Styling: `./page-header.css` references semantic role custom properties
 * only (no raw values, no new tokens). Geometry uses structural constants
 * aligned with the spacing and radius structural constants.
 */
import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../internal/cx";

/** Outline level emitted by the heading parts. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type PageHeaderProps = ComponentProps<"header">;

/** Page-title area. Renders a real `header` element — no landmark ARIA. */
export function PageHeader({ className, ...props }: PageHeaderProps) {
  return <header {...props} className={cx("aug-page-header", className)} />;
}

export type PageHeaderBreadcrumbProps = Omit<ComponentProps<"nav">, "aria-label"> & {
  /**
   * Required accessible name for the nav landmark (e.g. "Breadcrumb").
   * Naming the wayfinding region is the consumer's product decision.
   */
  "aria-label": string;
};

/**
 * Wayfinding slot (breadcrumbs). Wrap the consumer-rendered list; a
 * single back affordance does not need this nav — place a quiet Button
 * directly inside `PageHeader` instead.
 */
export function PageHeaderBreadcrumb({ className, ...props }: PageHeaderBreadcrumbProps) {
  return (
    <nav
      {...props}
      className={cx("aug-page-header-breadcrumb", "augur-type-ui", className)}
    />
  );
}

export type PageHeaderContentProps = ComponentProps<"div">;

/** Title area row: titles and description in the first column, actions on the right. */
export function PageHeaderContent({ className, ...props }: PageHeaderContentProps) {
  return <div {...props} className={cx("aug-page-header-content", className)} />;
}

export type PageHeaderTitleProps = Omit<ComponentProps<"h1">, "children"> & {
  /**
   * Document outline level. The default, `1`, is correct when the header
   * titles the page; pass the level the surrounding outline requires.
   */
  headingLevel?: HeadingLevel;
  children?: ReactNode;
};

/** Page title. Real heading semantics; consumers own the document outline. */
export function PageHeaderTitle({
  headingLevel = 1,
  className,
  children,
  ...props
}: PageHeaderTitleProps) {
  const Tag = `h${headingLevel}` as const;
  return (
    <Tag {...props} className={cx("aug-page-header-title", "augur-type-heading-1", className)}>
      {children}
    </Tag>
  );
}

export type PageHeaderDescriptionProps = ComponentProps<"p">;

/** Supporting line under the title, in the body voice with the muted pairing. */
export function PageHeaderDescription({ className, children, ...props }: PageHeaderDescriptionProps) {
  return (
    <p
      {...props}
      className={cx("aug-page-header-description", "augur-type-body", className)}
    >
      {children}
    </p>
  );
}

export type PageHeaderActionsProps = ComponentProps<"div">;

/**
 * Actions slot. Layout only: place Buttons inside — one primary action
 * (the default variant, the view's one green signal), quiet variants for
 * the rest.
 */
export function PageHeaderActions({ className, ...props }: PageHeaderActionsProps) {
  return <div {...props} className={cx("aug-page-header-actions", className)} />;
}
