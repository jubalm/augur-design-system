/**
 * Browser verification driver for the docs shell (issue #7).
 *
 * pattern established by issue #5
 * (`packages/design-system/fixtures/verify-fonts.mjs`): serve the built
 * site statically, drive it in headless Chromium, and assert. Playwright
 * is a pinned root devDependency (1.61.1, issue #15); the gitignored
 * `apps/docs/fixtures/node_modules` link from issue #7 also still works.
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
 *   8. Starter component browser coverage (issue #15): the Dialog
 *      island driven in a real browser — keyboard open, focus moves
 *      into the panel and stays contained under Tab/Shift+Tab, Escape
 *      and overlay dismissal close it, body scroll locks while open and
 *      unlocks after, focus is restored to the trigger, and the dark
 *      scoped-portal panel inherits its subtree theme — plus Input
 *      keyboard focus and ARIA wiring, Button focus-visible activation,
 *      pattern-page examples rendering, both themes on the same nodes,
 *      mobile (375px) dialog sizing/scroll, and reduced-motion
 *      transitions collapsing.
 *   9. Specimen rendering repair (issue #44): palette chips paint as
 *      fields with computed dimensions in both themes and at 390px, and
 *      Card/PageHeader computed typography and spacing are identical in
 *      the bare package host (`packages/design-system/fixtures/
 *      bare-hosts.html`, served from the repository root) and inside
 *      the docs prose host — so a prose-selector leak into
 *      `.doc-example-preview` fails the check instead of silently
 *      distorting the specimens.
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

/**
 * Keyboard-open a dialog from a trigger and wait for the panel. Island
 * hydration is asynchronous — `waitForIsland` only proves the hydrate
 * entry point exists, not that React has attached listeners yet — so
 * press Enter again on a short interval until the panel appears.
 */
async function openDialog(page, trigger, timeoutMs = 15_000) {
  await trigger.focus();
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    await page.keyboard.press("Enter");
    try {
      await page.waitForSelector(".aug-dialog-content", { timeout: 500, state: "visible" });
      return;
    } catch {
      if (Date.now() > deadline) throw new Error("dialog panel did not appear within timeout");
    }
  }
}

async function auditPage(url, { expectTitleFragment, expectNavLinks } = {}) {
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
      navLinks: [...document.querySelectorAll("nav[aria-label='Documentation'] a")]
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
  ok(`${url} one visible documentation nav with the expected links`, evidence.navLinks.length === (expectNavLinks ?? 23), evidence.navLinks.join(", "));
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
await auditPage(origin + site("/"), { expectTitleFragment: "Augur Design System", expectNavLinks: 0 });
await auditPage(origin + site("/getting-started"), { expectTitleFragment: "Getting started" });
await auditPage(origin + site("/foundations/decisions"), { expectTitleFragment: "Foundation decisions" });
await auditPage(origin + site("/foundations/fonts"), { expectTitleFragment: "Fonts and typography" });
const theming = await auditPage(origin + site("/foundations/theming"), { expectTitleFragment: "Theming" });
await auditPage(origin + site("/foundations/color"), { expectTitleFragment: "Color system" });
await auditPage(origin + site("/foundations/proposals"), { expectTitleFragment: "Foundation adoption" });
await auditPage(origin + site("/foundations/visual-direction"), { expectTitleFragment: "Visual direction" });
await auditPage(origin + site("/reference/package-entries"), { expectTitleFragment: "Package entries" });
await auditPage(origin + site("/reference/contributing"), { expectTitleFragment: "Contributing" });
await auditPage(origin + site("/reference/component-conventions"), { expectTitleFragment: "Component conventions" });
await auditPage(origin + site("/components/button"), { expectTitleFragment: "Button" });
await auditPage(origin + site("/components/card"), { expectTitleFragment: "Card" });
await auditPage(origin + site("/components/dialog"), { expectTitleFragment: "Dialog" });
await auditPage(origin + site("/components/input"), { expectTitleFragment: "Input" });
await auditPage(origin + site("/patterns/empty-state"), { expectTitleFragment: "EmptyState" });
await auditPage(origin + site("/patterns/form-field"), { expectTitleFragment: "FormField" });
await auditPage(origin + site("/patterns/page-header"), { expectTitleFragment: "PageHeader" });
await auditPage(origin + site("/proposal-review"), { expectTitleFragment: "Proposal review" });

ok(
  "getting-started renders MDX-evaluated package data",
  (await readFile(join(distDir, "getting-started/index.html"), "utf8")).includes("<strong>2 font families</strong>"),
);
ok(
  "theming page exposes pinned light/dark paired records",
  (await readFile(join(distDir, "foundations/theming/index.html"), "utf8")).includes('data-theme="dark"') &&
    (await readFile(join(distDir, "foundations/theming/index.html"), "utf8")).includes('data-theme="light"'),
);

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
        .map((b) => `${b.getAttribute("aria-label") ?? b.textContent}:${b.getAttribute("aria-pressed")}`)
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
  const darkButton = page.locator(".masthead-actions").getByRole("button", { name: "Dark" });
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
  await page.locator(".masthead-actions").getByRole("button", { name: "Light" }).click();
  const afterLight = await snapshot();
  ok("light pins [data-theme=light]", afterLight.attr === "light", String(afterLight.attr));
  await page.locator(".masthead-actions").getByRole("button", { name: "System" }).click();
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
  await page.goto(origin + site("/foundations/fonts"), { waitUntil: "networkidle" });
  await waitForIsland(page);
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    sidebarVisible: getComputedStyle(document.querySelector(".doc-sidebar")).display !== "none",
    disclosureVisible: getComputedStyle(document.querySelector(".browse-docs")).display !== "none",
    disclosureOpen: document.querySelector(".browse-docs").open,
  }));
  ok("no horizontal overflow at 375px", mobile.overflow === false);
  ok("sidebar hidden on mobile", mobile.sidebarVisible === false);
  ok("browse disclosure visible on mobile", mobile.disclosureVisible === true);
  ok("browse closed by default", mobile.disclosureOpen === false);

  // Open the disclosure via keyboard and check its links.
  await page.keyboard.press("Tab"); // skip link
  const summary = page.locator(".browse-docs summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  const opened = await page.evaluate(() => ({
    open: document.querySelector(".browse-docs").open,
    visibleLinks: [...document.querySelectorAll(".browse-panel nav a")].filter((a) => a.offsetParent !== null).length,
  }));
  ok("disclosure opens via keyboard", opened.open === true);
  ok("all 23 links visible when open", opened.visibleLinks === 23, String(opened.visibleLinks));
  await page.screenshot({ path: "/tmp/augur-docs-verify/home-mobile-menu-open.png" });

  // Navigate through the disclosure to the decisions page.
  await page.locator(".browse-panel nav").getByRole("link", { name: "Foundation decisions" }).click();
  await page.waitForLoadState("networkidle");
  const decisionH1 = await page.evaluate(() => document.querySelector("h1")?.textContent.trim());
  ok("mobile nav link navigates", String(decisionH1).startsWith("Foundation decisions"), String(decisionH1));
  await page.close();
}

// --- 4. Theming page demo + paired records (issue #49). -------------------
console.log("\n== Theming page demo (#49 paired records) ==");
{
  const readPair = (page) =>
    page.evaluate(() => {
      const panels = [...document.querySelectorAll(".theme-demo-panel")];
      const rects = panels.map((p) => p.getBoundingClientRect());
      const texts = panels.map((p) => p.textContent.replace(/\s+/g, " ").trim());
      return {
        count: panels.length,
        themes: panels.map((p) => p.dataset.theme ?? null),
        bgs: panels.map((p) => getComputedStyle(p).backgroundColor),
        widths: rects.map((r) => Math.round(r.width)),
        heights: rects.map((r) => Math.round(r.height)),
        swatches: document.querySelectorAll(".theme-swatch").length,
        contentParity: texts[0].replace(/light|dark/g, "X") === texts[1].replace(/light|dark/g, "X"),
      };
    });

  await auditPage(origin + site("/foundations/theming"), { expectTitleFragment: "Theming" });
  const page = await browser.newPage();
  await page.goto(origin + site("/foundations/theming"), { waitUntil: "networkidle" });
  const pairLight = await readPair(page);
  ok("paired records: two pinned panels (light + dark)", pairLight.count === 2 && pairLight.themes[0] === "light" && pairLight.themes[1] === "dark", pairLight.themes.join("/"));
  ok("pair paints differently under light host", pairLight.bgs[0] !== pairLight.bgs[1], pairLight.bgs.join(" vs "));
  ok("pair content/order identical (title aside)", pairLight.contentParity === true);
  ok("pair geometry identical under light host", pairLight.widths[0] === pairLight.widths[1] && Math.abs(pairLight.heights[0] - pairLight.heights[1]) <= 1, `${pairLight.widths.join("x")} / ${pairLight.heights.join("x")}`);
  ok("12 role swatches render across the pair", pairLight.swatches === 12, String(pairLight.swatches));
  await page.screenshot({ path: "/tmp/augur-docs-verify/theming-paired-light.png", fullPage: true });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const pairDark = await readPair(page);
  ok("pair still light+dark under dark host", pairDark.bgs[0] !== pairDark.bgs[1], pairDark.bgs.join(" vs "));
  ok("pair geometry identical under dark host", pairDark.widths[0] === pairDark.widths[1] && Math.abs(pairDark.heights[0] - pairDark.heights[1]) <= 1, `${pairDark.widths.join("x")} / ${pairDark.heights.join("x")}`);
  ok("theming page nav marks current page", theming.ariaCurrent.includes("Theming"), theming.ariaCurrent.join(", "));
  await page.screenshot({ path: "/tmp/augur-docs-verify/theming-paired-dark.png", fullPage: true });
  await page.close();

  // Color page: core palette and companions lead, ladders follow (#49).
  const colorPage = await browser.newPage();
  await colorPage.goto(origin + site("/foundations/color"), { waitUntil: "networkidle" });
  const groupOrder = await colorPage.evaluate(() =>
    [...document.querySelectorAll(".example-palette-group-title")].map((e) => e.textContent.trim()),
  );
  ok(
    "palette order: anchors, companions, then surface ladders",
    JSON.stringify(groupOrder) === JSON.stringify(["Brand anchors", "Companions", "Light surfaces", "Dark surfaces"]),
    groupOrder.join(" | "),
  );
  await colorPage.close();
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

// --- 6. Component slice rendered review (issue #11). ----------------------
console.log("\n== Component slice (Button/Card computed styles, both themes) ==");
{
  const page = await browser.newPage();
  await page.goto(origin + site("/components/button"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const readButtonEvidence = () =>
    page.evaluate(() => {
      const row = (theme) =>
        document.querySelector(theme === "dark" ? ".example-button-row[data-theme='dark']" : ".example-button-row:not([data-theme='dark'])");
      const primary = row("light").querySelector(".aug-button--default");
      const darkPrimary = row("dark").querySelector(".aug-button--default");
      const disabled = document.querySelector(".aug-button:disabled:not([aria-busy])");
      const loading = document.querySelector(".aug-button[aria-busy='true']");
      const cs = getComputedStyle(primary);
      return {
        height: cs.height,
        radius: cs.borderRadius,
        background: cs.backgroundColor,
        darkBackground: getComputedStyle(darkPrimary).backgroundColor,
        primaryToken: cs.getPropertyValue("--primary").trim(),
        font: cs.fontFamily,
        disabledCursor: disabled ? getComputedStyle(disabled).cursor : null,
        disabledOpacity: disabled ? getComputedStyle(disabled).opacity : null,
        loadingBusy: loading ? loading.getAttribute("aria-busy") : null,
        loadingSpinner: loading ? !!loading.querySelector(".aug-button-spinner") : null,
        loadingLabelVisibility: loading
          ? getComputedStyle(loading.querySelector(".aug-button-label")).visibility
          : null,
      };
    });

  const buttonLight = await readButtonEvidence();
  ok("default button height 36px (FD-02 structure)", buttonLight.height === "36px", buttonLight.height);
  ok("default button radius 0px (FD-03 encoded, issue #45/#51)", buttonLight.radius === "0px", buttonLight.radius);
  ok("control typography role applies (Sora)", buttonLight.font.includes("Sora"), buttonLight.font);
  ok(
    "--primary resolves to a generated token (not var())",
    /^#[0-9a-f]{6}$/i.test(buttonLight.primaryToken),
    buttonLight.primaryToken,
  );
  ok("default button paints --primary (light)", buttonLight.background !== "rgba(0, 0, 0, 0)", buttonLight.background);
  ok(
    "dark-scoped row paints a different action color (Deep -> Green with the theme)",
    buttonLight.background !== buttonLight.darkBackground,
    `${buttonLight.background} vs ${buttonLight.darkBackground}`,
  );
  ok("disabled button cursor not-allowed", buttonLight.disabledCursor === "not-allowed", String(buttonLight.disabledCursor));
  ok("disabled button opacity 0.5", buttonLight.disabledOpacity === "0.5", String(buttonLight.disabledOpacity));
  ok("loading button sets aria-busy", buttonLight.loadingBusy === "true", String(buttonLight.loadingBusy));
  ok("loading button renders the spinner", buttonLight.loadingSpinner === true);
  ok("loading button hides its label while keeping width", buttonLight.loadingLabelVisibility === "hidden", String(buttonLight.loadingLabelVisibility));
  await page.screenshot({ path: "/tmp/augur-docs-verify/button-page-light.png", fullPage: true });

  // Pin dark on <html> per the theme contract and re-read the same nodes.
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const buttonDark = await readButtonEvidence();
  ok(
    "pinned dark changes the same button's action color",
    buttonDark.background !== buttonLight.background,
    `${buttonLight.background} -> ${buttonDark.background}`,
  );
  await page.close();

  const cardPage = await browser.newPage();
  await cardPage.goto(origin + site("/components/card"), { waitUntil: "networkidle" });
  await cardPage.evaluate(() => document.fonts.ready);
  const cardLight = await cardPage.evaluate(() => {
    const card = document.querySelector(".example-card-grid > .aug-card:not([data-theme])");
    const darkCard = document.querySelector(".example-card-grid > .aug-card[data-theme='dark']");
    const cs = getComputedStyle(card);
    return {
      radius: cs.borderRadius,
      background: cs.backgroundColor,
      cardToken: cs.getPropertyValue("--card").trim(),
      border: cs.borderTopColor,
      darkBackground: getComputedStyle(darkCard).backgroundColor,
      titleTag: card.querySelector(".aug-card-title")?.tagName ?? null,
    };
  });
  ok("card radius 0px (FD-03 encoded, issue #45/#50)", cardLight.radius === "0px", cardLight.radius);
  ok("card paints the --card role (light)", cardLight.background !== "rgba(0, 0, 0, 0)", cardLight.background);
  ok(
    "--card resolves to a generated token (not var())",
    /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(cardLight.cardToken),
    cardLight.cardToken,
  );
  ok("card border is the --border hairline (not transparent)", cardLight.border !== "rgba(0, 0, 0, 0)", cardLight.border);
  ok(
    "dark-scoped card paints a different surface",
    cardLight.background !== cardLight.darkBackground,
    `${cardLight.background} vs ${cardLight.darkBackground}`,
  );
  ok("card title renders h3", cardLight.titleTag === "H3", String(cardLight.titleTag));
  await cardPage.screenshot({ path: "/tmp/augur-docs-verify/card-page-light.png", fullPage: true });
  await cardPage.close();
}

// --- 7. Starter component browser coverage (issue #15). -------------------
console.log("\n== Starter components in real browsers (issue #15) ==");
{
  // --- Dialog: keyboard open, focus containment, dismissal, scroll lock,
  // focus restoration, and the dark scoped portal.
  const page = await browser.newPage();
  const consoleIssues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") consoleIssues.push(`${msg.type()}: ${msg.text()}`);
  });
  await page.goto(origin + site("/components/dialog"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await waitForIsland(page);

  const panelState = () =>
    page.evaluate(() => {
      const panel = document.querySelector(".aug-dialog-content");
      if (!panel) return { open: false };
      return {
        open: true,
        inBody: document.body.contains(panel),
        overflow: getComputedStyle(document.body).overflow,
        focusInPanel: panel.contains(document.activeElement),
        role: panel.getAttribute("role"),
        labelledby:
          !!panel.getAttribute("aria-labelledby") &&
          !!document.getElementById(panel.getAttribute("aria-labelledby")),
        describedby:
          !!panel.getAttribute("aria-describedby") &&
          !!document.getElementById(panel.getAttribute("aria-describedby")),
        popover: getComputedStyle(panel).getPropertyValue("--popover").trim(),
      };
    });

  // Keyboard: focus the first trigger and press Enter.
  const trigger = page.getByRole("button", { name: "Open dialog", exact: true });
  await openDialog(page, trigger);
  let open = await panelState();
  ok("dialog opens via keyboard Enter", open.open === true);
  ok("open dialog exposes the dialog role", open.role === "dialog", String(open.role));
  ok("dialog is named (aria-labelledby resolves)", open.labelledby === true);
  ok("dialog is described (aria-describedby resolves)", open.describedby === true);
  ok("focus moved into the panel on open", open.focusInPanel === true);
  ok("body scroll is locked while open", open.overflow === "hidden", String(open.overflow));
  await page.screenshot({ path: "/tmp/augur-docs-verify/dialog-open-light.png" });

  // Focus containment: Tab and Shift+Tab cycle inside the panel.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  open = await panelState();
  ok("focus stays contained under Tab/Shift+Tab", open.focusInPanel === true);

  // Escape closes; focus returns to the trigger; scroll unlocks.
  await page.keyboard.press("Escape");
  await page.waitForSelector(".aug-dialog-content", { state: "detached" });
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Open dialog");
  const closed = await page.evaluate(() => ({
    focus: document.activeElement?.textContent?.trim() ?? null,
    overflow: getComputedStyle(document.body).overflow,
  }));
  ok("Escape closes the dialog", !String(closed.focus).includes("Review query"));
  ok("focus is restored to the trigger after Escape", /Open dialog/.test(String(closed.focus)), String(closed.focus));
  ok("body scroll unlocks after close", closed.overflow !== "hidden", String(closed.overflow));

  // Overlay (scrim) dismissal via pointer; focus restored again.
  await openDialog(page, trigger);
  await page.waitForTimeout(400);
  await page.locator(".aug-dialog-overlay").click({ position: { x: 8, y: 8 }, force: true });
  await page.waitForSelector(".aug-dialog-content", { state: "detached" });
  const afterOverlay = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);
  ok("overlay click dismisses the dialog", !String(afterOverlay).includes("Review query"));
  ok("focus restored after overlay dismissal", /Open dialog/.test(String(afterOverlay)), String(afterOverlay));

  // Dark scoped portal: the panel inherits the dark subtree's roles.
  const lightPopover = open.popover;
  const darkTrigger = page.getByRole("button", { name: "Open dialog (dark scope)" });
  await openDialog(page, darkTrigger);
  const darkPanel = await page.evaluate(() => {
    const panel = document.querySelector(".aug-dialog-content");
    const scope = panel?.closest('[data-theme="dark"]');
    return {
      inDarkScope: !!scope,
      popover: getComputedStyle(panel).getPropertyValue("--popover").trim(),
    };
  });
  ok("dark scoped dialog portals into the dark subtree", darkPanel.inDarkScope === true);
  ok(
    "dark scoped panel inherits the dark --popover role",
    darkPanel.popover !== lightPopover,
    `${lightPopover} -> ${darkPanel.popover}`,
  );
  await page.screenshot({ path: "/tmp/augur-docs-verify/dialog-open-dark-scope.png" });
  await page.keyboard.press("Escape");
  await page.waitForSelector(".aug-dialog-content", { state: "detached" });
  ok("dialog island produces no console errors/warnings", consoleIssues.length === 0, consoleIssues.join("; ") || "clean");
  await page.close();

  // Reduced motion: the open transition collapses under the media query.
  const rmContext = await browser.newContext({ reducedMotion: "reduce" });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(origin + site("/components/dialog"), { waitUntil: "networkidle" });
  await waitForIsland(rmPage);
  await openDialog(rmPage, rmPage.getByRole("button", { name: "Open dialog", exact: true }));
  const rmDurations = await rmPage.evaluate(() =>
    [...document.querySelectorAll(".aug-dialog-content, .aug-dialog-overlay")].flatMap((el) =>
      getComputedStyle(el).transitionDuration.split(",").map((v) => parseFloat(v)),
    ),
  );
  ok(
    "reduced motion collapses open/close transitions",
    rmDurations.length > 0 && rmDurations.every((v) => v < 0.01), // collapses to ~0 (observed 0.00001s)
    rmDurations.join(" | "),
  );
  await rmContext.close();

  // Mobile (375px): the long-content panel fits the viewport and scrolls
  // internally; no horizontal overflow.
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(origin + site("/components/dialog"), { waitUntil: "networkidle" });
  await waitForIsland(mobile);
  await openDialog(mobile, mobile.getByRole("button", { name: "Open long-content dialog" }));
  const mobilePanel = await mobile.evaluate(() => {
    const rect = document.querySelector(".aug-dialog-content").getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      viewport: window.innerWidth,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  ok(
    "mobile dialog panel respects the 100vw-16px cap",
    mobilePanel.width <= mobilePanel.viewport - 16,
    `${mobilePanel.width}px @ ${mobilePanel.viewport}px`,
  );
  ok("mobile dialog panel fits the viewport height", mobilePanel.height <= 812, `${mobilePanel.height}px`);
  ok("mobile dialog causes no horizontal overflow", mobilePanel.overflowX === false);
  await mobile.screenshot({ path: "/tmp/augur-docs-verify/dialog-mobile-long-content.png" });
  await mobile.close();

  // --- Input/FormField: keyboard focus, typing, ARIA wiring, both themes.
  const inputPage = await browser.newPage();
  await inputPage.goto(origin + site("/components/input"), { waitUntil: "networkidle" });
  await inputPage.evaluate(() => document.fonts.ready);
  const firstInput = inputPage.locator("input, textarea").first();
  const inputLight = await firstInput.evaluate((el) => ({
    border: getComputedStyle(el).borderTopColor,
    background: getComputedStyle(el).backgroundColor,
    labelled: !!el.labels?.length,
    describedby: el.getAttribute("aria-describedby"),
  }));
  ok("input is programmatically labelled", inputLight.labelled === true);
  ok(
    "input aria-describedby points at a real element",
    !inputLight.describedby || (await inputPage.locator(`#${CSS.escape(inputLight.describedby)}`).count()) > 0,
    String(inputLight.describedby),
  );
  await firstInput.focus();
  const focusVisible = await firstInput.evaluate((el) => el.matches(":focus-visible"));
  await firstInput.fill("typed in a real browser");
  ok("input receives keyboard focus (focus-visible)", focusVisible === true);
  ok("input accepts typed text", (await firstInput.inputValue()) === "typed in a real browser");
  // Pin dark and re-read the same input node.
  await inputPage.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const inputDark = await firstInput.evaluate((el) => ({
    border: getComputedStyle(el).borderTopColor,
    background: getComputedStyle(el).backgroundColor,
  }));
  ok(
    "input paints differently in pinned dark (same node)",
    inputLight.background !== inputDark.background || inputLight.border !== inputDark.border,
    `bg ${inputLight.background} -> ${inputDark.background}; border ${inputLight.border} -> ${inputDark.border}`,
  );
  await inputPage.screenshot({ path: "/tmp/augur-docs-verify/input-page-dark.png", fullPage: true });
  await inputPage.close();

  // --- FormField page: label/control wiring in the composition example.
  const formPage = await browser.newPage();
  await formPage.goto(origin + site("/patterns/form-field"), { waitUntil: "networkidle" });
  const formWiring = await formPage.evaluate(() => {
    const field = document.querySelector(".example-form-field-grid");
    const control = field?.querySelector("input, textarea, select");
    const label = field?.querySelector("label");
    return {
      rendered: !!field,
      htmlForMatches: !!control && !!label && label.htmlFor === control.id,
    };
  });
  ok("form-field composition example renders", formWiring.rendered === true);
  ok("form-field label htmlFor matches the control", formWiring.htmlForMatches === true);
  await formPage.close();

  // --- Pattern pages: PageHeader / EmptyState examples render as built.
  for (const route of [site("/patterns/page-header"), site("/patterns/empty-state")]) {
    const p = await browser.newPage();
    await p.goto(origin + route, { waitUntil: "networkidle" });
    const count = await p.locator(".example-card-grid").count();
    ok(`${route} examples render as built`, count >= 1, `${count} example block(s)`);
    await p.close();
  }

  // --- Button keyboard activation: focus-visible and Enter/Space firing.
  const btnPage = await browser.newPage();
  await btnPage.goto(origin + site("/components/button"), { waitUntil: "networkidle" });
  const btn = btnPage.locator(".aug-button:not([disabled])").first();
  await btn.focus();
  const btnFocusVisible = await btn.evaluate((el) => el.matches(":focus-visible"));
  ok("button shows focus-visible on keyboard focus", btnFocusVisible === true);
  let clicks = 0;
  btnPage.on("console", (msg) => {
    if (msg.text() === "[augur-click]") clicks += 1;
  });
  await btn.evaluate((el) =>
    el.addEventListener("click", () => console.log("[augur-click]")),
  );
  await btnPage.keyboard.press("Enter");
  await btnPage.keyboard.press(" ");
  await btnPage.waitForTimeout(300);
  ok("button activates via Enter and Space", clicks === 2, String(clicks));
  await btnPage.close();
}

// --- 8. Specimen rendering repair (issue #44). ---------------------------
console.log("\n== Specimen rendering repair (#44) ===");
{
  // A shared reader for the exact example markup of Card and PageHeader;
  // evaluated in the bare host and in the docs pages so parity is a
  // straight computed-value comparison.
  const componentMetrics = () => {
    const g = (el, prop) => (el ? getComputedStyle(el)[prop] : null);
    const card = document.querySelector(".aug-card:not([data-theme])");
    const title = card?.querySelector(".aug-card-title");
    const desc = card?.querySelector(".aug-card-description");
    const contentP = card?.querySelector(".aug-card-content > p");
    const header = document.querySelector(".aug-page-header:not([data-theme])");
    const phTitle = header?.querySelector(".aug-page-header-title");
    const phDesc = header?.querySelector(".aug-page-header-description");
    const ol = header?.querySelector(".aug-page-header-breadcrumb ol");
    const li2 = header?.querySelector(".aug-page-header-breadcrumb li + li");
    const crumb = header?.querySelector(".aug-page-header-breadcrumb a:not([aria-current])");
    const current = header?.querySelector('.aug-page-header-breadcrumb [aria-current="page"]');
    return {
      cardTitleSize: g(title, "fontSize"),
      cardTitleLh: g(title, "lineHeight"),
      cardTitleMt: g(title, "marginTop"),
      cardTitleMb: g(title, "marginBottom"),
      cardTitleWeight: g(title, "fontWeight"),
      cardDescLh: g(desc, "lineHeight"),
      cardContentPLh: g(contentP, "lineHeight"),
      phTitleSize: g(phTitle, "fontSize"),
      phTitleMt: g(phTitle, "marginTop"),
      phDescLh: g(phDesc, "lineHeight"),
      olPadding: g(ol, "paddingInlineStart"),
      li2MarginTop: g(li2, "marginTop"),
      crumbColor: g(crumb, "color"),
      crumbDecoration: g(crumb, "textDecorationLine"),
      currentColor: g(current, "color"),
    };
  };
  const metricLabels = {
    cardTitleSize: "card title font-size",
    cardTitleLh: "card title line-height",
    cardTitleMt: "card title margin-top",
    cardTitleMb: "card title margin-bottom",
    cardTitleWeight: "card title font-weight",
    cardDescLh: "card description line-height",
    cardContentPLh: "card content paragraph line-height",
    phTitleSize: "page-header title font-size",
    phTitleMt: "page-header title margin-top",
    phDescLh: "page-header description line-height",
    olPadding: "breadcrumb list inline padding",
    li2MarginTop: "breadcrumb second-item offset",
    crumbColor: "breadcrumb link color",
    crumbDecoration: "breadcrumb link decoration",
    currentColor: "breadcrumb current-page color",
  };

  // Bare host: the same markup with no docs shell, served from the
  // repository root on a second loopback server.
  const bareServer = createServer(async (req, res) => {
    try {
      let path = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname));
      if (path.endsWith("/")) path += "index.html";
      const file = join(repoRoot, path);
      if (!file.startsWith(repoRoot)) throw new Error("traversal");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  await new Promise((resolve) => bareServer.listen(0, "127.0.0.1", resolve));
  const bareOrigin = `http://127.0.0.1:${bareServer.address().port}`;
  const barePage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await barePage.goto(`${bareOrigin}/packages/design-system/fixtures/bare-hosts.html`, { waitUntil: "networkidle" });
  await barePage.evaluate(() => document.fonts.ready);
  const bareMetrics = await barePage.evaluate(componentMetrics);
  await barePage.screenshot({ path: "/tmp/augur-docs-verify/bare-hosts.png", fullPage: true });
  await barePage.close();
  bareServer.close();

  // Docs hosts: the same components inside .doc-example-preview.
  const docsMetrics = {};
  for (const [route, keys] of [
    [site("/components/card"), Object.keys(metricLabels).filter((k) => k.startsWith("card"))],
    [site("/patterns/page-header"), Object.keys(metricLabels).filter((k) => k.startsWith("ph") || k.startsWith("ol") || k.startsWith("li2") || k.startsWith("crumb") || k.startsWith("current"))],
  ]) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await p.goto(origin + route, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const read = await p.evaluate(componentMetrics);
    for (const k of keys) docsMetrics[k] = read[k];
    await p.close();
  }

  for (const [key, label] of Object.entries(metricLabels)) {
    ok(
      `${label} identical in bare host and docs`,
      docsMetrics[key] != null && docsMetrics[key] === bareMetrics[key],
      `docs ${docsMetrics[key]} vs bare ${bareMetrics[key]}`,
    );
  }

  // Palette chips: fields with computed dimensions, both themes, and at
  // a narrow viewport. Reads computed styles, never CSS text.
  const readChips = (page) =>
    page.evaluate(() => {
      const chips = [...document.querySelectorAll(".example-palette-chip")];
      const cs = getComputedStyle(chips[0]);
      const rect = chips[0].getBoundingClientRect();
      return {
        count: chips.length,
        display: cs.display,
        height: cs.height,
        painted: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        background: cs.backgroundColor,
        border: cs.borderTopColor,
      };
    });
  const paletteLight = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await paletteLight.goto(origin + site("/foundations/color"), { waitUntil: "networkidle" });
  await paletteLight.evaluate(() => document.fonts.ready);
  const chipsLight = await readChips(paletteLight);
  ok("palette renders 15 chip fields (light)", chipsLight.count === 15, String(chipsLight.count));
  ok("palette chip is a 40px block field (light)", chipsLight.display === "block" && chipsLight.height === "40px", `${chipsLight.display} ${chipsLight.height}`);
  ok("palette chip paints a visible field (light)", !chipsLight.painted.startsWith("0x"), chipsLight.painted);
  ok("palette chip paints a token color (light)", chipsLight.background !== "rgba(0, 0, 0, 0)", chipsLight.background);
  ok("palette chip keeps the hairline edge (light)", chipsLight.border !== "rgba(0, 0, 0, 0)", chipsLight.border);
  await paletteLight.screenshot({ path: "/tmp/augur-docs-verify/color-repaired-light.png", fullPage: true });
  await paletteLight.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const chipsDark = await readChips(paletteLight);
  ok("palette chip is a 40px block field (pinned dark)", chipsDark.display === "block" && chipsDark.height === "40px", `${chipsDark.display} ${chipsDark.height}`);
  // Chips paint theme-invariant PRIMITIVE tokens (--augur-color-*): a
  // palette reference shows the same fixed fields under either theme;
  // only the page's semantic surface changes. Assert painted, unchanged.
  ok(
    "palette chip paints its primitive token in pinned dark (theme-invariant by design)",
    chipsDark.background !== "rgba(0, 0, 0, 0)" && chipsDark.background === chipsLight.background,
    `${chipsLight.background} -> ${chipsDark.background}`,
  );
  await paletteLight.screenshot({ path: "/tmp/augur-docs-verify/color-repaired-dark.png", fullPage: true });
  await paletteLight.close();

  const paletteMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await paletteMobile.goto(origin + site("/foundations/color"), { waitUntil: "networkidle" });
  const mobileChips = await readChips(paletteMobile);
  const mobileOverflow = await paletteMobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  ok("palette chip is a visible field at 390px", mobileChips.display === "block" && !mobileChips.painted.startsWith("0x"), mobileChips.painted);
  ok("color page has no horizontal overflow at 390px", mobileOverflow === false);
  await paletteMobile.close();
}

// --- 10. Shared frame alignment (issue #46). -----------------------------
console.log("\n== Shared frame alignment (#46) ===");
{
  const readFrame = (page) =>
    page.evaluate(() => {
      const cs = (sel, prop) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el)[prop] : null;
      };
      const probeCh = document.createElement("div");
      probeCh.style.width = "65ch";
      probeCh.style.position = "absolute";
      probeCh.style.visibility = "hidden";
      document.body.appendChild(probeCh);
      const measure65 = probeCh.getBoundingClientRect().width;
      probeCh.remove();
      const title = getComputedStyle(document.querySelector(".page-title"));
      const h2 = document.querySelector(".prose h2");
      return {
        frameMax: cs(".shell", "maxWidth"),
        framePad: cs(".shell", "paddingLeft"),
        mainX: Math.round(document.querySelector(".shell").getBoundingClientRect().x),
        proseMax: cs(".prose", "maxWidth"),
        measure65: `${measure65}px`,
        titleFont: `${title.fontFamily.split(",")[0]} ${title.fontWeight} ${title.fontSize}/${title.lineHeight} ${title.letterSpacing}`,
        h2: h2 ? `${getComputedStyle(h2).fontSize}/${getComputedStyle(h2).lineHeight} w${getComputedStyle(h2).fontWeight}` : null,
        wordmark: (() => {
          const el = document.querySelector(".brand-lockup-wordmark");
          if (!el) return null;
          const s = getComputedStyle(el);
          return `${s.fontFamily.split(",")[0]} ${s.fontWeight} ${s.fontSize}/${s.lineHeight}`;
        })(),
        descriptor: (() => {
          const el = document.querySelector(".brand-lockup-descriptor");
          if (!el) return null;
          const s = getComputedStyle(el);
          return `${s.textTransform} ${s.letterSpacing} ${s.color}`;
        })(),
        headerBorder: cs(".masthead", "borderBottomColor"),
        controlEdge: cs(".doc-sidebar", "borderRightColor"),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

  const frame1440 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await frame1440.goto(origin + site("/foundations/color"), { waitUntil: "networkidle" });
  await frame1440.evaluate(() => document.fonts.ready);
  const light = await readFrame(frame1440);
  ok("frame is 1400px with 64px gutters at 1440", light.frameMax === "1400px" && light.framePad === "64px", `${light.frameMax} / ${light.framePad}`);
  ok("centered frame leaves the 20px side margin at 1440", light.mainX === 20, String(light.mainX));
  ok(
    "reading measure is exactly 65ch",
    Math.abs(parseFloat(light.proseMax) - parseFloat(light.measure65)) < 0.5,
    `${light.proseMax} vs ${light.measure65}`,
  );
  ok("page title renders the editorial-title role (Sora 400 40/48)", light.titleFont === "Sora 400 40px/48px -0.4px", light.titleFont);
  ok("section headings render the editorial-section metrics (28/34, regular)", light.h2 === "28px/34px w400", String(light.h2));
  ok("header wordmark is the ui role (Sora 400 14/20)", light.wordmark === "Sora 400 14px/20px", String(light.wordmark));
  ok(
    "descriptor is uppercase tracked secondary text (+0.12em)",
    light.descriptor === "uppercase 1.44px rgb(74, 75, 97)",
    String(light.descriptor),
  );
  ok(
    "light header hairline matches the (shared) quiet separator",
    light.headerBorder === light.controlEdge,
    `${light.headerBorder} vs ${light.controlEdge}`,
  );
  ok("no horizontal overflow at 1440", light.overflowX === false);
  await frame1440.screenshot({ path: "/tmp/augur-docs-verify/frame-1440-light.png", fullPage: true });

  await frame1440.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const dark = await readFrame(frame1440);
  ok(
    "dark editorial separator is the quiet Surface 3 step (header and sidebar hairlines share it)",
    dark.headerBorder === "rgb(36, 36, 56)" && dark.headerBorder === dark.controlEdge,
    `${dark.headerBorder} vs sidebar ${dark.controlEdge}`,
  );
  ok(
    "dark descriptor flips to the dark secondary role",
    dark.descriptor === "uppercase 1.44px rgb(161, 161, 184)",
    String(dark.descriptor),
  );
  await frame1440.screenshot({ path: "/tmp/augur-docs-verify/frame-1440-dark.png", fullPage: true });
  await frame1440.close();

  for (const [label, viewport] of [
    ["768", { width: 768, height: 1024 }],
    ["390", { width: 390, height: 844 }],
  ]) {
    const p = await browser.newPage({ viewport });
    await p.goto(origin + site("/foundations/color"), { waitUntil: "networkidle" });
    const narrow = await readFrame(p);
    ok(`frame uses 24px gutters at ${label}`, narrow.framePad === "24px", narrow.framePad);
    ok(`no horizontal overflow at ${label}`, narrow.overflowX === false);
    if (label === "390") {
      ok(
        "page title steps down to the adopted 32/40 mobile size",
        narrow.titleFont === "Sora 400 32px/40px -0.32px",
        narrow.titleFont,
      );
    }
    await p.screenshot({ path: `/tmp/augur-docs-verify/frame-${label}-light.png`, fullPage: true });
    await p.close();
  }
}

// --- 11. Brand opening (issue #47, contract frame A). -------------------
console.log("\n== Brand opening (#47) ===");
{
  const readOpening = (page) =>
    page.evaluate(() => {
      const cs = (sel, prop) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el)[prop] : null;
      };
      const sig = document.querySelector(".opening-signal");
      const r = sig.getBoundingClientRect();
      const cols = cs(".opening", "gridTemplateColumns").split(" ").map(parseFloat);
      return {
        titleText: document.querySelector(".opening-message h1").textContent,
        titleFont: (() => {
          const s = getComputedStyle(document.querySelector(".opening-message h1"));
          return `${s.fontWeight} ${s.fontSize}/${s.lineHeight}`;
        })(),
        signal: `${Math.round(r.width)}x${Math.round(r.height)}`,
        signalColor: cs(".opening-signal", "backgroundColor"),
        actionColor: cs(".opening-action", "color"),
        actionText: document.querySelector(".opening-action").textContent.trim(),
        lede: document.querySelector(".opening-lede").textContent.replace(/\s+/g, " ").trim(),
        colRatio: cols.length === 2 ? cols[1] / cols[0] : null,
        openingHeight: Math.round(document.querySelector(".opening").getBoundingClientRect().height),
        tracks: document.querySelectorAll(".opening-footer > div").length,
        wordmarkSize: cs(".opening-wordmark", "fontSize"),
        display: cs(".opening", "display"),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

  const home1440 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await home1440.goto(origin + site("/"), { waitUntil: "networkidle" });
  await home1440.evaluate(() => document.fonts.ready);
  const openLight = await readOpening(home1440);
  // <br> joins without whitespace in textContent, hence "whatmatters".
  ok(
    "opening title is the locked message in the editorial-title role",
    openLight.titleText.trim() === "Make whatmatters clear." && openLight.titleFont === "400 40px/48px",
    `${openLight.titleFont} "${openLight.titleText.replace(/\s+/g, " ").trim()}"`,
  );
  ok("opening signal is exactly 32x2", openLight.signal === "32x2", openLight.signal);
  ok("light signal paints Deep through --primary", openLight.signalColor === "rgb(9, 94, 66)", openLight.signalColor);
  ok("text action stays neutral foreground (not accent)", openLight.actionColor === "rgb(14, 14, 33)" && openLight.actionText.startsWith("Explore the foundations"), `${openLight.actionColor} "${openLight.actionText}"`);
  ok("lede is the locked shared-interface-language copy", openLight.lede.startsWith("A shared interface language for Augur: foundations, components, and guidance for clear, consistent interfaces."), openLight.lede.slice(0, 60));
  ok("rail and message hold the 1:2 opening columns", openLight.colRatio !== null && Math.abs(openLight.colRatio - 2) < 0.05, String(openLight.colRatio));
  ok("opening meets the 520px desktop minimum height", openLight.openingHeight >= 520, String(openLight.openingHeight));
  ok("metadata row has three equal tracks", openLight.tracks === 3, String(openLight.tracks));
  ok("identity lockup renders at opening scale", openLight.wordmarkSize === "40px", openLight.wordmarkSize);
  ok("no horizontal overflow at 1440", openLight.overflowX === false);
  const routeHrefs = await home1440.evaluate(() =>
    [...document.querySelectorAll(".route-group a")].map((a) => new URL(a.getAttribute("href"), location.href).pathname),
  );
  const broken = [];
  for (const h of routeHrefs) {
    const res = await fetch(origin + (h.endsWith("/") ? `${h}index.html` : h));
    if (res.status !== 200) broken.push(h);
  }
  ok("all 18 route links resolve to built pages", routeHrefs.length === 18 && broken.length === 0, broken.join(", ") || "ok");
  await home1440.screenshot({ path: "/tmp/augur-docs-verify/home-opening-light-1440.png", fullPage: true });
  await home1440.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const openDark = await readOpening(home1440);
  ok("dark signal swaps to Green on the same node", openDark.signalColor === "rgb(42, 231, 168)", openDark.signalColor);
  ok("dark action stays neutral foreground", openDark.actionColor === "rgb(245, 245, 248)", openDark.actionColor);
  await home1440.screenshot({ path: "/tmp/augur-docs-verify/home-opening-dark-1440.png", fullPage: true });
  await home1440.close();

  const homeMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await homeMobile.goto(origin + site("/"), { waitUntil: "networkidle" });
  const openMobile = await readOpening(homeMobile);
  ok("mobile stacks the opening (rail above message)", openMobile.display === "flex", openMobile.display);
  ok("mobile title steps to the adopted 32/40", openMobile.titleFont === "400 32px/40px", openMobile.titleFont);
  ok("no horizontal overflow at 390", openMobile.overflowX === false);
  await homeMobile.screenshot({ path: "/tmp/augur-docs-verify/home-opening-light-390.png", fullPage: true });
  await homeMobile.close();
}

// --- 12. Type specimen (issue #48, contract frame B). -------------------
console.log("\n== Type specimen (#48) ===");
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(origin + site("/foundations/fonts"), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const read = () =>
    p.evaluate(() => {
      const rows = [...document.querySelectorAll(".type-compare-row")];
      const field = document.querySelector(".type-display-field");
      const sample = field?.querySelector(".type-display-sample");
      const notes = document.querySelectorAll(".type-specimen-notes > div").length;
      const cs = getComputedStyle(field);
      const sampleCS = getComputedStyle(sample);
      const cols = getComputedStyle(document.querySelector(".type-specimen-grid")).gridTemplateColumns.split(" ").length;
      return {
        rows: rows.length,
        fieldBg: cs.backgroundColor,
        fieldFg: cs.color,
        sampleWeight: sampleCS.fontWeight,
        sampleSize: sampleCS.fontSize,
        notes,
        cols,
        specs: rows.map((r) => r.querySelector(".type-compare-spec").textContent.trim().slice(0, 24)),
        rowSampleWeights: rows.slice(0, 3).map((r) => getComputedStyle(r.querySelector("[class*='augur-type-']")).fontWeight),
      };
    });
  const light = await read();
  ok("specimen shows all ten roles as compact aligned rows", light.rows === 10, String(light.rows));
  ok("display field is the inverse tonal field (light: Navy field, Paper text)", light.fieldBg === "rgb(14, 14, 33)" && light.fieldFg === "rgb(245, 245, 248)", `${light.fieldBg} / ${light.fieldFg}`);
  ok("display sample renders Sora 600 at the display role", light.sampleWeight === "600" && light.sampleSize === "40px", `${light.sampleWeight} ${light.sampleSize}`);
  ok("three rule-led support notes", light.notes === 3, String(light.notes));
  ok("frame B holds the 2:1 specimen grid at 1440", light.cols === 2, String(light.cols));
  ok("no false weights: leading samples carry their real roles", light.rowSampleWeights[0] === "600" && light.rowSampleWeights[2] === "600", light.rowSampleWeights.join(", "));
  await p.screenshot({ path: "/tmp/augur-docs-verify/type-specimen-light-1440.png", fullPage: true });
  await p.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const dark = await read();
  ok("display field swaps Navy/Paper in dark while keeping geometry", dark.fieldBg === "rgb(245, 245, 248)" && dark.fieldFg === "rgb(14, 14, 33)", `${dark.fieldBg} / ${dark.fieldFg}`);
  await p.screenshot({ path: "/tmp/augur-docs-verify/type-specimen-dark-1440.png", fullPage: true });
  await p.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(origin + site("/foundations/fonts"), { waitUntil: "networkidle" });
  const stack = await mobile.evaluate(() => {
    const cols = getComputedStyle(document.querySelector(".type-specimen-grid")).gridTemplateColumns.split(" ").length;
    const grid = document.querySelector(".type-specimen-grid");
    const main = grid.children[0].getBoundingClientRect();
    const notes = grid.children[1].getBoundingClientRect();
    return { cols, mainFirst: main.top < notes.top, overflow: document.documentElement.scrollWidth > window.innerWidth };
  });
  ok("frame B stacks: specimen first, notes below at 390", stack.cols === 1 && stack.mainFirst, `cols=${stack.cols} mainFirst=${stack.mainFirst}`);
  ok("no horizontal overflow at 390", stack.overflow === false);
  await mobile.close();
}

// --- 13. Reference record (issue #52, contract frame C). ----------------
console.log("\n== Reference record (#52) ===");
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(origin + site("/patterns/reference-record"), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const read = () =>
    p.evaluate(() => {
      const panels = [...document.querySelectorAll(".example-record-panel")];
      const q = panels[0].querySelector(".example-record-question");
      const qSize = getComputedStyle(q).fontSize;
      const signals = [...document.querySelectorAll(".example-record-signal")].map((s) => {
        const r = s.getBoundingClientRect();
        return `${Math.round(r.width)}x${Math.round(r.height)} ${getComputedStyle(s).backgroundColor}`;
      });
      const btns = [...panels[0].querySelectorAll(".example-record-choices .aug-button")];
      const bw = btns.map((b) => Math.round(b.getBoundingClientRect().width));
      const bh = btns.map((b) => Math.round(b.getBoundingClientRect().height));
      const pressed = btns.map((b) => b.getAttribute("aria-pressed"));
      const domOrder = [...panels[0].children].map((el) => el.className);
      return {
        count: panels.length,
        themes: panels.map((x) => x.dataset.theme),
        widths: panels.map((x) => Math.round(x.getBoundingClientRect().width)),
        heights: panels.map((x) => Math.round(x.getBoundingClientRect().height)),
        bgs: panels.map((x) => getComputedStyle(x).backgroundColor),
        qSize,
        signals,
        btnCount: btns.length,
        bw,
        bh,
        pressed,
        domOrder,
        response: panels[0].querySelector(".example-record-response").textContent.replace(/\s+/g, " ").trim(),
      };
    });
  const light = await read();
  ok("record renders as a pinned light/dark pair", light.count === 2 && light.themes[0] === "light" && light.themes[1] === "dark", light.themes.join("/"));
  ok("pair geometry identical", light.widths[0] === light.widths[1] && Math.abs(light.heights[0] - light.heights[1]) <= 1, `${light.widths.join("x")} / ${light.heights.join("x")}`);
  ok("pair panels paint differently", light.bgs[0] !== light.bgs[1], light.bgs.join(" vs "));
  ok("state signals are exactly 32x2 in both panels", light.signals.every((s) => s.startsWith("32x2")), light.signals.join(" | "));
  ok("question is the first substantive element after the state rail", light.domOrder[0] === "example-record-state" && light.domOrder[1].includes("example-record-question"), light.domOrder.join(" > "));
  ok("question renders at the approved heading-2 scale (focal point)", light.qSize === "20px", light.qSize);
  ok("choices are equal (two buttons, same size)", light.btnCount === 2 && light.bw[0] === light.bw[1] && light.bh[0] === light.bh[1], `${light.bw.join("x")} / ${light.bh.join("x")}`);
  ok("static choices do not announce a fabricated selection", light.pressed.every((value) => value === null), light.pressed.join("/"));
  ok("response is explicit and quiet", light.response.startsWith("Response") && light.response.includes("Not submitted"), light.response);
  await p.screenshot({ path: "/tmp/augur-docs-verify/reference-record-light-1440.png", fullPage: true });
  await p.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const dark = await read();
  // Pinned panels keep their own themes by design: under a dark host the
  // pinned-light signal stays Deep and the pinned-dark signal is Green.
  ok(
    "pair stays a true pair under dark host; signals hold Deep (light pin) and Green (dark pin)",
    dark.bgs[0] !== dark.bgs[1] &&
      dark.signals[0].includes("rgb(9, 94, 66)") &&
      dark.signals[1].includes("rgb(42, 231, 168)"),
    dark.signals.join(" | "),
  );
  await p.screenshot({ path: "/tmp/augur-docs-verify/reference-record-dark-1440.png", fullPage: true });
  await p.close();

  // No improvised artwork across the pattern examples.
  const art = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const counts = {};
  for (const route of [site("/patterns/reference-record"), site("/patterns/empty-state"), site("/patterns/page-header"), site("/patterns/form-field")]) {
    await art.goto(origin + route, { waitUntil: "networkidle" });
    counts[route] = await art.evaluate(() =>
      [
        ...document.querySelectorAll(".doc-example-preview img, .doc-example-preview svg"),
      ].filter((el) => !el.closest("[class*='empty-state-icon']")).length,
    );
  }
  ok(
    "pattern examples contain no improvised artwork (no img/svg)",
    Object.values(counts).every((c) => c === 0),
    JSON.stringify(counts),
  );
  await art.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(origin + site("/patterns/reference-record"), { waitUntil: "networkidle" });
  const mob = await mobile.evaluate(() => {
    const btns = [...document.querySelectorAll(".example-record-panel")][0].querySelectorAll(".example-record-choices .aug-button");
    const tops = [...btns].map((b) => Math.round(b.getBoundingClientRect().top));
    return {
      sameRow: tops[0] === tops[1],
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  ok("choices stay side by side at 390", mob.sameRow);
  ok("no horizontal overflow at 390", mob.overflow === false);
  await mobile.screenshot({ path: "/tmp/augur-docs-verify/reference-record-light-390.png", fullPage: true });
  await mobile.close();
}

// Independent review regressions: readable reflow, real roles, locked record,
// and touch behavior. These assertions catch failures hidden by overflow-only QA.
console.log("\n== Applied proposal review (#52) ===");
for (const theme of ["light", "dark"]) {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const p = await browser.newPage({ viewport });
    await p.goto(origin + site("/proposal-review"), { waitUntil: "networkidle" });
    await p.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    const applied = await p.evaluate(() => {
      const page = document.querySelector(".proposal-review-page");
      const record = page?.querySelector(".example-record-panel");
      const choices = [...(record?.querySelectorAll(".example-record-choices button") ?? [])];
      const action = page?.querySelector(".aug-page-header-actions form");
      return {
        h1: page?.querySelector("h1")?.textContent?.trim(),
        question: record?.querySelector(".example-record-question")?.textContent?.trim(),
        choices: choices.map((choice) => ({
          text: choice.textContent?.trim(),
          unavailable: choice.getAttribute("aria-disabled"),
          pressed: choice.getAttribute("aria-pressed"),
          rect: { width: Math.round(choice.getBoundingClientRect().width), height: Math.round(choice.getBoundingClientRect().height) },
        })),
        action: action?.getAttribute("action"),
        actionLabel: action?.querySelector("button")?.textContent?.trim(),
        details: document.querySelector("#proposal-details")?.textContent?.replace(/\s+/g, " ").trim(),
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    ok(`applied review has one static task ${theme}/${viewport.width}`, applied.h1 === "Proposal review" && applied.question === "Did the proposal pass before 30 June?", JSON.stringify(applied));
    ok(`applied review keeps equal unavailable choices ${theme}/${viewport.width}`, applied.choices.length === 2 && applied.choices.map((choice) => choice.text).join("/") === "Yes/No" && applied.choices.every((choice) => choice.unavailable === "true" && choice.pressed === null && choice.rect.width === applied.choices[0].rect.width), JSON.stringify(applied.choices));
    ok(`applied review has an honest in-page primary action ${theme}/${viewport.width}`, applied.action === "#proposal-details" && applied.actionLabel === "Review details" && applied.details?.includes("no voting logic"), JSON.stringify(applied));
    ok(`applied review has no horizontal overflow ${theme}/${viewport.width}`, applied.overflow === false);
    await p.getByRole("button", { name: "Review details", exact: true }).click();
    await p.waitForFunction(() => location.hash === "#proposal-details");
    ok(`applied review action reaches details ${theme}/${viewport.width}`, await p.locator("#proposal-details").evaluate((details) => document.activeElement === details || location.hash === "#proposal-details"));
    await p.screenshot({ path: `/tmp/augur-docs-verify/proposal-review-${theme}-${viewport.width}.png`, fullPage: true });
    await p.close();
  }
}

for (const theme of ["light", "dark"]) {
  for (const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844}]) {
    const p = await browser.newPage({ viewport });
    await p.goto(origin + site("/foundations/fonts"), { waitUntil: "networkidle" });
    await p.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    await p.evaluate(() => document.fonts.ready);
    const type = await p.evaluate(() => {
      const rows = [...document.querySelectorAll('.type-compare-row')];
      const notes = document.querySelector('.type-specimen-notes');
      return {
        widths: rows.map(r => r.children[0].getBoundingClientRect().width / r.getBoundingClientRect().width),
        noteColumns: getComputedStyle(notes).gridTemplateColumns.split(' ').length,
        weights: [...notes.querySelectorAll('h3')].map(h => getComputedStyle(h).fontWeight),
        bodyLines: [...notes.querySelectorAll('p')].map(h => getComputedStyle(h).lineHeight),
      };
    });
    ok(`review type samples retain readable width ${theme}/${viewport.width}`, type.widths.every(w => w > (viewport.width < 600 ? .95 : .45)), JSON.stringify(type.widths));
    ok(`review support voice is regular ${theme}/${viewport.width}`, type.weights.every(w=>w==='400') && type.bodyLines.every(l=>l==='24px'), JSON.stringify(type));
    ok(`review tablet support grid ${theme}/${viewport.width}`, type.noteColumns === (viewport.width >= 600 && viewport.width < 960 ? 3 : 1));
    await p.goto(origin + site('/patterns/reference-record'), { waitUntil:'networkidle' });
    await p.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    const records = await p.locator('.example-record-panel').evaluateAll(panels => panels.map(panel => ({
      text: panel.textContent,
      gap: getComputedStyle(panel.querySelector('.example-record-choices')).gap,
      disabled: [...panel.querySelectorAll('button')].every(b=>b.getAttribute('aria-disabled')==='true'),
      edge: getComputedStyle(panel).borderColor,
      quiet: getComputedStyle(panel).getPropertyValue('--border-quiet'),
    })));
    ok(`review fixed static record ${theme}/${viewport.width}`, records.every(r => ['Open query','LQ-042','Did the proposal pass before 30 June?','Not submitted','Closes','14:32 UTC'].every(t=>r.text.includes(t)) && r.disabled));
    ok(`review equal choice gap ${theme}/${viewport.width}`, records.every(r=>r.gap === (viewport.width < 600 ? '16px' : '24px')));
    await p.close();
  }
}
for (const theme of ['light','dark']) {
  const context = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true });
  const p = await context.newPage();
  for (const route of ['/components/button','/components/input','/components/dialog']) {
    await p.goto(origin + site(route), {waitUntil:'networkidle'});
    await p.evaluate(theme => {document.documentElement.dataset.theme = theme;}, theme);
    if (route.endsWith('dialog')) await openDialog(p, p.getByRole('button',{name:'Open dialog',exact:true}));
    const targets = await p.locator('.aug-button,.aug-input,.aug-dialog-close,.theme-toggle-option,.page-action,.browse-summary').evaluateAll(els => els.filter(e=>e.getBoundingClientRect().width).map(e=>({name:e.className,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
    ok(`review 44px touch targets ${theme}${route}`, targets.every(t=>t.w>=44 && t.h>=44), JSON.stringify(targets.filter(t=>t.w<44 || t.h<44)));
    if (route.endsWith('dialog')) {
      const dialog = await p.locator('.aug-dialog-content').evaluate(el=>({animation:getComputedStyle(el).animationName,padding:getComputedStyle(el).paddingTop}));
      ok(`review immediate mobile Dialog ${theme}`, dialog.animation==='none' && dialog.padding==='16px', JSON.stringify(dialog));
      await p.keyboard.press('Escape');
    }
  }
  await context.close();
}

// --- 14. Standalone consumer parity (issue #53). ------------------------
console.log("\n== Standalone consumer (#53) ===");
{
  // Same second server pattern as the bare-host parity section: serve the
  // repository root so packages/design-system/fixtures/bare-hosts.html —
  // standalone markup + package styles, zero docs CSS — can load. This is
  // the visual companion to the #18 consumer-install smoke (which proves
  // the full registry-install path end to end).
  const consumerServer = createServer(async (req, res) => {
    try {
      let path = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname));
      if (path.endsWith("/")) path += "index.html";
      const file = join(repoRoot, path);
      if (!file.startsWith(repoRoot)) throw new Error("traversal");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  await new Promise((resolve) => consumerServer.listen(0, "127.0.0.1", resolve));
  const consumerOrigin = `http://127.0.0.1:${consumerServer.address().port}`;
  const consumer = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consumerIssues = [];
  consumer.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consumerIssues.push(m.text()); });
  await consumer.goto(`${consumerOrigin}/packages/design-system/fixtures/bare-hosts.html`, { waitUntil: "networkidle" });
  await consumer.evaluate(async () => {
    await document.fonts.load("16px Sora");
    await document.fonts.load("600 40px Sora");
    await document.fonts.load("16px 'Schibsted Grotesk'");
    await document.fonts.ready;
  });
  const consumerEvidence = await consumer.evaluate(() => {
    const btn = document.querySelector(".aug-button");
    const card = document.querySelector(".aug-card");
    const darkCard = document.querySelector('[data-theme="dark"] .aug-card, .aug-card[data-theme="dark"]');
    return {
      faces: document.fonts.size,
      fontsLoaded: document.fonts.status,
      sora400: document.fonts.check("16px Sora"),
      sora600: document.fonts.check("600 40px Sora"),
      schibsted: document.fonts.check("16px 'Schibsted Grotesk'"),
      bodyFamily: getComputedStyle(document.body).fontFamily,
      buttonHeight: getComputedStyle(btn).height,
      buttonRadius: getComputedStyle(btn).borderRadius,
      cardRadius: getComputedStyle(card).borderRadius,
      darkCardPresent: !!darkCard,
      darkCardBg: darkCard ? getComputedStyle(darkCard).backgroundColor : null,
      lightCardBg: getComputedStyle(card).backgroundColor,
    };
  });
  ok("standalone consumer registers and loads the real font faces", consumerEvidence.faces >= 6 && consumerEvidence.fontsLoaded === "loaded" && consumerEvidence.sora400 && consumerEvidence.sora600 && consumerEvidence.schibsted, `faces=${consumerEvidence.faces} status=${consumerEvidence.fontsLoaded}`);
  ok("standalone consumer body carries the secondary voice", consumerEvidence.bodyFamily.includes("Schibsted Grotesk"), consumerEvidence.bodyFamily);
  ok("standalone control geometry matches the encoded contract", consumerEvidence.buttonHeight === "36px" && consumerEvidence.buttonRadius === "0px", `${consumerEvidence.buttonHeight} / ${consumerEvidence.buttonRadius}`);
  ok("standalone card surface matches the encoded contract", consumerEvidence.cardRadius === "0px", consumerEvidence.cardRadius);
  ok("semantic theme evidence: scoped dark subtree paints differently", consumerEvidence.darkCardPresent && consumerEvidence.darkCardBg !== consumerEvidence.lightCardBg, `${consumerEvidence.lightCardBg} vs ${consumerEvidence.darkCardBg}`);
  ok("standalone consumer produces no console errors/warnings", consumerIssues.length === 0, consumerIssues.join("; ") || "clean");
  await consumer.screenshot({ path: "/tmp/augur-docs-verify/standalone-consumer.png", fullPage: true });
  await consumer.close();
  consumerServer.close();
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
