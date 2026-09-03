/**
 * Public entry point for @augur/design-system.
 *
 * Consumers use this module and the stylesheet entry point:
 *
 *   import { Button } from "@augur/design-system";
 *   import "@augur/design-system/styles.css";
 *
 * Generated tokens and theme output land with the
 * foundation work (#3, #4); font delivery (#5) adds the machine-readable
 * font provenance export; starter components (#11-#14) are exported
 * from here as they are implemented. Internal file organization must not
 * become public API through this module.
 */
export { AUGUR_FONTS, AUGUR_FONT_FAMILIES } from "./fonts";
export type { AugurFontProvenance } from "./fonts";
export {};
