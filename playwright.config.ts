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
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/docs/fixtures/browser",
  fullyParallel: true,
  // Default to Playwright's own heuristics; CI sets PW_WORKERS explicitly
  // because the 2-core runner default (1) under-uses an I/O-bound suite.
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : undefined,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PW_ORIGIN ?? "http://127.0.0.1:4399",
  },
  webServer: [
    {
      command: "bun apps/docs/fixtures/serve.mjs",
      port: 4399,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "bun apps/docs/fixtures/serve-bare.mjs",
      port: 4400,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
