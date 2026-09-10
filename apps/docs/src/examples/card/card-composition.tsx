/**
 * Live example: Card composition.
 *
 * The part set renders a grouped panel; each card pins a theme so the same
 * composition is visible under both light and dark surfaces. The footer
 * holds one primary action per card — the one green signal in each panel.
 */
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@augur/design-system";

export function CardCompositionExample() {
  return (
    <div className="example-card-grid">
      <Card data-theme="light">
        <CardHeader>
          <CardTitle>Query review</CardTitle>
          <CardDescription>Status, choices, and the current response.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The panel groups the record with the actions that operate on it.</p>
        </CardContent>
        <CardFooter>
          <Button>Open record</Button>
        </CardFooter>
      </Card>
      <Card data-theme="dark">
        <CardHeader>
          <CardTitle>Query review</CardTitle>
          <CardDescription>Status, choices, and the current response.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The panel groups the record with the actions that operate on it.</p>
        </CardContent>
        <CardFooter>
          <Button>Open record</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
