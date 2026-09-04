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
import { DialogCompositionExample } from "./dialog/dialog-composition";
import dialogCompositionCode from "./dialog/dialog-composition.tsx?raw";
import { FormFieldCompositionExample } from "./form-field/form-field-composition";
import formFieldCompositionCode from "./form-field/form-field-composition.tsx?raw";
import { FontProvenanceExample } from "./fonts/font-provenance";
import fontProvenanceCode from "./fonts/font-provenance.tsx?raw";
import { FontStacksExample } from "./fonts/font-stacks";
import fontStacksCode from "./fonts/font-stacks.tsx?raw";
import { EmptyStateActionsExample } from "./patterns/empty-state-actions";
import emptyStateActionsCode from "./patterns/empty-state-actions.tsx?raw";
import { EmptyStateLongContentExample } from "./patterns/empty-state-long-content";
import emptyStateLongContentCode from "./patterns/empty-state-long-content.tsx?raw";
import { EmptyStateNoActionExample } from "./patterns/empty-state-no-action";
import emptyStateNoActionCode from "./patterns/empty-state-no-action.tsx?raw";
import { PageHeaderCompositionExample } from "./patterns/page-header-composition";
import pageHeaderCompositionCode from "./patterns/page-header-composition.tsx?raw";
import { PageHeaderLongContentExample } from "./patterns/page-header-long-content";
import pageHeaderLongContentCode from "./patterns/page-header-long-content.tsx?raw";
import { PageHeaderNoActionsExample } from "./patterns/page-header-no-actions";
import pageHeaderNoActionsCode from "./patterns/page-header-no-actions.tsx?raw";
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
  dialog: {
    composition: defineExample({
      id: "dialog-composition",
      title: "Dialog composition",
      description: "The composition's trigger in both themes; the panel, scrim, and focus behavior run in the interactive example on the page.",
      Component: DialogCompositionExample,
      code: dialogCompositionCode,
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
  patterns: {
    composition: defineExample({
      id: "page-header-composition",
      title: "PageHeader composition",
      description: "Breadcrumb, title, description, and an actions slot with one primary action; the second header pins data-theme=dark.",
      Component: PageHeaderCompositionExample,
      code: pageHeaderCompositionCode,
    }),
    longContent: defineExample({
      id: "page-header-long-content",
      title: "PageHeader with long content",
      description: "Long titles and descriptions wrap inside the title column while actions hold the right edge, in both themes.",
      Component: PageHeaderLongContentExample,
      code: pageHeaderLongContentCode,
    }),
    noActions: defineExample({
      id: "page-header-no-actions",
      title: "PageHeader without actions, with a back affordance",
      description: "A title area that stands alone; the back affordance is a quiet ghost Button, not a nav landmark.",
      Component: PageHeaderNoActionsExample,
      code: pageHeaderNoActionsCode,
    }),
    emptyStateActions: defineExample({
      id: "empty-state-actions",
      title: "EmptyState with actions",
      description: "Glyph, title, description, and one primary action with a quiet secondary; the second state pins data-theme=dark.",
      Component: EmptyStateActionsExample,
      code: emptyStateActionsCode,
    }),
    emptyStateLongContent: defineExample({
      id: "empty-state-long-content",
      title: "EmptyState with long content",
      description: "A long description wraps inside the width-capped slot while the region stays centered, in both themes.",
      Component: EmptyStateLongContentExample,
      code: emptyStateLongContentCode,
    }),
    emptyStateNoAction: defineExample({
      id: "empty-state-no-action",
      title: "EmptyState without actions",
      description: "A quiet region that only names the empty state; no actions slot renders when there is no way out to offer.",
      Component: EmptyStateNoActionExample,
      code: emptyStateNoActionCode,
    }),
  },
} as const;
