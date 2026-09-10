/**
 * Playwright configuration for the docs browser verification suite (#73).
 *
 * Scope: browser-level behavior of the built docs app and the bare package
 * host. Unit-level behavior stays in the root Vitest suite (`vitest.config.ts`).
 *
 * Usage (from the repository root, after `bun run --cwd apps/docs build`):
 *
 *     bunx playwright test                      # full suite
 *     bunx playwright test --grep "dialog"      # one area
 *     bunx playwright test --workers 4          # override parallelism
 *     DOCS_BASE_PATH=/augur-design-system bunx playwright test
 *
 * Two static servers run for the duration: the built docs app
 * (apps/docs/fixtures/serve.mjs, honoring DOCS_BASE_PATH) and the bare
 * package host (apps/docs/fixtures/serve-bare.mjs).
 *
 * Ports are owned here. PW_ORIGIN_PORT / PW_BARE_PORT override them; otherwise
 * a default is derived from the repository path so separate worktrees can run
 * the suite concurrently without colliding. The resolved ports are passed to
 * the servers (webServer.env) and to the specs (process.env, inherited by the
 * workers; see apps/docs/fixtures/browser/helpers.ts).
 */
import { createHash } from "node:crypto";
import { defineConfig } from "@playwright/test";

function envPort(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be a port between 1 and 65535, got: ${JSON.stringify(raw)}`);
  }
  return value;
}

const derivedDocsPort = 30000 + (createHash("sha1").update(process.cwd()).digest().readUInt16BE(0) % 10000) * 2;
const DOCS_PORT = envPort("PW_ORIGIN_PORT", derivedDocsPort);
const BARE_PORT = envPort("PW_BARE_PORT", DOCS_PORT + 1);

// Exported to the worker processes so the specs agree with the servers.
process.env.PW_ORIGIN_PORT = String(DOCS_PORT);
process.env.PW_BARE_PORT = String(BARE_PORT);

export default defineConfig({
  testDir: "./apps/docs/fixtures/browser",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${DOCS_PORT}`,
  },
  webServer: [
    {
      command: "bun apps/docs/fixtures/serve.mjs",
      port: DOCS_PORT,
      env: { PW_ORIGIN_PORT: String(DOCS_PORT) },
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "bun apps/docs/fixtures/serve-bare.mjs",
      port: BARE_PORT,
      env: { PW_BARE_PORT: String(BARE_PORT) },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
