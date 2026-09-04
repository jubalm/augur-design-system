/**
 * GENERATED FILE — do not edit. Regenerate: `bun run registry:generate` in packages/design-system.
 * Verify: `bun run registry:check`. Policy: packages/design-system/docs/registry-generation.md.
 *
 * The `utils` registry item payload (contract: docs/registry-contract.md §7).
 * Upstream-compatible `cn()` signature plus the package's `cx()` alias used
 * by every Augur component source.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Augur alias: class joiner used by component sources. */
export const cx = cn;
