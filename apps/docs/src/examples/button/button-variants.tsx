/**
 * Live example: Button variants in both themes.
 *
 * Real exports from @augur/design-system; the second row pins
 * data-theme="dark" to show the same API under the dark theme — the
 * primary action moves from Deep to Green with the theme, exactly as
 * the theme contract defines. No local colors anywhere. The code
 * sample next to the preview is this file, imported with `?raw`.
 */
import { Button } from "@augur/design-system";

export function ButtonVariantsExample() {
  return (
    <div className="example-button-grid">
      <div className="example-button-row">
        <Button variant="default">Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Delete record</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link action</Button>
      </div>
      <div className="example-button-row" data-theme="dark">
        <Button variant="default">Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Delete record</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link action</Button>
      </div>
    </div>
  );
}
