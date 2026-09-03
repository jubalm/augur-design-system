/**
 * Semantic theme tests for @augur/design-system (issue #4).
 *
 * Run with the built-in runner from the package directory:
 *
 *   cd packages/design-system && bun test
 *
 * These tests are structural (no browser): they parse the shipped CSS and
 * the package manifest as a consumer would resolve them, and prove the
 * four behaviors the issue requires:
 *
 *   1. Generated-token integrity — the theme layer sits on verified
 *      generated output (manifest hash) and references only variables the
 *      generator actually emits ("missing references" check).
 *   2. Theme switching — light, explicit dark, and system-preference dark
 *      scopes all define the identical shadcn-compatible role set with the
 *      required Deep-light / Green-dark primary actions.
 *   3. CSS output — the emitted foreground/background pairs meet WCAG AA
 *      (the pairings DESIGN.md records must reproduce exactly; new
 *      pairings pass the AA thresholds), and no FD-01…FD-05 token
 *      families (spacing/radius/sizing/motion) or raw color literals are
 *      emitted.
 *   4. Package-level style consumption — resolving the package's
 *      `./styles.css` export and walking its `@import` graph (including
 *      bare `@fontsource` specifiers through real module resolution)
 *      terminates and reaches every aggregate.
 */
import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const pkgRoot = resolve(import.meta.dir, "..");
const read = (rel: string): string => readFileSync(resolve(pkgRoot, rel), "utf8");

/* ------------------------------------------------------------------ */
/* Minimal CSS parsing helpers (dependency-free).                      */
/* ------------------------------------------------------------------ */

interface Block {
  selector: string;
  media: string | null;
  /** Custom-property declarations keyed by their full CSS name (--x). */
  declarations: Record<string, string>;
}

/** Strip comments so literal checks and parsing see only real CSS. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Flatten CSS into (selector, media, declarations) records. */
function parseBlocks(css: string): Block[] {
  const src = stripComments(css);
  const blocks: Block[] = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open === -1) break;
    const prelude = src.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
      j++;
    }
    const body = src.slice(open + 1, j - 1);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      for (const nested of parseBlocks(body)) {
        blocks.push({
          selector: nested.selector,
          media: nested.media ? `${prelude} and ${nested.media}` : prelude,
          declarations: nested.declarations,
        });
      }
    } else if (!prelude.startsWith("@")) {
      const declarations: Record<string, string> = {};
      for (const decl of body.split(";")) {
        const idx = decl.indexOf(":");
        if (idx === -1) continue;
        declarations[decl.slice(0, idx).trim()] = decl.slice(idx + 1).trim();
      }
      blocks.push({ selector: prelude, media: null, declarations });
    }
    i = j;
  }
  return blocks;
}

function findBlock(blocks: Block[], selector: string, mediaIncludes?: string): Block {
  const matches = blocks.filter(
    (b) =>
      b.selector === selector &&
      (mediaIncludes === undefined || (b.media ?? "").includes(mediaIncludes)),
  );
  if (matches.length === 0) {
    throw new Error(
      `no block for selector ${selector}` +
        (mediaIncludes ? ` within media containing "${mediaIncludes}"` : ""),
    );
  }
  return matches[0];
}

/** Every var(--x) referenced anywhere in the CSS text. */
function referencedVars(css: string): Set<string> {
  const refs = new Set<string>();
  for (const m of stripComments(css).matchAll(/var\(\s*(--[\w-]+)/g)) {
    refs.add(m[1]);
  }
  return refs;
}

/** All custom property definitions across the given CSS texts. */
function definedVars(...cssTexts: string[]): Set<string> {
  const defs = new Set<string>();
  for (const css of cssTexts) {
    for (const m of stripComments(css).matchAll(/(--[\w-]+)\s*:/g)) {
      defs.add(m[1]);
    }
  }
  return defs;
}

/* ------------------------------------------------------------------ */
/* WCAG 2.x contrast (same formula as the foundation decision audit).  */
/* ------------------------------------------------------------------ */

function luminance(hex: string): number {
  const raw = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = Number.parseInt(raw.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* ------------------------------------------------------------------ */
/* Fixtures under test.                                                */
/* ------------------------------------------------------------------ */

const themeCss = read("src/styles/theme.css");
const tokensCss = read("src/tokens/tokens.css");
const fontsCss = read("src/styles/fonts.css");
const typographyCss = read("src/styles/typography.css");
const stylesCss = read("src/styles/styles.css");
const packageJson = JSON.parse(read("package.json")) as {
  exports: Record<string, string>;
};

const themeBlocks = parseBlocks(themeCss);

/** Generated color values, keyed by full --augur-color-* name. */
const generatedColors: Record<string, string> = {
  ...findBlock(parseBlocks(tokensCss), ":root").declarations,
};

/** The shadcn-compatible semantic role set every theme scope must define. */
const SEMANTIC_ROLES = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
] as const;

/** Foreground/background text pairs emitted per theme. `documented` names
 * a pairing whose ratio DESIGN.md (or its audited record) states; those
 * must reproduce exactly. */
const TEXT_PAIRS: Record<
  "light" | "dark",
  Array<{ fg: string; bg: string; documented?: string }>
> = {
  light: [
    { fg: "--foreground", bg: "--background", documented: "Navy on Paper 17.49 (page-canvas-light)" },
    { fg: "--card-foreground", bg: "--card" },
    { fg: "--popover-foreground", bg: "--popover" },
    { fg: "--primary-foreground", bg: "--primary", documented: "White on Deep 7.80 (action-primary-light)" },
    { fg: "--secondary-foreground", bg: "--secondary", documented: "Navy on Muted 16.17 (muted-region-light)" },
    { fg: "--muted-foreground", bg: "--muted" },
    { fg: "--accent-foreground", bg: "--accent", documented: "Navy on Muted 16.17 (muted-region-light)" },
    { fg: "--destructive-foreground", bg: "--destructive" },
  ],
  dark: [
    { fg: "--foreground", bg: "--background", documented: "Paper on Navy 17.49 (page-canvas-dark)" },
    { fg: "--card-foreground", bg: "--card" },
    { fg: "--popover-foreground", bg: "--popover", documented: "Paper on Surface 2 15.19 (panel-dark)" },
    { fg: "--primary-foreground", bg: "--primary", documented: "Navy on Green 11.87 (action-primary-dark)" },
    { fg: "--secondary-foreground", bg: "--secondary", documented: "Paper on Surface 2 15.19 (panel-dark)" },
    { fg: "--muted-foreground", bg: "--muted" },
    { fg: "--accent-foreground", bg: "--accent", documented: "Paper on Surface 2 15.19 (panel-dark)" },
    { fg: "--destructive-foreground", bg: "--destructive", documented: "Pewter on Navy 7.53 (reversed pair)" },
  ],
};

/** Surfaces the focus ring may paint over, in each theme. */
const RING_SURFACES = [
  "--background",
  "--card",
  "--popover",
  "--secondary",
  "--accent",
  "--muted",
] as const;

interface ThemeScope {
  label: string;
  block: Block;
}

/** Resolve a semantic role in a scope to its generated hex value by
 * following its single `var(--augur-color-*)` reference. */
function resolveRole(scope: ThemeScope, role: string): string {
  const value = scope.block.declarations[role];
  if (value === undefined) throw new Error(`role ${role} missing in ${scope.label}`);
  const m = value.match(/^var\(\s*(--augur-color-[\w-]+)\s*\)$/);
  if (!m) {
    throw new Error(
      `role ${role} in ${scope.label} is not a direct generated-token reference: ${value}`,
    );
  }
  const hex = generatedColors[m[1]];
  if (!hex) throw new Error(`unresolvable reference ${m[1]}`);
  return hex;
}

function scopeFor(label: string): ThemeScope {
  switch (label) {
    case "light":
      return { label, block: findBlock(themeBlocks, ":root") };
    case "dark-explicit":
      return { label, block: findBlock(themeBlocks, '[data-theme="dark"]') };
    case "dark-system":
      return {
        label,
        block: findBlock(
          themeBlocks,
          ':root:not([data-theme="light"])',
          "prefers-color-scheme: dark",
        ),
      };
    default:
      throw new Error(`unknown scope ${label}`);
  }
}

const light = scopeFor("light");
const darkExplicit = scopeFor("dark-explicit");
const darkSystem = scopeFor("dark-system");

/* ------------------------------------------------------------------ */

describe("generated token integrity (issue #3 output)", () => {
  test("generated artifacts are byte-identical to the recorded manifest hashes", () => {
    const manifest = JSON.parse(read("src/tokens/manifest.json")) as {
      artifacts: Array<{ file: string; sha256: string }>;
    };
    for (const artifact of manifest.artifacts) {
      const actual = createHash("sha256")
        .update(read(`src/tokens/${artifact.file}`))
        .digest("hex");
      expect(actual).toBe(artifact.sha256);
    }
  });

  test("the generator emits the 15 color primitives the theme maps from", () => {
    const names = Object.keys(generatedColors);
    expect(names.length).toBe(15);
    for (const name of names) {
      expect(name.startsWith("--augur-color-")).toBe(true);
      expect(generatedColors[name]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("missing references", () => {
  test("every var() in theme.css resolves to a defined custom property", () => {
    const defined = definedVars(tokensCss, fontsCss, typographyCss, themeCss);
    const missing = [...referencedVars(themeCss)].filter((v) => !defined.has(v));
    expect(missing).toEqual([]);
  });

  test("every generated token referenced by theme.css exists in tokens.css", () => {
    const referenced = [...referencedVars(themeCss)].filter((v) =>
      v.startsWith("--augur-color-"),
    );
    expect(referenced.length).toBeGreaterThan(0);
    for (const ref of referenced) {
      expect(generatedColors[ref]).toBeDefined();
    }
  });

  test("typography roles reference font families that fonts.css defines", () => {
    const defined = definedVars(fontsCss);
    for (const ref of referencedVars(typographyCss)) {
      expect(defined.has(ref)).toBe(true);
    }
  });
});

describe("no duplicate raw values", () => {
  test("theme.css contains no raw color literals", () => {
    const body = stripComments(themeCss);
    expect(body).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(body).not.toMatch(/\brgba?\(/);
    expect(body).not.toMatch(/\bhsla?\(/);
  });

  test("no proposed-foundation token families are emitted (FD-01/02/03/05)", () => {
    const body = stripComments(themeCss) + stripComments(stylesCss);
    expect(body).not.toMatch(
      /--augur-(space|radius|size|sizing|motion|duration|easing)[\w-]*\s*:/,
    );
  });
});

describe("theme switching", () => {
  test("light, explicit dark, and system-preference dark scopes exist", () => {
    expect(light.block).toBeDefined();
    expect(darkExplicit.block).toBeDefined();
    expect(darkSystem.block.media).toContain("prefers-color-scheme: dark");
  });

  test("all three scopes declare the identical shadcn-compatible role set", () => {
    const expected = [...SEMANTIC_ROLES].sort();
    for (const scope of [light, darkExplicit, darkSystem]) {
      const keys = Object.keys(scope.block.declarations)
        .filter((k) => k.startsWith("--"))
        .sort();
      expect(keys).toEqual(expected);
    }
  });

  test("color-scheme follows the selection (light default, dark opt-in)", () => {
    expect(light.block.declarations["color-scheme"]).toBe("light");
    expect(darkExplicit.block.declarations["color-scheme"]).toBe("dark");
    expect(darkSystem.block.declarations["color-scheme"]).toBe("dark");
  });

  test("light primary actions use Deep; dark primary actions use Green", () => {
    expect(light.block.declarations["--primary"]).toBe("var(--augur-color-accent-deep)");
    expect(darkExplicit.block.declarations["--primary"]).toBe("var(--augur-color-accent)");
    expect(darkSystem.block.declarations["--primary"]).toBe("var(--augur-color-accent)");
  });

  test("primary-foreground pairs with the action pairing in each theme", () => {
    expect(light.block.declarations["--primary-foreground"]).toBe(
      "var(--augur-color-surface-light-raised)",
    );
    expect(darkExplicit.block.declarations["--primary-foreground"]).toBe(
      "var(--augur-color-primary)",
    );
    expect(darkSystem.block.declarations["--primary-foreground"]).toBe(
      "var(--augur-color-primary)",
    );
  });

  test("explicit dark and system-preference dark declare identical values", () => {
    expect(darkSystem.block.declarations).toEqual(darkExplicit.block.declarations);
  });

  test("the canvas pairing is applied to body once, theme-independently", () => {
    const bodyBlocks = themeBlocks.filter((b) => b.selector === "body");
    expect(bodyBlocks.length).toBe(1);
    expect(bodyBlocks[0].media).toBeNull();
    expect(bodyBlocks[0].declarations["background-color"]).toBe("var(--background)");
    expect(bodyBlocks[0].declarations["color"]).toBe("var(--foreground)");
  });
});

describe("contrast validation (WCAG 2.x, recomputed from generated values)", () => {
  const themes = [
    { scope: light, pairs: TEXT_PAIRS.light },
    { scope: darkExplicit, pairs: TEXT_PAIRS.dark },
  ] as const;

  test("every role is a direct single-hop generated-token reference", () => {
    for (const { scope } of themes) {
      for (const role of SEMANTIC_ROLES) {
        expect(resolveRole(scope, role)).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  test("all text pairs meet AA for normal text (>= 4.5:1)", () => {
    for (const { scope, pairs } of themes) {
      for (const { fg, bg } of pairs) {
        const ratio = contrast(resolveRole(scope, fg), resolveRole(scope, bg));
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("pairings DESIGN.md documents reproduce its recorded values exactly", () => {
    for (const { scope, pairs } of themes) {
      for (const { fg, bg, documented } of pairs) {
        if (!documented) continue;
        const claimed = Number.parseFloat(documented.match(/\d+\.\d+/)?.[0] ?? "");
        const ratio = contrast(resolveRole(scope, fg), resolveRole(scope, bg));
        expect(Math.abs(ratio - claimed)).toBeLessThan(0.005);
      }
    }
  });

  test("focus ring color holds at least 3:1 on every surface it can paint over", () => {
    for (const { scope } of themes) {
      const ring = resolveRole(scope, "--ring");
      for (const surface of RING_SURFACES) {
        const ratio = contrast(ring, resolveRole(scope, surface));
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("structural behavior shared by both themes", () => {
  test("keyboard-only focus ring: focus-visible rule driven by --ring", () => {
    const focus = themeBlocks.find((b) => b.selector === ":focus-visible");
    expect(focus).toBeDefined();
    expect(focus?.media).toBeNull();
    expect(focus?.declarations["outline"]).toBe("2px solid var(--ring)");
    expect(focus?.declarations["outline-offset"]).toBe("2px");
    // Never paint for pointer focus: no bare :focus rule exists.
    expect(stripComments(themeCss).match(/:focus\b(?!-visible)/)).toBeNull();
  });

  test("reduced motion is a structural media gate over motion properties", () => {
    const gate = themeBlocks.find(
      (b) =>
        b.selector.startsWith("*") &&
        (b.media ?? "").includes("prefers-reduced-motion: reduce"),
    );
    expect(gate).toBeDefined();
    expect(gate?.declarations["transition-duration"]).toBeDefined();
    expect(gate?.declarations["animation-duration"]).toBeDefined();
    expect(gate?.declarations["animation-iteration-count"]?.replace(/\s*!important$/, "")).toBe(
      "1",
    );
    expect(gate?.declarations["scroll-behavior"]?.replace(/\s*!important$/, "")).toBe("auto");
  });
});

describe("package-level style consumption", () => {
  /** Resolve a bare specifier the way a bundler does over a plain
   * filesystem: walk up node_modules roots from the importing file. */
  function resolveBare(spec: string, fromDir: string): string {
    let dir = fromDir;
    for (;;) {
      const candidate = resolve(dir, "node_modules", spec);
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) {
        throw new Error(`bare import ${spec} did not resolve from ${fromDir}`);
      }
      dir = parent;
    }
  }

  function walkImports(entry: string, seen: Set<string> = new Set()): Set<string> {
    if (seen.has(entry)) return seen;
    seen.add(entry);
    const css = stripComments(readFileSync(entry, "utf8"));
    for (const m of css.matchAll(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g)) {
      const spec = m[1];
      if (spec.startsWith(".")) {
        const target = resolve(dirname(entry), spec);
        if (!existsSync(target)) {
          throw new Error(`missing relative import ${spec} from ${entry}`);
        }
        walkImports(target, seen);
      } else {
        walkImports(resolveBare(spec, dirname(entry)), seen);
      }
    }
    return seen;
  }

  test("the package export map exposes ./styles.css as a real file", () => {
    const exported = packageJson.exports["./styles.css"];
    expect(exported).toBe("./src/styles/styles.css");
    expect(existsSync(resolve(pkgRoot, exported))).toBe(true);
  });

  test("the full @import graph of the styles entry resolves, including fonts", () => {
    const entry = resolve(pkgRoot, packageJson.exports["./styles.css"]);
    const reached = walkImports(entry);
    const reachedNames = [...reached].map((p) => p.replace(`${pkgRoot}/`, ""));
    for (const aggregate of [
      "src/styles/theme.css",
      "src/styles/typography.css",
      "src/styles/fonts.css",
      "src/tokens/tokens.css",
    ]) {
      expect(reachedNames).toContain(aggregate);
    }
    expect(reachedNames.some((p) => p.includes("@fontsource/sora/400.css"))).toBe(true);
    expect(reachedNames.some((p) => p.includes("@fontsource/schibsted-grotesk/400.css"))).toBe(true);
  });
});
