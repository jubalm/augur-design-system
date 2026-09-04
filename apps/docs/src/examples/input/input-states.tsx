/**
 * Live example: Input states (issue #12).
 *
 * A bare `Input` with consumer-owned labeling — Input is independent
 * of FormField, and this is the manual wiring a one-off consumer
 * writes: `htmlFor`/`id` for the accessible name, `aria-describedby`
 * for the error, and visible error text (the message, not color alone,
 * carries the state). The second row pins data-theme="dark" to show
 * the same states under the dark theme. Real exports from
 * @augur/design-system; the code sample next to the preview is this
 * file, imported with `?raw`.
 */
import { Input } from "@augur/design-system";

function StatesRow({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <div className="example-input-field">
        <label htmlFor={`${idPrefix}-name`}>Query name</label>
        <Input id={`${idPrefix}-name`} placeholder="Q3 records review" />
      </div>
      <div className="example-input-field">
        <label htmlFor={`${idPrefix}-readonly`}>Record id (read-only)</label>
        <Input id={`${idPrefix}-readonly`} readOnly value="REC-0417" />
      </div>
      <div className="example-input-field">
        <label htmlFor={`${idPrefix}-disabled`}>Archived field</label>
        <Input id={`${idPrefix}-disabled`} disabled placeholder="Not editable" />
      </div>
      <div className="example-input-field">
        <label htmlFor={`${idPrefix}-invalid`}>Review deadline</label>
        <Input
          id={`${idPrefix}-invalid`}
          invalid
          defaultValue="2023-13-45"
          aria-describedby={`${idPrefix}-invalid-error`}
        />
        <p id={`${idPrefix}-invalid-error`} className="example-input-error">
          Enter a date in YYYY-MM-DD format.
        </p>
      </div>
    </>
  );
}

export function InputStatesExample() {
  return (
    <div className="example-input-grid">
      <div className="example-input-row">
        <StatesRow idPrefix="light" />
      </div>
      <div className="example-input-row" data-theme="dark">
        <StatesRow idPrefix="dark" />
      </div>
    </div>
  );
}
