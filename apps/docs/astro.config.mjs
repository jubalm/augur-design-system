/**
 * Astro configuration for the Augur design system documentation (issue #7).
 *
 * Plain Astro with React and MDX integrations — deliberately no Starlight
 * or other docs framework layer (ARCHITECTURE.md, "Documentation Website").
 *
 * Deployment base (issue #7 acceptance: repository subpaths AND a future
 * custom-domain root):
 *
 *   - Default build uses base "/" — a custom-domain root deployment.
 *   - A repository-subpath deployment (e.g. a GitHub Pages project site)
 *     sets DOCS_BASE_PATH, e.g.:
 *
 *       DOCS_BASE_PATH=/augur-design-system bun run --cwd apps/docs build
 *
 * All internal links and public-asset references go through
 * `src/lib/base.ts#withBase()` so both modes work without source changes.
 * Hosting activation itself is out of scope (#19/#20).
 */
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const rawBase = process.env.DOCS_BASE_PATH?.trim();
if (rawBase !== undefined && rawBase !== "" && !/^\/[\w.-]+(\/[\w.-]+)*$/.test(rawBase.replace(/\/+$/, ""))) {
  throw new Error(
    `DOCS_BASE_PATH must be a root-relative path starting with "/" (e.g. "/augur-design-system"), got: ${JSON.stringify(rawBase)}`,
  );
}

const base = rawBase === undefined || rawBase === "" ? "/" : rawBase.replace(/\/+$/, "");

export default defineConfig({
  base,
  trailingSlash: "never",
  integrations: [react(), mdx()],
});
