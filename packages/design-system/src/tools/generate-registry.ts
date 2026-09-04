/**
 * Registry generator (issue #17).
 *
 * Generates the shadcn source registry for the Augur starter set from
 * canonical sources only (contract: docs/registry-contract.md §3):
 *
 *   - Root `registry.json` at the repository root (index form, D2).
 *   - Per-item registry-item JSON under `public/r/<name>.json`
 *     (built-item form, GitHub-Pages-compatible layout for #19).
 *   - `registry-src/utils.ts` — generated canonical `cn()`/`cx()` helper
 *     for the `utils` registry item (the package keeps runtime deps at
 *     the font packages, so no canonical cn() exists; this file is a
 *     generated artifact with provenance, like tokens.css).
 *
 * Never hand-copies token values: base tokens are parsed from the
 * generated `src/tokens/tokens.css`; semantic role mappings are parsed
 * from `src/styles/theme.css` (and the system-fallback block is asserted
 * identical to the explicit dark block); font voices are derived from
 * `src/styles/fonts.css`; font `@import`s are derived from
 * `src/styles/styles.css`. Structural CSS (focus ring, body canvas,
 * reduced-motion gate, `@custom-variant dark`) is structural — variable
 * references only, no raw values.
 *
 * Component item file content is derived from the canonical component
 * source with documented consumer-shape transforms (contract §5, §7):
 *
 *   1. `import { cx } from ".../internal/cx"` →
 *      `import { cx } from "@/lib/utils"` (the consumer's utils alias;
 *      the generated utils item exports `cx` compatible with `cn`).
 *   2. Cross-item relative imports → alias imports
 *      (`../input/input` → `@/components/ui/input`,
 *       `../page-header/page-header` → `@/components/page-header`).
 *   3. A side-effect `import "./<name>.css"` is prepended to the primary
 *      component file so installed source pulls its own stylesheet.
 *
 * `path` on every file entry still points at the canonical repository
 * source (§5.1); `content` is the derived consumer payload. Index entries
 * reference paths only; the per-item JSON under `public/r` carries the
 * inline content.
 *
 * Usage:
 *   bun src/tools/generate-registry.ts            # write artifacts
 *   bun src/tools/generate-registry.ts --check    # verify drift (exit 1 on diff)
 *
 * Optional: AUGUR_REGISTRY_SHA=<full 40-char sha> stamps `#<sha>` onto
 * every `registryDependencies` address (contract §14). By default no ref
 * is embedded (resolves to the default branch); release flow (#19) pins.
 */

import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const pkgRoot = new URL("../..", import.meta.url).pathname; // packages/design-system
const repoRoot = new URL("../../../../", import.meta.url).pathname; // repository root

function read(rel: string): string {
  return readFileSync(join(pkgRoot, rel), "utf8");
}

// ---------------------------------------------------------------- parsing

/** Parse generated `--augur-color-*` tokens from tokens.css. */
function parseTokens(): Map<string, string> {
  const css = read("src/tokens/tokens.css");
  const map = new Map<string, string>();
  for (const m of css.matchAll(/(--augur-color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    map.set(m[1], m[2].toUpperCase());
  }
  if (map.size === 0) throw new Error("no --augur-color-* tokens found in tokens.css");
  return map;
}

type RoleMap = Record<string, string>;

/** Parse `--role: var(--augur-color-x)` pairs out of one CSS block. */
function parseRoleBlock(css: string, startMarker: string): RoleMap {
  const idx = css.indexOf(startMarker);
  if (idx < 0) throw new Error(`block not found: ${startMarker}`);
  const open = css.indexOf("{", idx);
  let depth = 1;
  let end = open;
  while (depth > 0 && end < css.length - 1) {
    end++;
    if (css[end] === "{") depth++;
    if (css[end] === "}") depth--;
  }
  const body = css.slice(open + 1, end);
  const roles: RoleMap = {};
  for (const m of body.matchAll(/(--[a-z-]+):\s*var\((--augur-color-[a-z0-9-]+)\)/g)) {
    roles[m[1]] = `var(${m[2]})`;
  }
  return roles;
}

/** Parse the theme.css role mappings for light, dark, and the fallback. */
function parseThemeRoles(): { light: RoleMap; dark: RoleMap } {
  const css = read("src/styles/theme.css");
  const light = parseRoleBlock(css, ":root {");
  const dark = parseRoleBlock(css, '[data-theme="dark"] {');
  const fallback = parseRoleBlock(css, ':root:not([data-theme="light"]) {');
  const keys = (r: RoleMap) => Object.keys(r).sort().join(",");
  if (keys(dark) !== keys(light)) throw new Error("dark/light role sets differ");
  if (keys(fallback) !== keys(dark) || JSON.stringify(fallback) !== JSON.stringify(dark)) {
    throw new Error("system-preference fallback block differs from explicit dark block");
  }
  return { light, dark };
}

/** Derive the two voice custom properties from fonts.css. */
function parseFontVoices(): { primary: string; secondary: string } {
  const css = read("src/styles/fonts.css");
  const voice = (name: string): string => {
    const m = css.match(new RegExp(`--augur-font-${name}:\\s*"([^"]+)"`));
    if (!m) throw new Error(`--augur-font-${name} not found in fonts.css`);
    return `"${m[1]}", ui-sans-serif, system-ui, sans-serif`;
  };
  return { primary: voice("primary"), secondary: voice("secondary") };
}

/** Derive the pinned @fontsource @import list from styles.css. */
function parseFontImports(): string[] {
  const imports = [...read("src/styles/styles.css").matchAll(/@import "(@fontsource[^"]+)"/g)].map(
    (m) => m[0],
  );
  if (imports.length === 0) throw new Error("no @fontsource imports found in styles.css");
  return imports;
}

// ------------------------------------------------------------ theme item

const TOKEN_SUBSET = [
  "--augur-color-primary",
  "--augur-color-accent",
  "--augur-color-accent-deep",
  "--augur-color-surface-light",
  "--augur-color-surface-light-raised",
  "--augur-color-surface-light-muted",
  "--augur-color-border-light",
  "--augur-color-secondary",
  "--augur-color-secondary-dark",
  "--augur-color-surface-dark-1",
  "--augur-color-surface-dark-2",
  "--augur-color-surface-dark-mist",
];

const THEME_DOCS =
  'Apply the theme by setting `data-theme="light|dark"` on `<html>` or any container; without an attribute the system preference decides. Do not import @augur/design-system from registry-installed source; this item is self-contained.';

function buildThemeItem(): Record<string, unknown> {
  const tokens = parseTokens();
  const { light, dark } = parseThemeRoles();
  const fonts = parseFontVoices();
  const imports = parseFontImports();

  const rootVars: Record<string, string> = { "color-scheme": "light" };
  for (const t of TOKEN_SUBSET) {
    const v = tokens.get(t);
    if (!v) throw new Error(`token ${t} missing from tokens.css (regenerate tokens)`);
    rootVars[t] = v;
  }
  rootVars["--augur-font-primary"] = fonts.primary;
  rootVars["--augur-font-secondary"] = fonts.secondary;

  const themeVars: Record<string, string> = {
    "--font-sans": "var(--augur-font-primary)",
  };
  for (const role of Object.keys(light).sort()) {
    themeVars[`--color${role.replace(/^--/, "-")}`] = `var(${role})`;
  }

  const css: Record<string, unknown> = {};
  for (const imp of imports) css[imp] = "";
  css[":root"] = rootVars;
  css[".dark"] = { "color-scheme": "dark" };
  css['[data-theme="dark"]'] = { "color-scheme": "dark", ...dark };
  css["@media (prefers-color-scheme: dark)"] = {
    ':root:not([data-theme="light"])': { "color-scheme": "dark", ...dark },
  };
  css["body"] = { "background-color": "var(--background)", color: "var(--foreground)" };
  css[":focus-visible"] = { outline: "2px solid var(--ring)", "outline-offset": "2px" };
  css["@media (prefers-reduced-motion: reduce)"] = {
    "*, *::before, *::after": {
      "animation-duration": "0.01ms !important",
      "animation-iteration-count": "1 !important",
      "transition-duration": "0.01ms !important",
      "scroll-behavior": "auto !important",
    },
  };
  css[
    '@custom-variant dark (&:is([data-theme="dark"], [data-theme="dark"] *, :root:not([data-theme="light"]) *))'
  ] = "";

  return {
    name: "augur-theme",
    type: "registry:theme",
    title: "Augur Theme",
    author: "jubalm",
    description:
      "Augur semantic light/dark theme: generated base tokens, shadcn-compatible role mappings, focus and reduced-motion behavior, and self-hosted Sora + Schibsted Grotesk fonts.",
    dependencies: ["@fontsource/sora@5.3.0", "@fontsource/schibsted-grotesk@5.3.0"],
    cssVars: { theme: themeVars, light, dark },
    css,
    docs: THEME_DOCS,
  };
}

// -------------------------------------------------------- component items

const REPO = "jubalm/augur-design-system";
const sha = process.env.AUGUR_REGISTRY_SHA?.trim() || "";
if (sha && !/^[0-9a-f]{40}$/.test(sha)) {
  throw new Error("AUGUR_REGISTRY_SHA must be a full 40-char SHA");
}
const dep = (name: string) => (sha ? `${REPO}/${name}#${sha}` : `${REPO}/${name}`);
const THEME_DEP = dep("augur-theme");
const UTILS_DEP = dep("utils");

const UTILS_TS = `/**
 * GENERATED FILE — do not edit. Regenerate: \`bun run registry:generate\` in packages/design-system.
 * Verify: \`bun run registry:check\`. Policy: packages/design-system/docs/registry-generation.md.
 *
 * The \`utils\` registry item payload (contract: docs/registry-contract.md §7).
 * Upstream-compatible \`cn()\` signature plus the package's \`cx()\` alias used
 * by every Augur component source.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Augur alias: class joiner used by component sources. */
export const cx = cn;
`;

const ALIAS_REWRITES: Array<[RegExp, string]> = [
  [/from "\.\.\/\.\.\/internal\/cx"/g, 'from "@/lib/utils"'],
  [/from "\.\.\/internal\/cx"/g, 'from "@/lib/utils"'],
  [/from "\.\.\/input\/input"/g, 'from "@/components/ui/input"'],
  [/from "\.\.\/page-header\/page-header"/g, 'from "@/components/page-header"'],
  [/from "\.\.\/button\/button"/g, 'from "@/components/ui/button"'],
  [/from "\.\.\/button\/button-variants"/g, 'from "@/components/ui/button-variants"'],
];

function componentContent(srcRel: string, cssName: string | null): string {
  let content = read(srcRel);
  for (const [re, to] of ALIAS_REWRITES) content = content.replace(re, to);
  if (cssName && !new RegExp(`^import "./${cssName}.css";`, "m").test(content)) {
    // prepend the stylesheet side-effect import after the leading comment block
    const lines = content.split("\n");
    let insertAt = 0;
    if (lines[0]?.startsWith("/*")) {
      while (insertAt < lines.length && !lines[insertAt].includes("*/")) insertAt++;
      insertAt++;
    }
    lines.splice(insertAt, 0, "", `import "./${cssName}.css";`);
    content = lines.join("\n");
  }
  return content;
}

function buildComponentItem(
  name: string,
  type: string,
  targetDir: string,
  files: Array<[srcRel: string, kind: "tsx" | "css"]>,
  extra: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const fileEntries = files.map(([srcRel, kind]) => {
    const base = srcRel.split("/").pop()!;
    const content =
      kind === "tsx"
        ? componentContent(srcRel, base.endsWith(".tsx") ? base.replace(/\.tsx$/, "") : null)
        : read(srcRel);
    return {
      path: `packages/design-system/${srcRel}`,
      type: kind === "css" ? "registry:file" : type,
      target: `${targetDir}/${base}`,
      content,
    };
  });
  return {
    name,
    type,
    title: name
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    author: "jubalm",
    description: `Augur ${name.replace(/-/g, " ")} (registry source distribution; contract docs/registry-contract.md).`,
    registryDependencies:
      name === "empty-state"
        ? [THEME_DEP, UTILS_DEP, dep("button"), dep("page-header")]
        : [THEME_DEP, UTILS_DEP],
    files: fileEntries,
    ...extra,
  };
}

// -------------------------------------------------------------- registry

function buildItems(): Array<Record<string, unknown>> {
  return [
    buildThemeItem(),
    {
      name: "utils",
      type: "registry:lib",
      title: "Utils",
      author: "jubalm",
      description:
        "Augur class-name utilities: upstream-compatible cn() plus the cx() alias used by Augur component source.",
      dependencies: ["clsx@2.1.1", "tailwind-merge@3.3.1"],
      files: [
        {
          path: "packages/design-system/registry-src/utils.ts",
          type: "registry:lib",
          target: "@lib/utils.ts",
          content: UTILS_TS,
        },
      ],
    },
    buildComponentItem("button", "registry:ui", "@ui", [
      ["src/components/button/button.tsx", "tsx"],
      ["src/components/button/button-variants.ts", "tsx"],
      ["src/components/button/button.css", "css"],
    ]),
    buildComponentItem("card", "registry:ui", "@ui", [
      ["src/components/card/card.tsx", "tsx"],
      ["src/components/card/card.css", "css"],
    ]),
    buildComponentItem("input", "registry:ui", "@ui", [
      ["src/components/input/input.tsx", "tsx"],
      ["src/components/input/input.css", "css"],
    ]),
    buildComponentItem("form-field", "registry:ui", "@ui", [
      ["src/components/form-field/form-field.tsx", "tsx"],
      ["src/components/form-field/form-field.css", "css"],
    ]),
    buildComponentItem(
      "dialog",
      "registry:ui",
      "@ui",
      [
        ["src/components/dialog/dialog.tsx", "tsx"],
        ["src/components/dialog/dialog.css", "css"],
      ],
      { dependencies: ["radix-ui@1.6.7"] },
    ),
    buildComponentItem("page-header", "registry:block", "@components", [
      ["src/patterns/page-header/page-header.tsx", "tsx"],
      ["src/patterns/page-header/page-header.css", "css"],
    ]),
    buildComponentItem("empty-state", "registry:block", "@components", [
      ["src/patterns/empty-state/empty-state.tsx", "tsx"],
      ["src/patterns/empty-state/empty-state.css", "css"],
    ]),
  ];
}

function buildRegistry(): Record<string, unknown> {
  const items = buildItems();
  // Index form: drop inline content (index references canonical paths;
  // built per-item JSON carries content). Keep path/type/target.
  const indexItems = items.map((item) => ({
    ...item,
    files: ((item.files as Array<Record<string, unknown>> | undefined) ?? []).map(
      ({ content: _c, ...rest }) => rest,
    ),
  }));
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "augur",
    homepage: "https://github.com/jubalm/augur-design-system",
    items: indexItems,
  };
}

// ----------------------------------------------------- completeness checks

function assertCompleteness() {
  const items = buildItems();
  const names = new Set(items.map((i) => i.name as string));
  let failed = false;
  for (const item of items) {
    // every referenced file exists in the repository (contract §5.1)
    for (const f of (item.files as Array<Record<string, string>>) ?? []) {
      if (f.path.includes("registry-src/")) continue; // generator-written artifact
      if (!existsSync(join(pkgRoot, f.path.replace(/^packages\/design-system\//, "")))) {
        console.error(`item ${item.name}: referenced file missing: ${f.path}`);
        failed = true;
      }
    }
    // every registryDependency resolves inside this registry (contract §6.2)
    for (const d of (item.registryDependencies as string[]) ?? []) {
      const depName = d.startsWith(REPO + "/") ? d.slice(REPO.length + 1).split("#")[0] : d;
      if (!names.has(depName)) {
        console.error(`item ${item.name}: registryDependency '${d}' not in registry`);
        failed = true;
      }
    }
    // npm dependencies are exact-pinned (contract §6.1); no devDependencies (§6.4)
    for (const d of (item.dependencies as string[]) ?? []) {
      if (!d.includes("@") || d.endsWith("@") || d.startsWith("@") && !d.slice(1).includes("@")) {
        console.error(`item ${item.name}: dependency '${d}' is not exact-pinned`);
        failed = true;
      }
    }
    if ((item as Record<string, unknown>).devDependencies) {
      console.error(`item ${item.name}: devDependencies are not used by Augur items (§6.4)`);
      failed = true;
    }
    // every component/pattern item depends on the theme and utils (§7.2, §8)
    if (item.type !== "registry:theme" && item.type !== "registry:lib") {
      const deps = (item.registryDependencies as string[]) ?? [];
      for (const required of ["augur-theme", "utils"]) {
        if (!deps.some((d) => d.includes("/" + required))) {
          console.error(`item ${item.name}: missing required dependency on ${required}`);
          failed = true;
        }
      }
    }
  }
  if (failed) throw new Error("registry completeness checks failed");
}

// --------------------------------------------------------------- writing

const isCheck = process.argv.includes("--check");

function writeOut(path: string, content: string) {
  const abs = join(repoRoot, path);
  if (isCheck) {
    if (!existsSync(abs) || readFileSync(abs, "utf8") !== content) {
      console.error(`registry drift: ${path} differs from generated output`);
      console.error("Run: bun run registry:generate  (in packages/design-system)");
      process.exit(1);
    }
  } else {
    mkdirSync(join(abs, ".."), { recursive: true });
    writeFileSync(abs, content);
    console.log(`wrote ${path}`);
  }
}

assertCompleteness();

const registry = buildRegistry();
const items = buildItems();

writeOut("packages/design-system/registry-src/utils.ts", UTILS_TS);
writeOut("registry.json", JSON.stringify(registry, null, 2) + "\n");
for (const item of items) {
  writeOut(
    `public/r/${item.name}.json`,
    JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item }, null, 2) +
      "\n",
  );
}

if (isCheck) console.log("registry:check passed — no drift");
else console.log(`registry generation complete (${items.length} items)`);
