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
