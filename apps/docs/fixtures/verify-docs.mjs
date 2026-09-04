/**
 * Browser verification driver for the docs shell (issue #7).
 *
 * Follows the fixture pattern established by issue #5
 * (`packages/design-system/fixtures/verify-fonts.mjs`): serve the built
 * site statically, drive it in headless Chromium, and assert. Playwright
 * is deliberately NOT a workspace dependency (browser CI lands with
 * issue #15); provide it via a gitignored link:
 *
 *     mkdir -p /tmp/augur-docs-verify && cd /tmp/augur-docs-verify
 *     bun init -y >/dev/null && bun add playwright@1.61.1
 *     ln -s /tmp/augur-docs-verify/node_modules \
 *           <repo>/apps/docs/fixtures/node_modules
 *
 * Usage (from the repository root, after building apps/docs):
 *
 *     bun apps/docs/fixtures/verify-docs.mjs                       # base "/"
 *     DOCS_BASE_PATH=/augur-design-system \
 *       bun apps/docs/fixtures/verify-docs.mjs                     # subpath build
 *
 * The script stages `apps/docs/dist` under the configured base path (as
 * the deployment would), then verifies for both base modes:
 *   1. every page loads with no console errors/warnings, no failed
 *      responses, and no third-party requests (fonts are self-hosted);
 *   2. real font loading: `document.fonts.check()` for Sora 400/600 and
 *      Schibsted Grotesk 400, faces registered, and computed font-family
 *      on body (secondary voice) and h1 (primary voice);
 *   3. the theme contract: default follows system (no data-theme), the
 *      toggle pins dark/light on <html>, persists across reload, and
 *      System removes the attribute again — driven via the keyboard;
 *   4. keyboard navigation: skip link is first, header controls are
 *      reachable and operable by Enter;
 *   5. mobile layout (375px): nav collapses into the details disclosure,
 *      opens via keyboard, links navigate, no horizontal overflow;
 *   6. real content: MDX-evaluated package data and the scoped
 *      `[data-theme]` demonstration render as built;
 *   7. Markdown actions (issue #9): `Copy page` fetches the page's clean
 *      `.md` endpoint and puts EXACTLY those bytes on the clipboard
 *      (compared byte-for-byte), reports "Copied" through its live
 *      region, works via keyboard, and `View as Markdown` links the
 *      direct `.md` representation — which serves the same content.
 *
 * Exit code 0 = all assertions passed; 1 = at least one failed.
 * Screenshots are written to /tmp/augur-docs-verify/ as visual evidence.
 */
import { createServer } from "node:http";
import { cp, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const distDir = join(repoRoot, "apps", "docs", "dist");
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
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// --- Stage the dist output under the deployment base path. -------------
let serveRoot;
if (base === "/") {
  serveRoot = distDir;
} else {
  serveRoot = await mkdtemp(join(tmpdir(), "augur-docs-stage-"));
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

const { chromium } = await import("playwright");
const browser = await chromium.launch();

// --- Assertion helpers ---------------------------------------------------
const failures = [];
const ok = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(label);
};

/** Wait until the ThemeToggle island has hydrated (astro-island upgraded). */
async function waitForIsland(page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("astro-island");
      return !!el && typeof el.hydrate === "function";
    },
    null,
    { timeout: 10_000 },
  );
}

async function auditPage(url, { expectTitleFragment } = {}) {
  const page = await browser.newPage();
  const consoleIssues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") consoleIssues.push(`${msg.type()}: ${msg.text()}`);
  });
  const failedResponses = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failedResponses.push(`${res.status()} ${res.url()}`);
  });
  const externalRequests = [];
  page.on("request", (req) => {
    if (!req.url().startsWith(origin)) externalRequests.push(req.url());
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Explicitly load each delivered face before checking: an unused face
  // stays "unloaded" in the FontFaceSet, so fonts.check alone would only
  // pass on pages that happen to use every weight. fonts.load both proves
  // the @font-face rules are registered and actually fetches the files.
  const loadedFaces = await page.evaluate(async () => ({
    sora400: (await document.fonts.load("16px Sora")).length,
    sora600: (await document.fonts.load("600 40px Sora")).length,
    schibsted400: (await document.fonts.load("16px 'Schibsted Grotesk'")).length,
  }));
  const evidence = await page.evaluate(() => {
    const visible = (el) => el.offsetParent !== null;
    return {
      title: document.title,
      hasSkipLink: !!document.querySelector("a.skip-link"),
      navLinks: [...document.querySelectorAll("nav[aria-label='Primary'] a")]
        .filter(visible)
        .map((a) => a.textContent.trim()),
      ariaCurrent: [...document.querySelectorAll("nav a[aria-current='page']")]
        .filter(visible)
        .map((a) => a.textContent.trim()),
      fontsStatus: document.fonts.status,
      faceCount: document.fonts.size,
      checks: {
        sora400: document.fonts.check("16px Sora"),
        sora600: document.fonts.check("600 40px Sora"),
        schibsted400: document.fonts.check("16px 'Schibsted Grotesk'"),
      },
      bodyFamily: getComputedStyle(document.body).fontFamily,
      h1Family: getComputedStyle(document.querySelector("h1")).fontFamily,
      h1FontSize: getComputedStyle(document.querySelector("h1")).fontSize,
      htmlDataTheme: document.documentElement.dataset.theme ?? null,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  ok(`${url} no console errors/warnings`, consoleIssues.length === 0, consoleIssues.join("; ") || "clean");
  ok(`${url} no failed (>=400) responses`, failedResponses.length === 0, failedResponses.join("; ") || "clean");
  ok(`${url} no third-party requests`, externalRequests.length === 0, externalRequests.join("; ") || "clean");
  if (expectTitleFragment) {
    ok(`${url} title`, evidence.title.includes(expectTitleFragment), evidence.title);
  }
  ok(`${url} skip link present`, evidence.hasSkipLink);
  ok(`${url} exactly one visible primary nav with 6 links`, evidence.navLinks.length === 6, evidence.navLinks.join(", "));
  ok(`${url} fonts registered (>=6 faces)`, evidence.faceCount >= 6, `size ${evidence.faceCount}`);
  ok(`${url} fonts.load Sora 400 resolves a face`, loadedFaces.sora400 >= 1, String(loadedFaces.sora400));
  ok(`${url} fonts.load Sora 600 resolves a face`, loadedFaces.sora600 >= 1, String(loadedFaces.sora600));
  ok(`${url} fonts.load Schibsted Grotesk 400 resolves a face`, loadedFaces.schibsted400 >= 1, String(loadedFaces.schibsted400));
  ok(`${url} fonts.check Sora 400`, evidence.checks.sora400 === true);
  ok(`${url} fonts.check Sora 600`, evidence.checks.sora600 === true);
  ok(`${url} fonts.check Schibsted Grotesk 400`, evidence.checks.schibsted400 === true);
  ok(`${url} body uses Schibsted Grotesk (secondary voice)`, evidence.bodyFamily.includes("Schibsted Grotesk"), evidence.bodyFamily);
  ok(`${url} h1 uses Sora (primary voice)`, evidence.h1Family.includes("Sora"), `${evidence.h1Family} @ ${evidence.h1FontSize}`);
  await page.close();
  return evidence;
}

// --- 1. Every page: transport, fonts, shell structure. -------------------
console.log(`\n== Page audits (base ${base}) ==`);
await auditPage(origin + site("/"), { expectTitleFragment: "Augur Design System" });
await auditPage(origin + site("/getting-started"), { expectTitleFragment: "Getting started" });
await auditPage(origin + site("/foundations/decisions"), { expectTitleFragment: "Foundation decisions" });
await auditPage(origin + site("/foundations/fonts"), { expectTitleFragment: "Fonts and typography" });
const theming = await auditPage(origin + site("/foundations/theming"), { expectTitleFragment: "Theming" });
await auditPage(origin + site("/reference/package-entries"), { expectTitleFragment: "Package entries" });

ok(
  "getting-started renders MDX-evaluated package data",
  (await readFile(join(distDir, "getting-started/index.html"), "utf8")).includes("<strong>2 font families</strong>"),
);
ok(
  "theming page exposes scoped [data-theme=dark] demo",
  (await readFile(join(distDir, "foundations/theming/index.html"), "utf8")).includes('data-theme="dark"'),
);
ok("theming page nav marks current page", theming.ariaCurrent.includes("Theming"), theming.ariaCurrent.join(", "));

// --- 2. Theme contract behavior via keyboard. ----------------------------
console.log("\n== Theme contract (keyboard-driven, home page) ==");
{
  const page = await browser.newPage();
  await page.goto(origin + site("/"), { waitUntil: "networkidle" });
  await waitForIsland(page);
  await page.evaluate(() => document.fonts.ready);
  const snapshot = () =>
    page.evaluate(() => ({
      attr: document.documentElement.dataset.theme ?? null,
      stored: localStorage.getItem("augur-theme"),
      backgroundVar: getComputedStyle(document.documentElement).getPropertyValue("--background").trim(),
      colorScheme: getComputedStyle(document.documentElement).getPropertyValue("color-scheme").trim(),
      pressed: [...document.querySelectorAll(".theme-toggle button")]
        .map((b) => `${b.textContent}:${b.getAttribute("aria-pressed")}`)
        .join(" "),
    }));

  const initial = await snapshot();
  ok("default follows system: no data-theme attribute", initial.attr === null, String(initial.attr));
  ok("default: nothing persisted", initial.stored === null, String(initial.stored));
  ok("default theme toggle shows System active", /System:true/.test(initial.pressed), initial.pressed);

  // Keyboard: Tab lands on the skip link first.
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => document.activeElement.className);
  ok("first Tab focuses the skip link", String(firstFocus).includes("skip-link"), String(firstFocus));

  // Reach the Dark option in the toggle via keyboard and activate with Enter.
  const darkButton = page.getByRole("button", { name: "Dark" });
  await darkButton.focus();
  ok("toggle button keyboard-focusable", await darkButton.evaluate((el) => document.activeElement === el));
  await page.keyboard.press("Enter");
  const afterDark = await snapshot();
  ok("keyboard Enter pins dark on <html>", afterDark.attr === "dark", String(afterDark.attr));
  ok("dark choice persisted", afterDark.stored === "dark", String(afterDark.stored));
  ok("dark swaps the --background role", afterDark.backgroundVar !== initial.backgroundVar, `${initial.backgroundVar} -> ${afterDark.backgroundVar}`);
  ok("dark sets color-scheme: dark", afterDark.colorScheme === "dark", afterDark.colorScheme);
  ok("aria-pressed moves to Dark", /Dark:true/.test(afterDark.pressed) && !/System:true/.test(afterDark.pressed), afterDark.pressed);
  await page.screenshot({ path: "/tmp/augur-docs-verify/home-dark.png" });

  // Persistence across reload.
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const afterReload = await page.evaluate(() => document.documentElement.dataset.theme ?? null);
  ok("dark persists across reload (pre-paint script)", afterReload === "dark", String(afterReload));

  // Light pin, then System reset.
  await page.getByRole("button", { name: "Light" }).click();
  const afterLight = await snapshot();
  ok("light pins [data-theme=light]", afterLight.attr === "light", String(afterLight.attr));
  await page.getByRole("button", { name: "System" }).click();
  const afterSystem = await snapshot();
  ok("system removes the attribute (contract default)", afterSystem.attr === null, String(afterSystem.attr));
  ok("system clears persistence", afterSystem.stored === null, String(afterSystem.stored));
  await page.screenshot({ path: "/tmp/augur-docs-verify/home-light.png" });
  await page.close();
}

// --- 3. Mobile layout (375px). --------------------------------------------
console.log("\n== Mobile layout (375x812) ==");
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(origin + site("/"), { waitUntil: "networkidle" });
  await waitForIsland(page);
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    desktopNavVisible: getComputedStyle(document.querySelector(".site-nav")).display !== "none",
    disclosureVisible: getComputedStyle(document.querySelector(".mobile-nav summary")).display !== "none",
    disclosureOpen: document.querySelector(".mobile-nav").open,
  }));
  ok("no horizontal overflow at 375px", mobile.overflow === false);
  ok("desktop nav hidden on mobile", mobile.desktopNavVisible === false);
  ok("menu disclosure visible on mobile", mobile.disclosureVisible === true);
  ok("menu closed by default", mobile.disclosureOpen === false);

  // Open the disclosure via keyboard and check its links.
  await page.keyboard.press("Tab"); // skip link
  const summary = page.locator(".mobile-nav summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  const opened = await page.evaluate(() => ({
    open: document.querySelector(".mobile-nav").open,
    visibleLinks: [...document.querySelectorAll(".mobile-nav nav a")].filter((a) => a.offsetParent !== null).length,
  }));
  ok("disclosure opens via keyboard", opened.open === true);
  ok("all 6 links visible when open", opened.visibleLinks === 6, String(opened.visibleLinks));
  await page.screenshot({ path: "/tmp/augur-docs-verify/home-mobile-menu-open.png" });

  // Navigate through the disclosure to the decisions page.
  await page.locator(".mobile-nav nav").getByRole("link", { name: "Foundation decisions" }).click();
  await page.waitForLoadState("networkidle");
  const decisionH1 = await page.evaluate(() => document.querySelector("h1")?.textContent.trim());
  ok("mobile nav link navigates", String(decisionH1).startsWith("Foundation decisions"), String(decisionH1));
  await page.close();
}

// --- 4. Theming page demo. -------------------------------------------------
console.log("\n== Theming page demo ==");
{
  const page = await browser.newPage();
  await page.goto(origin + site("/foundations/theming"), { waitUntil: "networkidle" });
  const demo = await page.evaluate(() => {
    const panel = document.querySelector(".theme-demo-panel");
    const scoped = document.querySelector('.theme-demo-panel[data-theme="dark"]');
    return {
      panelCount: document.querySelectorAll(".theme-demo-panel").length,
      scopedPresent: !!scoped,
      panelBg: panel ? getComputedStyle(panel).backgroundColor : null,
      scopedBg: scoped ? getComputedStyle(scoped).backgroundColor : null,
      swatches: document.querySelectorAll(".theme-swatch").length,
    };
  });
  ok("demo renders 2 panels", demo.panelCount === 2, String(demo.panelCount));
  ok("scoped dark panel present", demo.scopedPresent === true);
  ok("scoped dark panel paints differently from the page panel", demo.panelBg !== demo.scopedBg, `${demo.panelBg} vs ${demo.scopedBg}`);
  ok("12 role swatches render", demo.swatches === 12, String(demo.swatches));
  await page.screenshot({ path: "/tmp/augur-docs-verify/theming-light.png", fullPage: true });
  await page.close();
}

// --- 5. Copy page / View as Markdown (issue #9). ---------------------------
console.log("\n== Copy page / View as Markdown (issue #9) ==");
{
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  const page = await context.newPage();
  const consoleIssues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") consoleIssues.push(`${msg.type()}: ${msg.text()}`);
  });

  for (const route of [site("/foundations/fonts"), site("/getting-started")]) {
    await page.goto(origin + route, { waitUntil: "networkidle" });

    // View as Markdown links the direct .md representation; fetching it
    // yields the same document the copy action will put on the clipboard.
    const viewHref = await page.getAttribute("a.page-action", "href");
    ok(`${route} View as Markdown links the .md representation`, typeof viewHref === "string" && viewHref.endsWith(".md"), String(viewHref));
    const response = await fetch(origin + viewHref);
    const expected = await response.text();
    ok(`${route} .md representation is served and starts with the H1`, response.status === 200 && expected.startsWith("# "), `${response.status}, ${expected.length} chars`);

    // Copy page via keyboard, then compare the clipboard byte-for-byte.
    const copyButton = page.getByRole("button", { name: "Copy page" });
    await copyButton.focus();
    await page.keyboard.press("Enter");
    let copied = true;
    try {
      await page.waitForFunction(
        () => document.querySelector("[data-copy-status]")?.textContent === "Copied",
        null,
        { timeout: 5_000 },
      );
    } catch {
      copied = false;
    }
    ok(`${route} Copy page reports Copied (keyboard-operated)`, copied);
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    ok(`${route} clipboard equals the clean Markdown byte-for-byte`, clipboard === expected, `${clipboard.length} vs ${expected.length} chars`);
  }

  ok("copy/view pages produce no console errors/warnings", consoleIssues.length === 0, consoleIssues.join("; ") || "clean");
  await context.close();
}

await browser.close();
server.close();
if (serveRoot !== distDir) {
  await rm(serveRoot, { recursive: true, force: true });
}

console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} assertion(s) failed`);
  process.exit(1);
}
console.log("docs shell verification passed");
