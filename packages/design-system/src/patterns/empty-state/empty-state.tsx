/**
 * EmptyState (issue #14) — a reusable empty-state pattern.
 *
 * Patterns layer (ARCHITECTURE.md §4): composes existing components, no
 * product meaning. An empty state names a region that has nothing to
 * show yet and offers the way out; the pattern owns the composition,
 * the consumer owns the copy and the behavior.
 *
 * Part set (consumer view: docs "EmptyState" pattern page):
 *
 *   - `EmptyState` is a quiet, centered column — a layout region with
 *     no landmark role and no surface color of its own. Per the
 *     one-green-signal rule the container stays neutral: the only
 *     action color on screen comes from the consumer's primary Button.
 *   - `EmptyStateIcon` is the icon/glyph slot: a muted tile that sizes
 *     and tints whatever decorative svg the consumer drops in. The slot
 *     is decorative by default — pass `aria-hidden="true"` on the glyph;
 *     a genuinely informative image must stay un-hidden and labeled.
 *   - `EmptyStateTitle` is an `h2` by default — under a page header
 *     (`PageHeaderTitle`) or an equivalent page `h1`. Pass `headingLevel`
 *     when the surrounding document outline needs a different level; the
 *     heading-2 typography voice is kept by default so the visual
 *     hierarchy stays stable.
 *   - `EmptyStateDescription` is a `p` in the body voice with the muted
 *     pairing, width-capped so long copy stays readable.
 *   - `EmptyStateActions` is a layout-only slot. Compose with the real
 *     Buttons: one primary action (default variant — the view's one
 *     green signal) and at most a quiet secondary (outline); no other
 *     action priority is offered.
 *
 * Styling: `./empty-state.css` references semantic role custom
 * properties only (no raw values, no new tokens). Geometry uses
 * structural constants (spacing, icon, radius).
 */
import type { ComponentProps, ReactNode } from "react";
import type { HeadingLevel } from "../page-header/page-header";
import { cx } from "../../internal/cx";

export type EmptyStateProps = ComponentProps<"div">;

/** Empty-state region. Plain `div`, centered column, no landmark role. */
export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <div {...props} className={cx("aug-empty-state", className)} />;
}

export type EmptyStateIconProps = ComponentProps<"div">;

/** Decorative icon/glyph slot. Pass `aria-hidden` on the glyph itself. */
export function EmptyStateIcon({ className, ...props }: EmptyStateIconProps) {
  return <div {...props} className={cx("aug-empty-state-icon", className)} />;
}

export type EmptyStateTitleProps = Omit<ComponentProps<"h2">, "children"> & {
  /** Document outline level; default `2` sits under the page title. */
  headingLevel?: HeadingLevel;
  children?: ReactNode;
};

/** Empty-state title. Real heading semantics; consumers own the outline. */
export function EmptyStateTitle({
  headingLevel = 2,
  className,
  children,
  ...props
}: EmptyStateTitleProps) {
  const Tag = `h${headingLevel}` as const;
  return (
    <Tag {...props} className={cx("aug-empty-state-title", "augur-type-heading-2", className)}>
      {children}
    </Tag>
  );
}

export type EmptyStateDescriptionProps = ComponentProps<"p">;

/** Supporting line in the body voice with the muted pairing. */
export function EmptyStateDescription({ className, children, ...props }: EmptyStateDescriptionProps) {
  return (
    <p
      {...props}
      className={cx("aug-empty-state-description", "augur-type-body", className)}
    >
      {children}
    </p>
  );
}

export type EmptyStateActionsProps = ComponentProps<"div">;

/**
 * Actions slot. Layout only: one primary Button (the one green signal)
 * and at most a quiet secondary action.
 */
export function EmptyStateActions({ className, ...props }: EmptyStateActionsProps) {
  return <div {...props} className={cx("aug-empty-state-actions", className)} />;
}
