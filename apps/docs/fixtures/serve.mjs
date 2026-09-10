/**
 * Static server for the built docs app (issue #73).
 *
 * `@playwright/test` owns process lifecycle through the `webServer` entry in
 * playwright.config.ts, so this only needs to serve files. The port is passed
 * in by the config (PW_ORIGIN_PORT) so the config, the specs, and this server
 * agree.
 *
 * `DOCS_BASE_PATH` is served by stripping the base prefix from the request
 * path and resolving the remainder against `apps/docs/dist`. Nothing is
 * copied, so there is no staged tree to clean up; a request outside the
 * configured base is a 404.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
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

createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (sitePrefix) {
      if (path !== sitePrefix && !path.startsWith(`${sitePrefix}/`)) throw new Error("outside base");
      path = path.slice(sitePrefix.length) || "/";
    }
    if (path.endsWith("/")) path += "index.html";
    let file = join(distDir, path);
    if (!file.startsWith(distDir)) throw new Error("traversal");
    try {
      const s = await stat(file);
      if (!s.isFile()) file = join(distDir, path, "index.html"); // extensionless directory URL
    } catch {
      file = join(distDir, path, "index.html");
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
