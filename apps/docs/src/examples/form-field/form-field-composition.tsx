/**
 * Live example: FormField composition (issue #12).
 *
 * The pattern wires label, control, helper text, and error message;
 * the composition only declares `label`/`description`/`error`/
 * `required` and the control's own props. The second column pins
 * data-theme="dark" so the same wiring is visible under both themes.
 * The invalid field shows explicit error text — the message, not
 * color alone, carries the state (the brand defines no danger hue).
 * The code sample next to the preview is this file, imported with
 * `?raw`.
 */
import { FormField, FormFieldControl } from "@augur/design-system";

export function FormFieldCompositionExample() {
  return (
    <div className="example-form-field-grid">
      <div className="example-form-field-column">
        <FormField label="Query name" description="Shown in the records list." required>
          <FormFieldControl placeholder="Q3 records review" />
        </FormField>
        <FormField
          label="Review deadline"
          description="When this query must close."
          error="Enter a date in YYYY-MM-DD format."
        >
          <FormFieldControl defaultValue="2023-13-45" />
        </FormField>
        <FormField label="Curator note" description="Optional context for reviewers.">
          <FormFieldControl readOnly defaultValue="Held for review" />
        </FormField>
      </div>
      <div className="example-form-field-column" data-theme="dark">
        <FormField label="Query name" description="Shown in the records list." required>
          <FormFieldControl placeholder="Q3 records review" />
        </FormField>
        <FormField
          label="Review deadline"
          description="When this query must close."
          error="Enter a date in YYYY-MM-DD format."
        >
          <FormFieldControl defaultValue="2023-13-45" />
        </FormField>
        <FormField label="Curator note" description="Optional context for reviewers.">
          <FormFieldControl readOnly defaultValue="Held for review" />
        </FormField>
      </div>
    </div>
  );
}
