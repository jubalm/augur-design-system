/**
 * Card (issue #11) — pure composition, no product meaning.
 *
 * shadcn-compatible part set (Card, CardHeader, CardTitle,
 * CardDescription, CardContent, CardFooter) over the theme's card
 * pairing (`--card` / `--card-foreground`). Card carries no record
 * states, no actions, and no product semantics: it groups, and the
 * content inside speaks (DESIGN.md: state is named by labels, never
 * implied by a container). See `./card.css` and the component contract in
 * `docs/components.md`.
 */
import type { ComponentProps } from "react";
import { cx } from "../../internal/cx";

export type CardProps = ComponentProps<"div">;

/** Grouping surface. Renders a plain `div` — no landmark role. */
export function Card({ className, ...props }: CardProps) {
  return <div {...props} className={cx("aug-card", className)} />;
}

export type CardHeaderProps = ComponentProps<"div">;

/** Header block: stacks the title and (optionally) description. */
export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div {...props} className={cx("aug-card-header", className)} />;
}

export type CardTitleProps = ComponentProps<"h3">;

/**
 * Card title: an `h3` (shadcn convention — real heading semantics
 * rather than a styled div). Consumers own the document outline.
 */
export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 {...props} className={cx("aug-card-title", "augur-type-heading-2", className)}>
      {children}
    </h3>
  );
}

export type CardDescriptionProps = ComponentProps<"p">;

/** Supporting text under the title, in the metadata voice. */
export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p {...props} className={cx("aug-card-description", "augur-type-metadata", className)}>
      {children}
    </p>
  );
}

export type CardContentProps = ComponentProps<"div">;

/** Main body block, in the body voice. */
export function CardContent({ className, ...props }: CardContentProps) {
  return <div {...props} className={cx("aug-card-content", "augur-type-body", className)} />;
}

export type CardFooterProps = ComponentProps<"div">;

/** Footer row for actions; children lay out inline. */
export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div {...props} className={cx("aug-card-footer", className)} />;
}
