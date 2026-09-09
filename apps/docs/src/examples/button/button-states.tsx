/**
 * Live example: Button sizes and the disabled/loading contracts.
 * Disabled keeps its label at reduced contrast; loading
 * keeps its width and switches to a spinner with a visually hidden
 * "Loading" status. Static render: the states shown are the real
 * component props, not mockups.
 */
import { Button } from "@augur/design-system";

export function ButtonStatesExample() {
  return (
    <div className="example-button-grid">
      <div className="example-button-row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="example-button-row">
        <Button disabled>Disabled</Button>
        <Button loading>Finalize record</Button>
      </div>
    </div>
  );
}
