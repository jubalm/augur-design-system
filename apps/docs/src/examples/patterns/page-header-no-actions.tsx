/**
 * Live example: PageHeader without actions, with a back affordance
 *.
 *
 * No actions slot: the title area stands alone. The back affordance is
 * a quiet ghost Button placed as the first child of `PageHeader` — a
 * single back control needs no nav landmark, so no breadcrumb wrapper
 * is used. The second header pins data-theme="dark". The code sample
 * next to the preview is this file, imported with `?raw`.
 */
import {
  Button,
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@augur/design-system";

export function PageHeaderNoActionsExample() {
  return (
    <div className="example-card-grid">
      <PageHeader>
        <Button variant="ghost" size="sm">
          ← Back to accounts
        </Button>
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>Account settings</PageHeaderTitle>
          <PageHeaderDescription>
            Preferences for this account. Changes apply immediately.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageHeader data-theme="dark">
        <Button variant="ghost" size="sm">
          ← Back to accounts
        </Button>
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>Account settings</PageHeaderTitle>
          <PageHeaderDescription>
            Preferences for this account. Changes apply immediately.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
    </div>
  );
}
