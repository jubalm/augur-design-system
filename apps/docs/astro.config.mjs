/**
 * Astro configuration for the Augur design system documentation.
 *
 * Plain Astro with React and MDX integrations — deliberately no Starlight
 * or other docs framework layer (ARCHITECTURE.md, "Documentation Website").
 *
 * Deployment base (acceptance: repository subpaths AND a future
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
 * Hosting activation itself is out of scope.
 */
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const rawBase = process.env.DOCS_BASE_PATH?.trim();
if (rawBase !== undefined && rawBase !== "" && !/^\/[\w.-]+(\/[\w.-]+)*$/.test(rawBase.replace(/\/+$/, ""))) {
  throw new Error(
    `DOCS_BASE_PATH must be a root-relative path starting with "/" (e.g. "/augur-design-system"), got: ${JSON.stringify(rawBase)}`,
  );
}

const base = rawBase === undefined || rawBase === "" ? "/" : rawBase.replace(/\/+$/, "");

function baseLinkMdastPlugin(prefix) {
  return {
    name: "augur-base-links",
    link(node) {
      if (typeof node.url === "string" && node.url.startsWith("/") && !node.url.startsWith("//")) {
        return { ...node, url: `${prefix}${node.url}` };
      }
    },
  };
}

export default defineConfig({
  base,
  trailingSlash: "never",
  // Sätteri (Astro 7's Markdown/MDX processor) drives both content
  // collections and MDX pages, so rendered HTML body links are base-prefixed
  // under a repository subpath. The .md representations intentionally keep
  // site-absolute links (llms.txt convention) and are synthesized
  // from source, not through this processor.
  markdown: {
    processor: satteri({ mdastPlugins: [baseLinkMdastPlugin(base === "/" ? "" : base)] }),
  },
  integrations: [react(), mdx()],
});
