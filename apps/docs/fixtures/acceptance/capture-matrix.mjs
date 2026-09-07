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
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";

const repoRoot = join(import.meta.dirname, "..", "..", "..", "..");
const distDir = join(repoRoot, "apps", "docs", "dist");
const outDir = process.argv[2] || "/tmp/augur-acceptance-matrix";

const ROUTES = [
  "/",
  "/getting-started",
  "/foundations",
  "/components",
  "/patterns",
  "/reference",
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
  "/proposal-review",
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
  let body = null, type = "application/octet-stream", status = 200;
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (p.endsWith("/")) p += "index.html";
    let f = join(distDir, p);
    try { const s = await stat(f); if (!s.isFile()) f = join(distDir, p, "index.html"); } catch { f = join(distDir, p, "index.html"); }
    body = await readFile(f); type = MIME[extname(f)] ?? type;
  } catch { status = 404; body = Buffer.from("not found"); }
  res.writeHead(status, { "content-type": type });
  res.end(body);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await import("playwright");
const browser = await chromium.launch();
await mkdir(outDir, { recursive: true });

const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
const sourceDiff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot });
const summary = { sourceCommit, sourceDiffSha256: createHash("sha256").update(sourceDiff).digest("hex"), dirty: sourceDiff.length > 0, capturedAt: new Date().toISOString(), generatedFrom: distDir, routes: ROUTES.length, themes: THEMES.length, viewports: VIEWPORTS.map(([n]) => n), combinations: [] };
let failures = 0;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const [vpName, viewport] of VIEWPORTS) {
      const page = await browser.newPage({ viewport });
      const consoleIssues = [];
      page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleIssues.push(m.text()); });
      const failed = [];
      page.on("pageerror", (error) => consoleIssues.push(error.message));
      page.on("requestfailed", (request) => failed.push(`${request.url()}: ${request.failure()?.errorText}`));
      page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
      await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
      await page.waitForTimeout(120);
      const evidence = await page.evaluate(() => ({
        faces: [...document.fonts].filter(f => f.status === "loaded").map(f => `${f.family} ${f.weight}`),
        actualTheme: document.documentElement.dataset.theme,
        sora400: document.fonts.check("16px Sora"),
        schibsted: document.fonts.check("16px 'Schibsted Grotesk'"),
        titleVoice: (() => { const h = document.querySelector("h1"); return h ? `${getComputedStyle(h).fontFamily.split(",")[0]} ${getComputedStyle(h).fontWeight}` : null; })(),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      }));
      const name = `${route.replace(/\//g, "_") || "home"}-${theme}-${vpName}`.replace(/^_/, "");
      await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
      const detail = route === '/foundations/fonts' ? '.type-specimen-grid' : route === '/patterns/reference-record' ? '.example-record-field' : route === '/proposal-review' ? '.proposal-review-page' : null;
      if (detail) await page.locator(detail).screenshot({path:join(outDir,`${name}-detail.png`)});
      const ok = consoleIssues.length === 0 && failed.length === 0 && !evidence.overflowX && evidence.sora400 && evidence.schibsted && evidence.actualTheme === theme && evidence.faces.some(f => f.includes("Sora")) && evidence.faces.some(f => f.includes("Schibsted"));
      if (!ok) failures += 1;
      summary.combinations.push({ route, theme, viewport: vpName, capture: `${name}.png`, consoleIssues, failedResponses: failed, ...evidence, pass: ok });
      if (route === "/components/dialog") {
        const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
        await trigger.focus();
        const deadline = Date.now() + 15000;
        for (;;) {
          await page.keyboard.press('Enter');
          try { await page.getByRole('dialog').waitFor({timeout:500}); break; }
          catch { if(Date.now()>deadline) throw new Error('Dialog did not hydrate/open'); }
        }
        const dialog = await page.locator('.aug-dialog-content').evaluate(el => {
          const rect = el.getBoundingClientRect(), cs = getComputedStyle(el);
          return { width: rect.width, height: rect.height, inViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight, animation: cs.animationName };
        });
        await page.screenshot({ path: join(outDir, `${name}-open.png`), fullPage: true });
        summary.combinations.at(-1).dialog = dialog;
        if (!dialog.inViewport || dialog.animation !== "none") failures++;
        await page.keyboard.press('Escape');
      }
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
