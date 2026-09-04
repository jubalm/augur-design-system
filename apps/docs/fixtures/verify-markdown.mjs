/**
 * Clean-Markdown and llms.txt verification driver (issue #9).
 *
 * Follows the fixture pattern of verify-docs.mjs (issue #7): serve the
 * BUILT site under the configured base path and assert. Playwright is
 * deliberately not a workspace dependency (browser CI lands with issue
 * #15); the copy-button behavior itself is verified in headless Chromium
 * by verify-docs.mjs — this driver covers the deterministic surface:
 *
 *   1. Endpoint inventory: exactly the predictable `.md` files exist
 *      (one per substantive page, including the component pages from
 *      #11; patterns has none yet; the
 *      home page is landing chrome and has none) plus `/llms.txt`.
 *   2. Response handling: `.md` served as text/markdown, llms.txt as
 *      text/plain (compare with the astro preview evidence in the PR).
 *   3. Content parity with the rendered page: synthesized H1 == rendered
 *      H1, description lede == meta description, and the H2 outline of
 *      the Markdown equals the H2 outline of the rendered HTML.
 *   4. Clean Markdown invariants: no MDX imports/expressions/component
 *      JSX outside code fences; balanced fences; the authored fenced
 *      code (e.g. the `import "@augur/design-system/styles.css"` sample)
 *      survives verbatim; the MDX-evaluated package value
 *      ("**2 font families**") appears evaluated, not as an expression.
 *   5. Example-source parity: every live-example module under
 *      src/examples/ appears verbatim inside some `.md` code fence.
 *   6. Link resolution: every site-absolute link in every `.md` file and
 *      in llms.txt resolves under the served base; external links are
 *      well-formed https URLs.
 *   7. Action wiring: every substantive page's HTML links its `.md`
 *      representation (View as Markdown) and the home page renders no
 *      actions; llms.txt links exactly the full `.md` inventory.
 *
 * Usage (from the repository root, after building apps/docs):
 *
 *     bun apps/docs/fixtures/verify-markdown.mjs                       # base "/"
 *     DOCS_BASE_PATH=/augur-design-system bun run --cwd apps/docs build
 *     DOCS_BASE_PATH=/augur-design-system bun apps/docs/fixtures/verify-markdown.mjs
 *
 * Exit code 0 = all assertions passed; 1 = at least one failed.
 */
import { createServer } from "node:http";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const fixturesDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(fixturesDir, "..");
const distDir = join(docsRoot, "dist");
const rawBase = process.env.DOCS_BASE_PATH?.trim() || "/";
const base = "/" + rawBase.split("/").filter(Boolean).join("/");
const sitePrefix = base === "/" ? "" : base;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// --- Stage the dist output under the deployment base path. -------------
let serveRoot;
if (base === "/") {
  serveRoot = distDir;
} else {
  serveRoot = await mkdtemp(join(tmpdir(), "augur-docs-md-stage-"));
  await mkdir(join(serveRoot, sitePrefix.slice(1)), { recursive: true });
  await cp(distDir, join(serveRoot, sitePrefix.slice(1)), { recursive: true });
}

const server = createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (path.endsWith("/")) path += "index.html";
    let file = join(serveRoot, path);
    if (!file.startsWith(serveRoot)) throw new Error("traversal");
    try {
      const s = await stat(file);
      if (!s.isFile()) file = join(serveRoot, path, "index.html"); // extensionless directory URL
    } catch {
      file = join(serveRoot, path, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;
const site = (p) => sitePrefix + p;

// --- Helpers -------------------------------------------------------------
const failures = [];
const ok = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(label);
};

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const FENCE = /^(\s*)(`{3,}|~{3,})/;

/** Split a Markdown document into { outside, inside } fence content. */
function splitFences(text) {
  const outside = [];
  const inside = [];
  let fence = null;
  for (const line of text.split("\n")) {
    const match = FENCE.exec(line);
    if (match) {
      fence = fence === null ? match[2] : null;
      continue;
    }
    (fence === null ? outside : inside).push(line);
  }
  return { outside: outside.join("\n"), inside: inside.join("\n"), closed: fence === null };
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

/** Normalize a heading for rendered-vs-Markdown comparison: the rendered
 * HTML shows `code` spans as styled text, so backticks carry no text. */
function normalizeHeading(text) {
  return text.replace(/`/g, "");
}

/** h1/h2 outline and meta description of a built page. */
function htmlOutline(html) {
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0] ?? html;
  const h1 = [...main.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)].map((m) => normalizeHeading(stripTags(m[1])));
  const h2 = [...main.matchAll(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g)].map((m) => normalizeHeading(stripTags(m[1])));
  const metaDescription = decodeEntities(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "");
  const mdLinks = [...main.matchAll(/<a[^>]*class="page-action"[^>]*href="([^"]*)"/g)].map((m) => m[1]);
  return { h1, h2, metaDescription, mdLinks };
}

/** H2 outline of a clean-Markdown page (outside fences). */
function mdH2(text) {
  return splitFences(text)
    .outside.split("\n")
    .map((line) => /^##\s+(.+?)\s*$/.exec(line)?.[1])
    .filter(Boolean);
}

/** Site-absolute and external link targets of a Markdown document (outside fences). */
function mdLinks(text) {
  return [...splitFences(text)
    .outside.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
    .map((m) => m[1]);
}

// --- 1. Inventory ---------------------------------------------------------
const allFiles = await walk(distDir);
const mdFiles = allFiles
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(distDir.length + 1))
  .sort();
const expectedMd = [
  "foundations/decisions.md",
  "foundations/fonts.md",
  "foundations/theming.md",
  "foundations/color.md",
  "foundations/proposals.md",
  "getting-started.md",
  "reference/package-entries.md",
  "reference/contributing.md",
  "reference/component-conventions.md",
  "components/button.md",
  "components/card.md",
];
ok("endpoint inventory matches the substantive pages exactly", JSON.stringify(mdFiles) === JSON.stringify([...expectedMd].sort()), mdFiles.join(", "));
ok("llms.txt exists at the site root", allFiles.some((f) => f === join(distDir, "llms.txt")));

// --- 2/3/4. Per-page response handling, parity, and cleanliness -----------
console.log(`\n== Clean-Markdown pages (base ${base}) ==`);
const mdContents = new Map();
for (const rel of expectedMd) {
  const response = await fetch(origin + site(`/${rel}`));
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  mdContents.set(rel, text);

  ok(`${rel} responds 200 as text/markdown`, response.status === 200 && contentType.includes("text/markdown"), `${response.status} ${contentType}`);
  ok(`${rel} starts with the synthesized H1`, text.startsWith("# "));

  const htmlRel = rel.replace(/\.md$/, "/index.html");
  const html = await readFile(join(distDir, htmlRel), "utf8");
  const outline = htmlOutline(html);
  const mdH1 = /^# (.+)$/m.exec(text)?.[1];
  ok(`${rel} H1 equals the rendered page H1`, mdH1 === outline.h1[0], `${JSON.stringify(mdH1)} vs ${JSON.stringify(outline.h1[0])}`);
  ok(`${rel} lede equals the authored meta description`, text.split("\n").includes(outline.metaDescription));
  ok(`${rel} H2 outline equals the rendered H2 outline`, JSON.stringify(mdH2(text).map(normalizeHeading)) === JSON.stringify(outline.h2), JSON.stringify(mdH2(text)));

  const { outside, closed } = splitFences(text);
  ok(`${rel} code fences are balanced`, closed);
  ok(`${rel} has no MDX imports outside fences`, !/^import\s/m.test(outside));
  ok(`${rel} has no MDX expressions outside fences`, !/\{(?:examples|AUGUR_FONTS)[.\s]/.test(outside));
  ok(`${rel} has no component JSX outside fences`, !/<[A-Z][A-Za-z0-9]*(\s|\/?>)/.test(outside));
}

// --- 4b. Authored-code integrity and evaluated expressions ----------------
const gettingStarted = mdContents.get("getting-started.md");
ok(
  "getting-started.md keeps the authored entry-point fence verbatim",
  gettingStarted.includes("import \"@augur/design-system/styles.css\";") &&
    gettingStarted.includes("@augur/design-system            → public entry module"),
);
ok(
  "getting-started.md shows the package-evaluated value, not the MDX expression",
  gettingStarted.includes("**2 font families**") && !gettingStarted.includes("{AUGUR_FONTS.length}"),
);

// --- 5. Example-source parity ----------------------------------------------
console.log("\n== Live-example source parity ==");
{
  const examplesDir = join(docsRoot, "src", "examples");
  const modules = (await walk(examplesDir)).filter((f) => f.endsWith(".tsx"));
  const allFenceContent = [...mdContents.values()].map((t) => splitFences(t).inside).join("\n");
  for (const module of modules) {
    const source = (await readFile(module, "utf8")).trimEnd();
    const rel = module.slice(docsRoot.length + 1);
    ok(`${rel} source appears verbatim in the Markdown endpoints`, allFenceContent.includes(source), `${source.length} chars`);
  }
}

// --- 6. Link resolution across all .md files -------------------------------
console.log("\n== Markdown link resolution ==");
for (const [rel, text] of mdContents) {
  const links = mdLinks(text);
  let absolute = 0;
  for (const link of links) {
    if (link.startsWith("http://") || link.startsWith("https://")) continue;
    if (link.startsWith("#")) continue;
    if (!link.startsWith("/")) {
      ok(`${rel} uses only site-absolute or external links`, false, link);
      continue;
    }
    absolute += 1;
    // Content links are base-aware site-absolute URLs (the derivation
    // rewrites them through withBase()), so resolve them against the
    // origin exactly like an external Markdown consumer would.
    const target = origin + link;
    const res = await fetch(target);
    if (res.status !== 200) ok(`${rel} link resolves: ${link}`, false, `${res.status} ${target}`);
  }
  ok(`${rel} all ${absolute} internal link(s) resolve under the served base`, true);
}

// --- 7. Action wiring in the rendered pages --------------------------------
console.log("\n== Copy/View action wiring ==");
{
  for (const rel of ["getting-started/index.html", "foundations/decisions/index.html", "foundations/fonts/index.html", "foundations/theming/index.html", "foundations/color/index.html", "foundations/proposals/index.html", "reference/package-entries/index.html", "reference/contributing/index.html", "reference/component-conventions/index.html"]) {
    const html = await readFile(join(distDir, rel), "utf8");
    const { mdLinks: actions } = htmlOutline(html);
    const expectedHref = site(`/${rel.replace(/\/index\.html$/, ".md")}`);
    ok(`${rel} links exactly its .md representation`, actions.length === 1 && actions[0] === expectedHref, actions.join(", ") || "none");
  }
  const home = await readFile(join(distDir, "index.html"), "utf8");
  ok("home page (landing chrome) renders no Markdown actions", !home.includes("page-action"));
}

// --- llms.txt ---------------------------------------------------------------
console.log("\n== llms.txt ==");
{
  const response = await fetch(origin + site("/llms.txt"));
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  ok("llms.txt responds 200 as text/plain", response.status === 200 && contentType.includes("text/plain"), `${response.status} ${contentType}`);
  ok("llms.txt opens with the project H1", text.startsWith("# Augur Design System\n"));
  ok("llms.txt has a summary blockquote", /^> Documentation for the Augur Design System/m.test(text));
  ok("llms.txt explains the .md convention", text.includes("append `.md`"));
  for (const heading of ["## Documentation", "## Foundations", "## Components", "## Patterns", "## Package and API reference", "## Design authority and changes"]) {
    ok(`llms.txt has section ${heading.slice(3)}`, text.includes(`\n${heading}\n`));
  }
  ok(
    "llms.txt lists the published component pages (#11)",
    text.includes("/components/button.md") && text.includes("/components/card.md"),
  );
  ok("llms.txt points at DESIGN.md", text.includes("https://github.com/jubalm/augur-design-system/blob/main/DESIGN.md"));
  ok("llms.txt points at ARCHITECTURE.md", text.includes("https://github.com/jubalm/augur-design-system/blob/main/ARCHITECTURE.md"));
  ok("llms.txt points at CHANGELOG.md for change/migration guidance", text.includes("https://github.com/jubalm/augur-design-system/blob/main/CHANGELOG.md"));

  const links = mdLinks(text);
  const internal = links.filter((l) => l.startsWith("/"));
  const external = links.filter((l) => l.startsWith("https://"));
  ok("llms.txt has no non-https, non-site-absolute links", internal.length + external.length === links.length, links.join(" "));
  let resolved = 0;
  for (const link of internal) {
    const res = await fetch(origin + link); // base-aware, resolved at the origin
    if (res.status !== 200) ok(`llms.txt link resolves: ${link}`, false, `${res.status}`);
    resolved += 1;
  }
  ok(`llms.txt resolves all ${resolved} internal link(s)`, true);
  const linkedMd = [...new Set(internal.filter((l) => l.endsWith(".md")).map((l) => l.slice(sitePrefix.length).replace(/\.md$/, "")))].sort();
  ok("llms.txt links exactly the full .md inventory", JSON.stringify(linkedMd) === JSON.stringify([...expectedMd].map((m) => `/${m.replace(/\.md$/, "")}`).sort()), linkedMd.join(", "));
}

server.close();
if (serveRoot !== distDir) {
  await rm(serveRoot, { recursive: true, force: true });
}

console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} assertion(s) failed`);
  process.exit(1);
}
console.log("clean Markdown / llms.txt verification passed");
