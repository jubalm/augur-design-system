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
import { PaletteSwatchesExample } from "./color/palette-swatches";
import paletteSwatchesCode from "./color/palette-swatches.tsx?raw";
import { ButtonStatesExample } from "./button/button-states";
import buttonStatesCode from "./button/button-states.tsx?raw";
import { ButtonVariantsExample } from "./button/button-variants";
import buttonVariantsCode from "./button/button-variants.tsx?raw";
import { CardCompositionExample } from "./card/card-composition";
import cardCompositionCode from "./card/card-composition.tsx?raw";
import { FormFieldCompositionExample } from "./form-field/form-field-composition";
import formFieldCompositionCode from "./form-field/form-field-composition.tsx?raw";
import { FontProvenanceExample } from "./fonts/font-provenance";
import fontProvenanceCode from "./fonts/font-provenance.tsx?raw";
import { FontStacksExample } from "./fonts/font-stacks";
import fontStacksCode from "./fonts/font-stacks.tsx?raw";
import { InputStatesExample } from "./input/input-states";
import inputStatesCode from "./input/input-states.tsx?raw";
import { ThemeScopeExample } from "./theme/theme-scope";
import themeScopeCode from "./theme/theme-scope.tsx?raw";

export const examples = {
  color: {
    palette: defineExample({
      id: "palette-swatches",
      title: "The palette, painted from generated tokens",
      description: "Chips and recorded contrast pairings render from --augur-color-* variables; no hex value is restated on this page.",
      Component: PaletteSwatchesExample,
      code: paletteSwatchesCode,
    }),
  },
  button: {
    variants: defineExample({
      id: "button-variants",
      title: "Button variants, light and dark",
      description: "The variant set renders from real package imports; the second row pins data-theme=dark.",
      Component: ButtonVariantsExample,
      code: buttonVariantsCode,
    }),
    states: defineExample({
      id: "button-states",
      title: "Sizes, disabled, and loading",
      description: "Structural sizes and the width-preserving loading contract, rendered from real component props.",
      Component: ButtonStatesExample,
      code: buttonStatesCode,
    }),
  },
  card: {
    composition: defineExample({
      id: "card-composition",
      title: "Card composition",
      description: "The part set groups a record with its actions; the second card pins data-theme=dark.",
      Component: CardCompositionExample,
      code: cardCompositionCode,
    }),
  },
  formField: {
    composition: defineExample({
      id: "form-field-composition",
      title: "FormField composition, light and dark",
      description: "Label, control, helper text, and an explicit error message wired by the pattern, with required and read-only fields; the second column pins data-theme=dark.",
      Component: FormFieldCompositionExample,
      code: formFieldCompositionCode,
    }),
  },
  input: {
    states: defineExample({
      id: "input-states",
      title: "Input states, light and dark",
      description: "Default, read-only, disabled, and invalid with consumer-owned labeling and visible error text; the second row pins data-theme=dark.",
      Component: InputStatesExample,
      code: inputStatesCode,
    }),
  },
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
