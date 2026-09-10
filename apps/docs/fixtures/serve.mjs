/**
 * Static server for the built docs app (issue #73).
 *
 * Replaces the staging/server block of the previous hand-rolled driver:
 * `@playwright/test` owns process lifecycle through the `webServer` entry in
 * playwright.config.ts, so this only needs to serve files.
 *
 * `DOCS_BASE_PATH` stages `apps/docs/dist` under the deployment base path
 * exactly as the deployment would (and as the previous driver did), so the
 * suite can be pointed at a repository-subpath build.
 */
import { createServer } from "node:http";
import { cp, mkdir, mkdtemp, readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const distDir = join(repoRoot, "apps", "docs", "dist");
const rawBase = process.env.DOCS_BASE_PATH?.trim() || "/";
const base = "/" + rawBase.split("/").filter(Boolean).join("/");
const sitePrefix = base === "/" ? "" : base;
const port = Number(process.env.PW_ORIGIN_PORT ?? 4399);

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

let serveRoot = distDir;
if (base !== "/") {
  serveRoot = await mkdtemp(join(tmpdir(), "augur-docs-stage-"));
  await mkdir(join(serveRoot, sitePrefix.slice(1)), { recursive: true });
  await cp(distDir, join(serveRoot, sitePrefix.slice(1)), { recursive: true });
}

createServer(async (req, res) => {
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
}).listen(port, "127.0.0.1");
console.log(`docs static server on http://127.0.0.1:${port} (base ${base})`);
