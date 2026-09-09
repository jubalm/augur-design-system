/**
 * Clean-Markdown endpoints.
 *
 * One static endpoint generates the predictable `.md` representation for
 * every substantive docs page, from the same sources the rendered routes
 * use (see src/lib/markdown.ts):
 *
 *   /foundations/<slug>.md   ← src/content/foundations/<slug>.md(x)
 *   /components/<slug>.md    ← src/content/components/<slug>.md(x)
 *   /patterns/<slug>.md      ← src/content/patterns/<slug>.md(x)
 *   /reference/<slug>.md     ← src/content/reference/<slug>.md(x)
 *   /foundations.md          ← section overview, and the
 *   /components.md             other three kinds likewise
 *   /getting-started.md      ← src/pages/getting-started.mdx (?raw)
 *
 * Draft entries are excluded here exactly as the page routes exclude
 * them, so the two representations stay in lockstep. Derivation errors
 * (unrepresentable MDX, unregistered components, unbalanced fences) fail
 * the build instead of publishing lossy output.
 *
 * The home page (`/`) is landing chrome, not documentation, and gets no
 * `.md` representation (documented decision; see
 * src/content/README.md, "Markdown parity and llms.txt").
 */
import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";
import gettingStartedRaw from "./getting-started.mdx?raw";
import { cleanPageMarkdown, mdxPageSource } from "../lib/markdown";
import { getSectionOverview } from "../lib/sections";

type DocKind = "foundations" | "components" | "patterns" | "reference";
type DocEntry = CollectionEntry<DocKind>;

const KINDS: readonly DocKind[] = ["foundations", "components", "patterns", "reference"];

/** Derive one collection entry's clean Markdown (component pages add the status line). */
function pageMarkdown(entry: DocEntry): string {
  const component = "component" in entry.data
    ? { exportName: entry.data.component, status: entry.data.status }
    : undefined;
  return cleanPageMarkdown({
    source: `${entry.collection}/${entry.id}`,
    title: entry.data.title,
    description: entry.data.description,
    component,
    body: entry.body ?? "",
  });
}

export async function getStaticPaths() {
  const paths: { params: { markdown: string }; props: { markdown: string } }[] = [];

  for (const kind of KINDS) {
    // Section overview: authored intro plus the collection-derived
    // reading order, from the same getSectionOverview() the page uses.
    const overview = await getSectionOverview(kind);
    const list = overview.items
      .map((item) => `- [${item.label}](${item.href}): ${item.description}`)
      .join("\n");
    paths.push({
      params: { markdown: `${kind}.md` },
      props: {
        markdown: cleanPageMarkdown({
          source: `${kind}/overview`,
          title: overview.title,
          description: overview.description,
          body: `${overview.intro}\n\n## Reading order\n\n${list}`,
        }),
      },
    });

    const entries = await getCollection(kind, ({ data }) => !data.draft);
    for (const entry of entries) {
      paths.push({
        params: { markdown: `${kind}/${entry.id}.md` },
        props: { markdown: pageMarkdown(entry) },
      });
    }
  }

  const gettingStarted = mdxPageSource(gettingStartedRaw, "getting-started");
  paths.push({
    params: { markdown: "getting-started.md" },
    props: {
      markdown: cleanPageMarkdown({ source: "getting-started", ...gettingStarted }),
    },
  });

  return paths;
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
