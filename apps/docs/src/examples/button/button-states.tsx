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
