/**
 * Controlled content-failure verification for the docs app (issue #8).
 *
 * Proves that invalid required metadata and component pages that break
 * the section contract FAIL the production build with clear, actionable
 * errors — the docs-side analogue of `tokens:verify-failures` (#3) and
 * the registry invalid fixtures (#16). The deliberate fixtures live in
 * `fixtures/content/invalid/`; this script stages each one into the
 * real content tree, builds, asserts the failure and its message, and
 * removes the fixture again (win or lose).
 *
 * Usage (from the repository root):
 *
 *     bun apps/docs/fixtures/verify-content-failures.mjs
 *
 * Exit code 0 = both invalid fixtures failed the build exactly as
 * required; 1 = any check failed.
 */
import { spawnSync } from "node:child_process";
import { copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(docsRoot, "..", "..");
const fixturesDir = join(docsRoot, "fixtures", "content", "invalid");

const failures = [];
const ok = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(label);
};

/**
 * Remove both content-layer caches (`apps/docs/.astro` and
 * `apps/docs/node_modules/.astro`, the data store). Astro caches
 * deferred content modules and store entries there; stale entries for
 * a removed fixture would leak into the NEXT build, so the caches are
 * cleared both before AND after each scenario build (a crashed previous
 * run, a regular build run just before this script, or a prior
 * scenario could otherwise leave store state that makes CI outcomes
 * depend on execution order). Clearing forces a fresh sync (~0.5s).
 */
function clearCaches() {
  return Promise.all([
    rm(join(docsRoot, ".astro"), { recursive: true, force: true }),
    rm(join(docsRoot, "node_modules", ".astro"), { recursive: true, force: true }),
  ]);
}

/**
 * Build apps/docs with a staged invalid fixture in place; return output.
 * The fixture AND both caches are removed again afterwards in all cases.
 */
function buildWith(contentPath, fixtureFile) {
  return clearCaches()
    .then(() => copyFile(join(fixturesDir, fixtureFile), join(docsRoot, contentPath)))
    .then(() => {
      const result = spawnSync("bun", ["run", "--cwd", "apps/docs", "build"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { status: result.status, output: `${result.stdout ?? ""}\n${result.stderr ?? ""}` };
    })
    .finally(() =>
      Promise.all([rm(join(docsRoot, contentPath), { force: true }), clearCaches()]),
    );
}

console.log("\n== Scenario 1: foundations entry missing required `title` metadata ==");
{
  const { status, output } = await buildWith(
    join("src", "content", "foundations", "broken-metadata.md"),
    "broken-metadata.md",
  );
  ok("build fails (non-zero exit)", status !== 0, `exit ${status}`);
  ok("error names the invalid entry", /broken-metadata/.test(output));
  ok("error names the missing required field (title)", /title/i.test(output));
  if (failures.length === 0) {
    const line = output.split("\n").find((l) => /broken-metadata/i.test(l));
    console.log(`      observed: ${line.trim()}`);
  } else {
    console.log(output.split("\n").slice(-25).join("\n"));
  }
}

console.log("\n== Scenario 2: component page missing required section headings ==");
{
  const { status, output } = await buildWith(
    join("src", "content", "components", "missing-sections.mdx"),
    "missing-sections.mdx",
  );
  ok("build fails (non-zero exit)", status !== 0, `exit ${status}`);
  ok("error names the invalid entry", /missing-sections/.test(output));
  ok("error names a missing required section (When not to use)", /When not to use/.test(output));
  if (failures.length === 0) {
    const line = output.split("\n").find((l) => /missing-sections/.test(l) && /When not to use/.test(l));
    console.log(`      observed: ${line ? line.trim() : "(message present but not on one line)"}`);
  } else {
    console.log(output.split("\n").slice(-25).join("\n"));
  }
}

console.log("");
// The failing builds may have partially overwritten `dist` — remove it so
// no consumer mistakes a post-verification tree for a successful build.
await rm(join(docsRoot, "dist"), { recursive: true, force: true });
if (failures.length > 0) {
  console.error(`${failures.length} content-failure check(s) did not behave as required`);
  process.exit(1);
}
console.log("content failure verification passed: invalid metadata and section gaps fail the build clearly");
