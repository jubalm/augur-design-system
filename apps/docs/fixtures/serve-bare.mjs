/**
 * Static server for the bare package host (issue #73).
 *
 * Serves the repository root so
 * `packages/design-system/fixtures/bare-hosts.html` — standalone markup plus
 * the package's real source CSS and fonts, with zero docs CSS — can load.
 * Used by the specimen-parity (#44) and standalone-consumer (#53) checks.
 * The port is passed in by playwright.config.ts (PW_BARE_PORT).
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const port = Number(process.env.PW_BARE_PORT ?? 4400);

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
}).listen(port, "127.0.0.1");
console.log(`bare-host static server on http://127.0.0.1:${port}`);
