/**
 * Deployment-base helper for the docs app (issue #7).
 *
 * `import.meta.env.BASE_URL` reflects Astro's configured `base`
 * (see `astro.config.mjs`): "/" for a custom-domain root deployment, or a
 * repository subpath such as "/augur-design-system/" for a project-site
 * deployment. Every internal link and public-asset reference in the app
 * goes through `withBase()` so both modes work without source changes.
 *
 * Accepts site-absolute paths only ("", "/", or starting with "/").
 */
export function withBase(path: string): string {
  const raw = import.meta.env.BASE_URL;
  const base = raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw === "/" ? "" : raw;
  if (path === "/") {
    return base === "" ? "/" : `${base}/`;
  }
  if (!path.startsWith("/")) {
    throw new Error(`withBase() expects a site-absolute path (starting with "/"), got: ${JSON.stringify(path)}`);
  }
  return `${base}${path}`;
}

/** Normalize a pathname for comparison: no trailing slash. */
export function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** True when `current` is the page for nav `href` (or a child of it). */
export function isActivePath(current: string, href: string): boolean {
  const a = normalizePath(current);
  const b = normalizePath(withBase(href));
  return href === "/" ? a === b : a === b || a.startsWith(`${b}/`);
}
