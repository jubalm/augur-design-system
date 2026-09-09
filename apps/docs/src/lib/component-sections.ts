/**
 * Component-page section contract.
 *
 * Every page in the `components` collection must cover the sections
 * below as H2 headings in its body, mirroring the component page
 * outline in ARCHITECTURE.md ("Documentation Website") and the
 * acceptance criteria. The page renderer enforces this at build time so
 * an incomplete component page fails the build with a clear message
 * instead of silently publishing gaps.
 *
 * Presence is enforced, not order — but the listed order is the
 * recommended page order. Extra H2 sections (e.g. "Examples") are
 * allowed.
 */

/**
 * Required H2 headings on every component page, in recommended order.
 * Single source of truth: the renderer assertion, the failure-proof
 * fixture, and `src/content/README.md` all derive from this list.
 */
export const REQUIRED_COMPONENT_SECTIONS: readonly string[] = [
  "When to use",
  "When not to use",
  "Variants",
  "Sizes",
  "States",
  "Accessibility",
  "API",
  "Design rationale",
] as const;

/** Extract the H2 heading texts from a Markdown/MDX body. */
function h2Headings(body: string): string[] {
  const headings: string[] = [];
  for (const line of body.split("\n")) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) headings.push(match[1]);
  }
  return headings;
}

/**
 * Assert that a component-page body covers every required section.
 * Throws with the entry id and the missing headings listed explicitly —
 * the error text is asserted by `fixtures/verify-content-failures.mjs`.
 */
export function assertComponentSections(body: string, entryId: string): void {
  const present = new Set(h2Headings(body).map((h) => h.trim().toLowerCase()));
  const missing = REQUIRED_COMPONENT_SECTIONS.filter((s) => !present.has(s.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(
      `Component page "components/${entryId}" is missing required section heading(s): ` +
        missing.map((s) => `"${s}"`).join(", ") +
        `. Every component page must cover: ${REQUIRED_COMPONENT_SECTIONS.join(", ")}. ` +
        "See apps/docs/src/content/README.md for the component-page contract.",
    );
  }
}
