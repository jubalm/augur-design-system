/**
 * Live example: Dialog composition (issue #13).
 *
 * Statically rendered preview (no hydration): the docs example pipeline
 * renders without client JavaScript, and a Radix portal mounts nothing
 * on the server — so this preview shows the composition's entry point,
 * the trigger, in both themes. The open behavior (panel, scrim, focus
 * containment, Escape and overlay dismissal) runs in the interactive
 * example on the page (src/examples/dialog/dialog-playground.tsx).
 */
import { Button, Dialog, DialogTrigger } from "@augur/design-system";

export function DialogCompositionExample() {
  return (
    <div className="example-card-grid">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Review query</Button>
        </DialogTrigger>
      </Dialog>
      <div data-theme="dark" style={{ padding: "16px", borderRadius: "8px" }}>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Review query</Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
}
