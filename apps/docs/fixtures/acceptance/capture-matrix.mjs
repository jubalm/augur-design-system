/**
 * Full acceptance matrix capture (issue #53).
 *
 * Captures every substantive docs route in both themes at the three
 * contract viewports (1440×1000, 768×1024, 390×844) and writes a
 * verification summary JSON recording, per combination: loaded font
 * faces, computed title voice, horizontal overflow, and console/network
 * cleanliness. Run against a built site:
 *
 *     bun run --cwd apps/docs build
 *     bun apps/docs/fixtures/acceptance/capture-matrix.mjs [outDir]
 *
 * Default outDir is /tmp/augur-acceptance-matrix. The retained repo
 * evidence lives in the per-issue fixture evidence folders (curated); this
 * runner exists so the maintainer can regenerate the FULL matrix
 * locally for visual acceptance without bloating the repository.
 */
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";

const repoRoot = join(import.meta.dirname, "..", "..", "..", "..");
const distDir = join(repoRoot, "apps", "docs", "dist");
const outDir = process.argv[2] || "/tmp/augur-acceptance-matrix";

const ROUTES = [
  "/",
  "/getting-started",
  "/foundations/decisions",
  "/foundations/fonts",
  "/foundations/identity",
  "/foundations/theming",
  "/foundations/color",
  "/foundations/proposals",
  "/foundations/visual-direction",
  "/components/button",
  "/components/card",
  "/components/dialog",
  "/components/input",
  "/patterns/page-header",
  "/patterns/form-field",
  "/patterns/empty-state",
  "/patterns/reference-record",
  "/reference/package-entries",
  "/reference/contributing",
  "/reference/component-conventions",
];
const THEMES = ["light", "dark"];
const VIEWPORTS = [
  ["1440x1000", { width: 1440, height: 1000 }],
  ["768x1024", { width: 768, height: 1024 }],
  ["390x844", { width: 390, height: 844 }],
];

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  let body = null, type = "application/octet-stream";
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (p.endsWith("/")) p += "index.html";
    let f = join(distDir, p);
    try { const s = await stat(f); if (!s.isFile()) f = join(distDir, p, "index.html"); } catch { f = join(distDir, p, "index.html"); }
    body = await readFile(f); type = MIME[extname(f)] ?? type;
  } catch { body = Buffer.from("not found"); }
  res.writeHead(200, { "content-type": type });
  res.end(body);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await import("playwright");
const browser = await chromium.launch();
await mkdir(outDir, { recursive: true });

const summary = { generatedFrom: distDir, routes: ROUTES.length, themes: THEMES.length, viewports: VIEWPORTS.map(([n]) => n), combinations: [] };
let failures = 0;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const [vpName, viewport] of VIEWPORTS) {
      const page = await browser.newPage({ viewport });
      const consoleIssues = [];
      page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleIssues.push(m.text()); });
      const failed = [];
      page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
      await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (theme === "dark") await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
      await page.waitForTimeout(120);
      const evidence = await page.evaluate(() => ({
        faces: document.fonts.size,
        sora400: document.fonts.check("16px Sora"),
        schibsted: document.fonts.check("16px 'Schibsted Grotesk'"),
        titleVoice: (() => { const h = document.querySelector("h1"); return h ? `${getComputedStyle(h).fontFamily.split(",")[0]} ${getComputedStyle(h).fontWeight}` : null; })(),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      }));
      const name = `${route.replace(/\//g, "_") || "home"}-${theme}-${vpName}`.replace(/^_/, "");
      await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
      const ok = consoleIssues.length === 0 && failed.length === 0 && !evidence.overflowX && evidence.sora400 && evidence.schibsted;
      if (!ok) failures += 1;
      summary.combinations.push({ route, theme, viewport: vpName, capture: `${name}.png`, consoleIssues, failedResponses: failed, ...evidence, pass: ok });
      await page.close();
    }
  }
}

await writeFile(join(outDir, "verification-summary.json"), JSON.stringify(summary, null, 2));
console.log(`captured ${summary.combinations.length} combinations -> ${outDir}`);
console.log(`failures: ${failures}`);
await browser.close();
server.close();
if (failures > 0) process.exit(1);
