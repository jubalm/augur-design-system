#!/usr/bin/env bun
/**
 * Schema validator for the registry contract fixtures (issue #16).
 *
 * Validates the minimal contract fixture against verbatim copies of the
 * official shadcn registry schemas (fetched 2026-09-04; SHA-256 provenance
 * recorded in this directory's README.md), and proves that deliberate
 * mutations fail validation. Mirrors the fail-closed style of
 * `packages/design-system/src/tools/generate-tokens.ts --prove-failure`.
 *
 * Setup (ajv is deliberately not a workspace dependency; same pattern as
 * the font fixture's linked playwright install — see ../README.md):
 *
 *   mkdir -p /tmp/augur-ajv && cd /tmp/augur-ajv
 *   bun init -y >/dev/null && bun add ajv@8.20.0
 *   ln -s /tmp/augur-ajv/node_modules \
 *         <repo>/packages/design-system/fixtures/registry/node_modules
 *
 * Run:
 *
 *   bun packages/design-system/fixtures/registry/validate-registry-fixtures.mjs
 *
 * Exit 0 only when every positive case validates AND every negative case
 * fails. The ajv version is enforced at runtime; a mismatch is fatal.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Exact pin per the repository pin policy (see docs/registry-contract.md).
// Upgrading ajv is a deliberate, reviewed change: bump here AND in the
// README setup command together.
const REQUIRED_AJV = "8.20.0";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!existsSync(join(here, "node_modules/ajv"))) {
  console.error(
    "ajv is not available. Follow the setup steps in the comment header of this file (linked node_modules, as for the font fixture).",
  );
  process.exit(1);
}

const installedAjv = JSON.parse(
  readFileSync(join(here, "node_modules/ajv/package.json"), "utf8"),
).version;
if (installedAjv !== REQUIRED_AJV) {
  console.error(
    `ajv version mismatch: installed ${installedAjv}, contract pins ${REQUIRED_AJV}. Install the pinned version.`,
  );
  process.exit(1);
}

const { default: Ajv } = require("ajv");

const readJson = (relative) =>
  JSON.parse(readFileSync(join(here, relative), "utf8"));

const metaSchema = readJson("schema/draft-07.meta-schema.json");
const registrySchema = readJson("schema/registry.schema.json");
const itemSchema = readJson("schema/registry-item.schema.json");

// strict: false is the ajv-recommended mode for draft-07 schemas (the
// draft-07 meta-schema itself uses constructs v8 strict mode rejects).
// validateFormats: false — no fixture property asserts a format, and the
// vendored meta-schema declares format keywords that ajv-formats (not
// installed here) would otherwise warn about.
const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });

// The vendored schema files are verbatim upstream bytes. Their identifiers
// do not resolve under ajv v8's default keys, and the registry (index)
// schema $refs the item schema by URL, so both are registered by exact
// URL key instead of editing the files:
ajv.addSchema(metaSchema, "https://json-schema.org/draft-07/schema#");
ajv.addSchema(itemSchema, "https://ui.shadcn.com/schema/registry-item.json");

const cases = [
  {
    file: "registry.fixture.json",
    schema: registrySchema,
    expect: "valid",
    note: "minimal root registry (index) instance",
  },
  {
    file: "registry-item.fixture.json",
    schema: itemSchema,
    expect: "valid",
    note: "minimal registry item instance (built-item form)",
  },
  {
    file: "invalid/registry-item.missing-type.json",
    schema: itemSchema,
    expect: "invalid",
    note: "mutation: required 'type' removed",
  },
  {
    file: "invalid/registry-item.font-without-metadata.json",
    schema: itemSchema,
    expect: "invalid",
    note: "mutation: type 'registry:font' without required 'font' metadata (allOf branch)",
  },
];

let failed = false;
for (const testCase of cases) {
  const data = readJson(testCase.file);
  const validate = ajv.compile(testCase.schema);
  const ok = validate(data);
  const verdict = ok ? "valid" : "invalid";
  const pass = verdict === testCase.expect;
  if (!pass) failed = true;
  const detail = ok ? testCase.note : ajv.errorsText(validate.errors);
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${testCase.file}: ${verdict} (expected ${testCase.expect}) — ${detail}`,
  );
}

if (failed) {
  console.error("registry contract fixture validation FAILED");
  process.exit(1);
}
console.log("registry contract fixture validation passed");
