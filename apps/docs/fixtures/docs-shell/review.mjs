/**
 * Docs navigation and reading shell — frame build, capture, and checks
 * (issue #55, phase 0 design checkpoint).
 *
 * Assembles the two frame pages from the committed templates plus:
 *   - the grouped navigation model (single source in this file),
 *   - the REAL rendered article from the built docs app
 *     (/foundations/fonts as the short case, /foundations/color as
 *     the dense stress case), split into page opening and body so the
 *     collapsed "On this page" control sits at the true DOM position,
 *   - the H2-derived contents lists, and
 *   - previous/next links from the same maintained reading order.
 *
 * It then serves the frames loopback-only, captures both themes at
 * 1440x1000, 768x1024, and 390x844 (full page plus focused
 * masthead/sidebar/drawer shots), verifies fonts, geometry, parity,
 * overflow, focus, the wide-region table release, and contrast, and
 * writes evidence/verification.json.
 *
 * Requires a current docs build (the article content is extracted from
 * apps/docs/dist at run time, so frames cannot drift from the app):
 *
 *     bun run --cwd apps/docs build
 *     bun apps/docs/fixtures/docs-shell/review.mjs
 *
 * Interactive inspection:
 *
 *     bun apps/docs/fixtures/docs-shell/review.mjs --serve
 */
import { chromium } from "playwright";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const root = dirname(fileURLToPath(import.meta.url));
const repo = resolve(root, "../../../..");
const generated = resolve(root, ".generated");
const evidence = resolve(root, "evidence");
const dist = resolve(repo, "apps/docs/dist");

// ---------------------------------------------------------------- //
// Maintained reading order (mirrors the normalized content orders). //
// Phase 1 replaces this literal with collection-derived data; the    //
// strings match the routes the app will ship.                        //
// ---------------------------------------------------------------- //
const OVERVIEWS = [
  { group: "Foundations", href: "/foundations", label: "Overview" },
  { group: "Components", href: "/components", label: "Overview" },
  { group: "Patterns", href: "/patterns", label: "Overview" },
  { group: "Reference", href: "/reference", label: "Overview" },
];
const GROUPS = [
  {
    label: "Foundations",
    pages: [
      { label: "Fonts and typography", href: "/foundations/fonts" },
      { label: "Color system", href: "/foundations/color" },
      { label: "Theming", href: "/foundations/theming" },
      { label: "Visual direction", href: "/foundations/visual-direction" },
      { label: "Brand identity", href: "/foundations/identity" },
    ],
  },
  {
    label: "Components",
    pages: [
      { label: "Button", href: "/components/button" },
      { label: "Card", href: "/components/card" },
      { label: "Input", href: "/components/input" },
      { label: "Dialog", href: "/components/dialog" },
    ],
  },
  {
    label: "Patterns",
    pages: [
      { label: "PageHeader", href: "/patterns/page-header" },
      { label: "FormField", href: "/patterns/form-field" },
      { label: "EmptyState", href: "/patterns/empty-state" },
      { label: "Reference record", href: "/patterns/reference-record" },
    ],
  },
  {
    label: "Reference",
    pages: [
      { label: "Package entries", href: "/reference/package-entries" },
      { label: "Contributing", href: "/reference/contributing" },
      { label: "Component conventions", href: "/reference/component-conventions" },
    ],
  },
];
/** One flat reading order: getting-started, then each group in order. */
const READING_ORDER = [
  { label: "Getting started", href: "/getting-started" },
  ...GROUPS.flatMap((group) => [
    OVERVIEWS.find((overview) => overview.group === group.label),
    ...group.pages,
  ]),
];

const PAGES = {
  short: {
    template: "short.html",
    dist: "foundations/fonts/index.html",
    active: "/foundations/fonts",
    title: "short page",
  },
  dense: {
    template: "dense.html",
    dist: "foundations/color/index.html",
    active: "/foundations/color",
    title: "dense page",
  },
};
const VIEWPORTS = [
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
const THEMES = ["light", "dark"];

// ---------------------------------------------------------------- //
// Assembly                                                          //
// ---------------------------------------------------------------- //

function navHtml(activeHref) {
  const link = (item) =>
    `<li><a class="nav-link" href="${item.href}"${
      item.href === activeHref ? ' aria-current="page"' : ""
    }>${item.label}</a></li>`;
  const leadIn = `<div class="nav-group lead-in"><ul>${link(READING_ORDER[0])}</ul></div>`;
  const groups = GROUPS.map(
    (group) =>
      `<div class="nav-group"><span class="nav-group-label augur-type-editorial-label">${group.label}</span><ul>${link(
        OVERVIEWS.find((overview) => overview.group === group.label),
      )}${group.pages.map(link).join("")}</ul></div>`,
  );
  return leadIn + groups.join("");
}

function tocLists(entries) {
  const items = entries
    .map((entry) => `<li><a href="#${entry.id}">${entry.label}</a></li>`)
    .join("");
  return {
    rail:
      `<p class="page-contents-label augur-type-editorial-label">On this page</p>` +
      `<ul>${items}</ul>`,
    collapse: items,
  };
}

function pagerHtml(activeHref) {
  const index = READING_ORDER.findIndex((item) => item.href === activeHref);
  assert.notEqual(index, -1, "active page must be in the reading order");
  const prev = READING_ORDER[index - 1];
  const next = READING_ORDER[index + 1];
  const side = (item, direction, extraClass) =>
    item
      ? `<a class="${extraClass}" href="${item.href}"><span class="pager-direction">${direction}</span><span>${item.label}</span></a>`
      : `<span></span>`;
  return side(prev, "Previous", "pager-prev") + side(next, "Next", "pager-next");
}

/** Split the real article into page opening and body at the page-actions boundary. */
function splitArticle(articleHtml) {
  // Issue #62 moved the actions beside the title inside .doc-page-head, so
  // the boundary is the head's matching close when present; walk depth to
  // find it instead of taking the first </div>.
  const headMarker = articleHtml.indexOf('<div class="doc-page-head">');
  const marker = headMarker !== -1 ? headMarker : articleHtml.indexOf('<div class="page-actions">');
  assert.notEqual(marker, -1, "article must contain the page-opening head or actions");
  let depth = 0;
  let split = -1;
  const token = /<\/?div\b[^>]*>/g;
  token.lastIndex = marker;
  for (let match; (match = token.exec(articleHtml)) !== null; ) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      split = match.index + match[0].length;
      break;
    }
  }
  assert.notEqual(split, -1, "page opening must close");
  return { opening: articleHtml.slice(0, split), body: articleHtml.slice(split) };
}

function tocOf(articleHtml) {
  const entries = [];
  for (const match of articleHtml.matchAll(/<h2 id="([^"]*)"[^>]*>([\s\S]*?)<\/h2>/g)) {
    entries.push({ id: match[1], label: match[2].replace(/<[^>]*>/g, "").trim() });
  }
  return entries;
}

async function assemble() {
  await mkdir(generated, { recursive: true });
  const build = await Bun.build({
    entrypoints: [resolve(root, "shell.css")],
    outdir: generated,
    target: "browser",
    naming: "[name].[ext]",
  });
  assert.ok(build.success, JSON.stringify(build.logs));

  for (const [key, page] of Object.entries(PAGES)) {
    const distPath = resolve(dist, page.dist);
    try {
      await access(distPath);
    } catch {
      throw new Error(
        `Missing ${distPath}. Run the docs build first: bun run --cwd apps/docs build`,
      );
    }
    const distHtml = await readFile(distPath, "utf8");
    const start = distHtml.indexOf('<article class="prose doc-page"');
    const end = distHtml.indexOf("</article>", start);
    assert.notEqual(start, -1, `article not found in ${page.dist}`);
    assert.notEqual(end, -1);
    const articleHtml = distHtml.slice(start, end + "</article>".length);

    const { opening, body } = splitArticle(articleHtml);
    const lists = tocLists(tocOf(articleHtml));
    const template = await readFile(resolve(root, page.template), "utf8");
    const assembled = template
      .replaceAll('data-slot="nav"></nav>', `>${navHtml(page.active)}</nav>`)
      .replace("<!-- slot:opening -->", opening)
      .replace("<!-- slot:body -->", body)
      .replace('data-slot="collapse-list"></ul>', `>${lists.collapse}</ul>`)
      .replace('data-slot="rail"></aside>', `>${lists.rail}</aside>`)
      .replace('data-slot="pager"></nav>', `>${pagerHtml(page.active)}</nav>`);
    assert.ok(!assembled.includes("data-slot="), `unfilled slot in ${key}`);
    assert.ok(!assembled.includes("slot:"), `unfilled slot in ${key}`);
    assert.ok(assembled.includes('aria-current="page"'), `nav not filled in ${key}`);
    await writeFile(resolve(generated, page.template), assembled);
  }
}

// ---------------------------------------------------------------- //
// Serve + capture + verify                                          //
// ---------------------------------------------------------------- //

function contrast(a, b) {
  function luminance(s) {
    const rgb = s
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number)
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname);
    const file = resolve(generated, "." + (path === "/" ? "/short.html" : path));
    if (!file.startsWith(generated + "/")) return new Response("Not found", { status: 404 });
    const asset = Bun.file(file);
    return (await asset.exists()) ? new Response(asset) : new Response("Not found", { status: 404 });
  },
});
const url = `http://127.0.0.1:${server.port}`;

await mkdir(evidence, { recursive: true });
await assemble();

if (process.argv.includes("--serve")) {
  console.log(`Docs shell frames: ${url}/short.html and ${url}/dense.html (?theme=dark)`);
  await new Promise(() => {});
}

const browser = await chromium.launch({ headless: true });
const report = {
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim(),
  fixtureSha256: {},
  captures: [],
  limitations: [
    "Phase 0 frames only: overview routes (/foundations, /components, /patterns, /reference) are part of the proposed model and do not exist in the app yet.",
    "Final human visual acceptance remains pending; #53 consumes this shell.",
    "Theme toggle and browse disclosure work; Copy page buttons are inert previews by design.",
  ],
};
for (const file of ["shell.css", "short.html", "dense.html", "review.mjs"]) {
  report.fixtureSha256[file] = createHash("sha256")
    .update(await readFile(resolve(root, file)))
    .digest("hex");
}

try {
  for (const [key, page] of Object.entries(PAGES)) {
    for (const viewport of VIEWPORTS) {
      let firstGeometry;
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport,
          hasTouch: viewport.width === 390,
          isMobile: viewport.width === 390,
          deviceScaleFactor: 1,
          // No reducedMotion emulation: the shell adopts FD-05 (0ms, no
          // decorative motion), so captures are already deterministic, and
          // current Chromium replaces author focus outlines with a UA ring
          // under reduce emulation, which would misreport the FD-04 ring.
        });
        const errors = [];
        const p = await context.newPage();
        p.on("pageerror", (e) => errors.push(String(e)));
        p.on("console", (m) => {
          if (["error", "warning"].includes(m.type())) errors.push(m.text());
        });
        p.on("requestfailed", (r) => errors.push(`request failed ${r.url()}`));
        p.on("response", (r) => {
          if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
        });

        await p.goto(`${url}/${page.template}?theme=${theme}`, { waitUntil: "networkidle" });
        await p.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([
            document.fonts.load('400 40px Sora'),
            document.fonts.load('600 40px Sora'),
            document.fonts.load('400 16px "Schibsted Grotesk"'),
          ]);
        });

        const wide = viewport.width >= 1200;
        const desktop = viewport.width >= 960;
        const actual = await p.evaluate(({ wide, desktop }) => {
          const rect = (selector) => {
            const node = document.querySelector(selector);
            if (!node) return null;
            const r = node.getBoundingClientRect();
            const s = getComputedStyle(node);
            return {
              x: Math.round(r.x),
              y: Math.round(r.y),
              width: Math.round(r.width),
              height: Math.round(r.height),
              display: s.display,
            };
          };
          const active = document.querySelector('.doc-sidebar .nav-link[aria-current="page"]');
          const activeBefore = active ? getComputedStyle(active, "::before") : null;
          const proseNode = document.querySelector(".doc-main .prose");
          const tableNode = document.querySelector(".doc-main .prose table");
          const tocLinks = [...document.querySelectorAll('.page-contents a')];
          const collapseLinks = [...document.querySelectorAll('.onthispage-collapse a')];
          const navLinks = [...document.querySelectorAll('.doc-sidebar .nav-link')];
          return {
            fonts: {
              sora400: document.fonts.check('400 40px Sora'),
              sora600: document.fonts.check('600 40px Sora'),
              schibsted400: document.fonts.check('400 16px "Schibsted Grotesk"'),
            },
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            geometry: {
              masthead: rect(".masthead-inner"),
              brand: rect(".brand"),
              actions: rect(".masthead-actions"),
              h1: rect(".doc-main h1"),
              pager: rect(".pager"),
              sidebar: rect(".doc-sidebar"),
              rail: rect(".page-contents"),
              collapse: rect(".onthispage-collapse"),
              table: tableNode ? { ...rect(".doc-main .prose table"), scrollWidth: tableNode.scrollWidth, clientWidth: tableNode.clientWidth } : null,
            },
            nav: {
              sidebarLinks: navLinks.length,
              sidebarHidden: getComputedStyle(document.querySelector(".doc-sidebar")).display === "none",
              browseHidden: getComputedStyle(document.querySelector(".browse-docs")).display === "none",
              collapseHidden: getComputedStyle(document.querySelector(".onthispage-collapse")).display === "none",
              activeAriaCurrent: active?.getAttribute("aria-current") === "page",
              activeRuleWidth: activeBefore?.width,
              activeRuleHeight: activeBefore?.height,
              activeRuleColor: activeBefore?.backgroundColor,
              activeColor: active ? getComputedStyle(active).color : null,
            },
            toc: {
              h2Count: document.querySelectorAll(".doc-main .prose h2").length,
              railLinkCount: tocLinks.length,
              railHidden: getComputedStyle(document.querySelector(".page-contents")).display === "none",
              collapseLinkCount: collapseLinks.length,
            },
            measure: {
              proseMaxWidth: getComputedStyle(proseNode).maxWidth,
              tableWidth: tableNode ? getComputedStyle(tableNode).width : null,
            },
            colors: {
              bodyBackground: getComputedStyle(document.body).backgroundColor,
              mutedLink: getComputedStyle(document.querySelector('.doc-sidebar .nav-link:not([aria-current="page"])')).color,
              activeLinkColor: active ? getComputedStyle(active).color : null,
            },
            wide,
            desktop,
          };
        }, { wide, desktop });

        assert.ok(Object.values(actual.fonts).every(Boolean), "font loading");
        assert.equal(actual.overflow, false, "horizontal overflow");
        // Masthead stays one deliberate row (compare vertical centers:
        // the compact lockup stacks, so heights legitimately differ).
        const center = (g) => g.y + g.height / 2;
        assert.ok(
          Math.abs(center(actual.geometry.brand) - center(actual.geometry.actions)) <= 2,
          "masthead single row",
        );
        // Sidebar/rail visibility contract.
        assert.equal(actual.nav.sidebarHidden, !desktop, "sidebar visibility");
        assert.equal(actual.nav.browseHidden, desktop, "browse disclosure visibility");
        assert.equal(actual.nav.collapseHidden, desktop, "on-this-page collapse visibility");
        assert.equal(actual.toc.railHidden, !wide, "contents rail visibility");
        if (desktop) {
          assert.equal(actual.nav.activeAriaCurrent, true, "active document marked");
          assert.equal(actual.nav.activeRuleWidth, "24px", "active short rule width");
          assert.equal(actual.nav.activeRuleHeight, "2px", "active short rule height");
          assert.match(actual.nav.activeRuleColor, /rgba?\(/);
          assert.ok(!actual.nav.activeRuleColor.includes("0, 0, 0, 0"), "active rule visible");
          assert.ok(actual.nav.sidebarLinks > 0, "sidebar populated");
        }
        if (wide) {
          assert.equal(actual.toc.railLinkCount, actual.toc.h2Count, "rail derives from real H2s");
          assert.ok(actual.toc.h2Count > 0, "fixture pages have H2 sections");
        } else {
          assert.ok(actual.toc.collapseLinkCount === 0 || actual.toc.collapseLinkCount === actual.toc.h2Count, "collapse derives from real H2s");
        }
        // Dense-page wide-region release: the table spans the document
        // column, which at wide desktop exceeds the rendered prose measure.
        if (key === "dense" && desktop) {
          const proseWidth = await p.evaluate(() => document.querySelector(".doc-main .prose").getBoundingClientRect().width);
          assert.ok(
            parseFloat(actual.measure.tableWidth) >= proseWidth,
            `table uses the document column (${actual.measure.tableWidth} vs prose ${proseWidth}px)`,
          );
          assert.ok(
            parseFloat(actual.measure.tableWidth) > 0,
            "table width computed",
          );
        }
        // Theme only changes colors, never geometry.
        if (firstGeometry) assert.deepEqual(actual.geometry, firstGeometry, "light/dark geometry parity");
        else firstGeometry = actual.geometry;
        // Contrast spot checks.
        const cNav = contrast(actual.colors.mutedLink, actual.colors.bodyBackground);
        const cActive = contrast(actual.colors.activeLinkColor ?? actual.colors.mutedLink, actual.colors.bodyBackground);
        assert.ok(cNav >= 4.5, `nav link contrast ${cNav.toFixed(2)}`);
        assert.ok(cActive >= 4.5, `active link contrast ${cActive.toFixed(2)}`);

        const suffix = `${theme}-${viewport.width}x${viewport.height}`;
        // Full-page capture before keyboard interaction so the skip link
        // is in its resting (off-canvas) state.
        await p.screenshot({ path: resolve(evidence, `${key}-${suffix}.png`), fullPage: true });

        // Keyboard: skip link first, focus ring on a sidebar link.
        await p.keyboard.press("Tab");
        assert.ok(
          await p.evaluate(() => document.activeElement?.classList.contains("skip-link")),
          "skip link is first tab stop",
        );
        if (desktop) {
          await p.locator(".masthead-actions a").focus();
          await p.keyboard.press("Tab"); // into the sidebar's first link
          const focus = await p.evaluate(() => {
            const el = document.activeElement;
            const s = getComputedStyle(el);
            return {
              inSidebar: el.closest(".doc-sidebar") !== null,
              isLink: el.classList.contains("nav-link"),
              width: s.outlineWidth,
              offset: s.outlineOffset,
              visible: el.matches(":focus-visible"),
            };
          });
          assert.ok(focus.inSidebar && focus.isLink, "tab reaches sidebar links");
          assert.equal(focus.width, "2px", "focus ring width");
          assert.equal(focus.offset, "2px", "focus ring offset");
          assert.ok(focus.visible, "focus-visible ring");
        }

        if (!desktop) {
          // Browse disclosure operates; panel mirrors the sidebar model.
          await p.locator(".browse-docs summary").click();
          assert.ok(await p.locator(".browse-docs").evaluate((n) => n.open), "drawer opens");
          const panelLinks = await p.locator(".browse-panel .nav-link").count();
          assert.equal(panelLinks, actual.nav.sidebarLinks, "drawer mirrors sidebar model");
        }
        if (viewport.width === 1440) {
          await p.locator(".masthead").screenshot({ path: resolve(evidence, `masthead-${theme}-1440.png`) });
          await p.locator(".doc-sidebar").screenshot({ path: resolve(evidence, `sidebar-${theme}-1440.png`) });
        }
        if (viewport.width === 390 && !desktop) {
          // Drawer-open retained evidence shot.
          await p.screenshot({ path: resolve(evidence, `drawer-${theme}-390.png`), fullPage: false });
        }

        assert.deepEqual(errors, [], "browser console/network");
        report.captures.push({
          page: key,
          viewport: `${viewport.width}x${viewport.height}`,
          theme,
          file: `${key}-${suffix}.png`,
          nav: actual.nav,
          toc: actual.toc,
          contrast: { nav: +cNav.toFixed(2), active: +cActive.toFixed(2) },
          errors,
        });
        await context.close();
      }
    }
  }

  await writeFile(resolve(evidence, "verification.json"), JSON.stringify(report, null, 2) + "\n");
  const count = report.captures.length;
  console.log(
    `Docs shell frame verification passed: ${count} combinations, masthead one-row, sidebar/rail visibility contract, light/dark geometry parity, wide-region tables (dense), fonts, focus ring, contrast, no overflow or console/network failures.`,
  );
} finally {
  await browser.close();
  server.stop();
}
