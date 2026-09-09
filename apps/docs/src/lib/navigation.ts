/**
 * The single navigation model for the docs.
 *
 * One derived source feeds every navigation surface — the grouped
 * sidebar, the mobile "Browse documentation" panel, previous/next
 * links, the section overview pages, and the `llms.txt` ordering — so
 * they cannot drift. Destinations come from the content collections
 * (draft entries excluded, `order` then title — the same sort the
 * clean-Markdown pipeline documents) plus the two shell routes.
 *
 * The reading order is flat and site-wide: Getting started first, then
 * each section's Overview followed by its pages in `order`. Paths are
 * site-absolute and must go through `withBase()` at render time (see
 * `src/lib/base.ts`).
 */
import { getCollection } from "astro:content";
import { normalizePath, withBase } from "./base";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  /** The section overview route (/foundations, /components, ...). */
  href: string;
  pages: NavLink[];
}

export interface DocsNav {
  /** Lead-in above the groups; item 0 of the reading order. */
  leadIn: NavLink;
  groups: NavGroup[];
  /** The maintained reading order, flat across the whole site. */
  readingOrder: NavLink[];
}

type DocKind = "foundations" | "components" | "patterns" | "reference";

export type { DocKind };

const KINDS: readonly DocKind[] = ["foundations", "components", "patterns", "reference"];

export function groupLabel(kind: DocKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

async function kindPages(kind: DocKind): Promise<NavLink[]> {
  const entries = await getCollection(kind, ({ data }) => !data.draft);
  const ordered = [...entries].sort(
    (a, b) =>
      (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
      a.data.title.localeCompare(b.data.title),
  );
  return ordered.map((entry) => ({ label: entry.data.title, href: `/${kind}/${entry.id}` }));
}

/** Build the full navigation model from the content collections. */
export async function getDocsNav(): Promise<DocsNav> {
  const groups: NavGroup[] = [];
  const readingOrder: NavLink[] = [{ label: "Getting started", href: "/getting-started" }];
  for (const kind of KINDS) {
    const label = groupLabel(kind);
    const href = `/${kind}`;
    const overview: NavLink = { label: "Overview", href };
    const pages = await kindPages(kind);
    groups.push({ label, href, pages });
    readingOrder.push(overview, ...pages);
  }
  return { leadIn: readingOrder[0], groups, readingOrder };
}

/** The nav entry for the current page, by exact route match. */
export function activeNavLink(nav: DocsNav, currentPath: string): NavLink | undefined {
  const current = normalizePath(currentPath);
  return nav.readingOrder.find((item) => normalizePath(withBase(item.href)) === current);
}

/** Previous/next documents from the maintained reading order. */
export function pagerFor(nav: DocsNav, currentPath: string): { previous?: NavLink; next?: NavLink } {
  const current = normalizePath(currentPath);
  const index = nav.readingOrder.findIndex(
    (item) => normalizePath(withBase(item.href)) === current,
  );
  if (index === -1) return {};
  return {
    previous: nav.readingOrder[index - 1],
    next: nav.readingOrder[index + 1],
  };
}
