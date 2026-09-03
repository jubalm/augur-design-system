/**
 * Loads the stylesheets delivered by `@augur/design-system` into the jsdom
 * document and exposes their custom-property surface for contract tests.
 *
 * Resolution goes through the package's documented public exports, not raw
 * file paths, so the harness keeps testing the surface consumers receive:
 *
 *   @augur/design-system/styles.css  (aggregator: @fontsource imports plus
 *                                     ./fonts.css and ./typography.css)
 *   packages/design-system/src/tokens/tokens.css
 *     — the generated artifact path documented by the generated-file policy
 *       (`packages/design-system/src/tokens/README.md`); verified for drift
 *       in CI by `tokens:check` (issue #3).
 *
 * Bare-specifier `@import`s (the `@fontsource` files) are skipped: the
 * package documents them as bundle-time imports resolved by Vite/Astro,
 * not by the browser or jsdom. The remaining plain-CSS files are what the
 * unit-level stylesheet contract can honestly assert about.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The repo root (Vitest runs from the root; see vitest.config.ts). */
const repoRoot = process.cwd();

/** Node resolver anchored at the design-system package (see loadPackageStyles). */
const requireFromDesignSystem = createRequire(
  resolve(repoRoot, "packages/design-system/package.json"),
);

/** Resolve a package specifier to a real filesystem path. */
function resolveToPath(specifier: string): string {
  const resolved = requireFromDesignSystem.resolve(specifier);
  return resolved.startsWith("file:") ? fileURLToPath(resolved) : resolved;
}

export interface PackageStyles {
  /** Name of every stylesheet whose text is included in `cssText`. */
  sources: string[];
  /** Concatenated CSS text (the bytes injected into jsdom). */
  cssText: string;
  /** Custom properties declared anywhere in the loaded sheets (`--x:`). */
  declared: Set<string>;
  /** Custom properties referenced anywhere in the loaded sheets (`var(--x)`). */
  referenced: Set<string>;
}

function collectCustomProperties(cssText: string): {
  declared: Set<string>;
  referenced: Set<string>;
} {
  const declared = new Set<string>();
  const referenced = new Set<string>();
  for (const match of cssText.matchAll(/(^|[;{\s])(--[\w-]+)\s*:/g)) {
    declared.add(match[2]);
  }
  for (const match of cssText.matchAll(/var\(\s*(--[\w-]+)/g)) {
    referenced.add(match[1]);
  }
  return { declared, referenced };
}

let cached: PackageStyles | undefined;

/** Load (once) and inject the package stylesheets into `document.head`. */
export function injectPackageStyles(): PackageStyles {
  const styles = loadPackageStyles();
  if (!cached) {
    const element = document.createElement("style");
    element.setAttribute("data-augur-test-styles", "true");
    element.textContent = styles.cssText;
    document.head.append(element);
    cached = styles;
  }
  return cached;
}

/** Load the package stylesheets without touching the jsdom document. */
export function loadPackageStyles(): PackageStyles {
  const stylesPath = resolveToPath("@augur/design-system/styles.css");
  const sources: string[] = [];
  const chunks: string[] = [];

  // The aggregator itself, then its relative (same-package) imports.
  const aggregator = readFileSync(stylesPath, "utf8");
  sources.push("styles.css");
  chunks.push(aggregator);
  for (const match of aggregator.matchAll(/^@import\s+"([^"]+)";/gm)) {
    const specifier = match[1];
    if (specifier.startsWith(".")) {
      const imported = readFileSync(
        resolve(dirname(stylesPath), specifier),
        "utf8",
      );
      sources.push(specifier.replace("./", ""));
      chunks.push(imported);
    }
    // Bare specifiers (@fontsource) are bundle-time imports; skipped.
  }

  // Generated base tokens (issue #3), via the documented artifact path
  // (`packages/design-system/src/tokens/tokens.css`; the directory README
  // documents it, and `tokens:check` in CI verifies it for drift).
  const tokensPath = resolve(
    repoRoot,
    "packages/design-system/src/tokens/tokens.css",
  );
  chunks.push(readFileSync(tokensPath, "utf8"));
  sources.push("tokens.css");

  const cssText = chunks.join("\n");
  const { declared, referenced } = collectCustomProperties(cssText);
  return { sources, cssText, declared, referenced };
}
