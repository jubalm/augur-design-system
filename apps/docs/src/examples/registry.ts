/**
 * Example registry (issue #8).
 *
 * Each entry pairs an example module with its own source via `?raw` —
 * the two imports name the SAME file, so the rendered preview and the
 * displayed code sample cannot drift. Content pages import from here:
 *
 *   import { DocExample } from "../../components/DocExample";
 *   import { examples } from "../../examples/registry";
 *   <DocExample example={examples.fonts.stacks} />
 *
 * Add a new example by writing the module under `src/examples/<area>/`,
 * then registering it here with both imports. Keep ids kebab-case and
 * unique; see `src/content/README.md`.
 */
import { defineExample } from "../lib/examples";
import { FontProvenanceExample } from "./fonts/font-provenance";
import fontProvenanceCode from "./fonts/font-provenance.tsx?raw";
import { FontStacksExample } from "./fonts/font-stacks";
import fontStacksCode from "./fonts/font-stacks.tsx?raw";
import { ThemeScopeExample } from "./theme/theme-scope";
import themeScopeCode from "./theme/theme-scope.tsx?raw";

export const examples = {
  fonts: {
    stacks: defineExample({
      id: "font-stacks",
      title: "Applying the voice stacks",
      description: "Import the voice-named stacks and apply them directly; no local font values.",
      Component: FontStacksExample,
      code: fontStacksCode,
    }),
    provenance: defineExample({
      id: "font-provenance",
      title: "Reading font provenance",
      description: "Render family, version, license, and delivered weights from the provenance export.",
      Component: FontProvenanceExample,
      code: fontProvenanceCode,
    }),
  },
  theme: {
    scope: defineExample({
      id: "theme-scope",
      title: "Scoped theme subtrees",
      description: "Consume semantic roles in plain markup; pin a subtree with data-theme.",
      Component: ThemeScopeExample,
      code: themeScopeCode,
    }),
  },
} as const;
