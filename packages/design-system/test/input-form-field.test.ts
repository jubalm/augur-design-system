/**
 * Pure-surface contracts for the Input and FormField slice,
 * executable with Bun's built-in runner (`bun test` in this package).
 *
 * Scope here is the exported surface, mirroring the #11 precedent:
 * the public entry point exposes the component functions. Rendered
 * keyboard/input, label/description/error wiring, disabled/read-only
 * contracts, HTML semantics, and axe behavior run in the repository
 * Vitest harness (`tests/input-form-field.test.tsx` via
 * `bun run test` at the root), which owns the jsdom + Testing Library
 * + axe tooling from #6.
 */
import { describe, expect, test } from "bun:test";
import * as entry from "../src/index";

describe("public entry point", () => {
  test("exports the #12 component slice as functions", () => {
    const entryExports = entry as unknown as Record<string, unknown>;
    for (const name of [
      "Input",
      "FormField",
      "FormFieldControl",
      "FormFieldLabel",
      "FormFieldDescription",
      "FormFieldError",
    ]) {
      expect(typeof entryExports[name]).toBe("function");
    }
  });
});
