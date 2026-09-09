/**
 * Button (issue #11) — the first Augur-owned component.
 *
 * shadcn-compatible API, Augur-owned styling: a native `<button>`
 * styled exclusively through the semantic role custom properties
 * delivered by `@augur/design-system/styles.css` (see `./button.css`).
 * React 19 style: a plain function component; `ref` forwards through
 * props (no forwardRef).
 *
 * Contracts (consumer view: docs "Button" page; component contract:
 * `docs/components.md` in this package):
 *
 *   - `type` defaults to "button" — a deliberate deviation from
 *     upstream shadcn, which leaves the browser's "submit" default.
 *     Forms opt into submission explicitly.
 *   - Disabled: native `disabled`, reduced-contrast but present label,
 *     `cursor: not-allowed` (the disabled treatment).
 *   - Loading (`loading`): non-interactive, `aria-busy="true"`, label
 *     kept in the DOM but hidden from eyes and assistive technology so
 *     the button keeps its width; a reduced-motion-safe spinner and a
 *     visually hidden "Loading" status carry the state. The action
 *     color does not change.
 *
 * Keyboard focus needs no CSS here: the theme contract's shared
 * `:focus-visible` rule (2px ring, 2px offset, `--ring` color) applies
 * to every element, including this one.
 */
import type { ComponentProps } from "react";
import type { ButtonSize, ButtonVariant } from "./button-variants";
import { buttonVariants } from "./button-variants";
import { cx } from "../../internal/cx";

export { buttonVariants } from "./button-variants";

export type ButtonProps = ComponentProps<"button"> & {
  /** Visual intent. The default variant is the view's one green signal. */
  variant?: ButtonVariant;
  /** Control size. Default "md". */
  size?: ButtonSize;
  /** Pending state: non-interactive, width-preserving, aria-busy. */
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  disabled = false,
  type,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonVariants({ variant, size }), className)}
    >
      <span className="aug-button-label" aria-hidden={loading || undefined}>
        {children}
      </span>
      {loading ? (
        <span className="aug-button-spinner" aria-hidden="true">
          <svg
            className="aug-button-spinner-icon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="29 12"
            />
          </svg>
        </span>
      ) : null}
      {loading ? <span className="aug-button-visually-hidden">Loading</span> : null}
    </button>
  );
}
