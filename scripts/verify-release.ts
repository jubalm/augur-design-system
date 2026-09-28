/**
 * Release verification (issue #4, RELEASING.md).
 *
 * Checks that the working tree is ready to be tagged as one immutable
 * design-system release:
 *
 *   bun scripts/verify-release.ts 0.1.0
 *   bun scripts/verify-release.ts --from-package
 *   bun scripts/verify-release.ts 0.1.0 --notes <file>   (also write release notes)
 *
 * It asserts that:
 *
 *   1. `packages/design-system/package.json` carries the version;
 *   2. `CHANGELOG.md` has a dated `## [X.Y.Z] - YYYY-MM-DD` section that is the
 *      newest release, below an `## Unreleased` section;
 *   3. every `registryDependencies` address in `registry.json` and
 *      `public/r/*.json` is stamped `#vX.Y.Z`;
 *   4. the tag `vX.Y.Z` exists neither locally nor on `origin` (tags are
 *      immutable; a bad release is superseded by a new one, never retagged).
 *
 * Generated-artifact drift, schema validation and the consumer smoke are
 * separate gates (`registry:check`, `registry:validate`, consumer-smoke) that
 * the release workflow runs alongside this script.
 */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

const args = process.argv.slice(2);
const notesIndex = args.indexOf("--notes");
const notesFile = notesIndex >= 0 ? args[notesIndex + 1] : undefined;
const packageVersion: string = JSON.parse(read("packages/design-system/package.json")).version;
const requested = args.includes("--from-package")
  ? packageVersion
  : args.find((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--notes");

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

if (!requested) {
  console.error("usage: bun scripts/verify-release.ts <X.Y.Z> | --from-package [--notes <file>]");
  process.exit(2);
}
const version = requested.replace(/^v/, "");
const tag = `v${version}`;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`FAIL: "${requested}" is not a semantic version (X.Y.Z)`);
  process.exit(2);
}

// 1. Package metadata ---------------------------------------------------------
if (packageVersion !== version) {
  fail(`packages/design-system/package.json version is ${packageVersion}, expected ${version}`);
}

// 2. Changelog -----------------------------------------------------------------
const changelog = read("CHANGELOG.md");
const headings = [...changelog.matchAll(/^## (.+)$/gm)].map((m) => ({ text: m[1].trim(), index: m.index! }));
const releaseHeadings = headings.filter((h) => h.text.startsWith("["));
const unreleased = headings.find((h) => h.text === "Unreleased");
const section = headings.find((h) => new RegExp(`^\\[${version.replace(/\./g, "\\.")}\\] - (\\d{4}-\\d{2}-\\d{2})$`).test(h.text));
if (!unreleased) fail("CHANGELOG.md has no `## Unreleased` section");
if (!section) {
  fail(`CHANGELOG.md has no dated \`## [${version}] - YYYY-MM-DD\` section`);
} else {
  if (releaseHeadings[0] !== section) fail(`CHANGELOG.md: [${version}] is not the newest release section`);
  if (unreleased && unreleased.index > section.index) fail("CHANGELOG.md: `## Unreleased` must sit above the release sections");
}

// 3. Registry dependency stamps ------------------------------------------------
const artifacts = ["registry.json", ...readdirSync(path.join(ROOT, "public/r")).sort().map((f) => `public/r/${f}`)];
for (const file of artifacts) {
  const json = JSON.parse(read(file));
  const items: { name: string; registryDependencies?: string[] }[] = json.items ?? [json];
  for (const item of items) {
    for (const dep of item.registryDependencies ?? []) {
      if (!dep.endsWith(`#${tag}`)) fail(`${file} (${item.name}): dependency "${dep}" is not stamped #${tag}`);
    }
  }
}

// 4. Tag immutability ----------------------------------------------------------
const git = (...gitArgs: string[]) =>
  execFileSync("git", gitArgs, { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
if (git("tag", "--list", tag).trim()) fail(`tag ${tag} already exists locally`);
try {
  if (git("ls-remote", "--tags", "origin", `refs/tags/${tag}`).trim()) fail(`tag ${tag} already exists on origin`);
} catch {
  fail("could not query origin for existing tags (git ls-remote failed)");
}

if (failures.length) {
  for (const message of failures) console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (notesFile && section) {
  const next = headings.find((h) => h.index > section.index);
  const body = changelog.slice(changelog.indexOf("\n", section.index) + 1, next?.index).trim();
  writeFileSync(notesFile, `${body}\n`);
  console.log(`wrote release notes for ${tag} to ${notesFile}`);
}
console.log(`PASS: ready to release ${tag}`);
