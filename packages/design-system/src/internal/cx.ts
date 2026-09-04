/**
 * Minimal class-name joiner (internal — not public API).
 *
 * The package keeps runtime dependencies at the font packages only, so
 * components compose class strings with this helper instead of pulling
 * in `clsx`/`tailwind-merge`. The consumer-side `cn()`/`utils` item is
 * the registry distribution path's concern (issue #16), not this
 * package's.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
