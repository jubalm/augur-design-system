import { AUGUR_FONT_FAMILIES } from "@augur/design-system";

/**
 * Live example: apply the package's voice-named font stacks.
 *
 * Real consumer of the `@augur/design-system` entry module — the stacks
 * shown are the imported constants, not local copies. The code sample
 * rendered next to this preview is this file, imported with `?raw`
 * (see src/lib/examples.ts).
 */
export function FontStacksExample() {
  return (
    <div className="example-font-stacks">
      <p className="example-stack-line" style={{ fontFamily: AUGUR_FONT_FAMILIES.primary }}>
        Primary voice — Sora carries display, headings, controls, and key actions.
      </p>
      <p className="example-stack-line" style={{ fontFamily: AUGUR_FONT_FAMILIES.secondary }}>
        Secondary voice — Schibsted Grotesk carries body copy, helper text, and dense UI.
      </p>
    </div>
  );
}
