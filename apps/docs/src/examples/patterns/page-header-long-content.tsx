/**
 * Live example: PageHeader with long content (issue #14).
 *
 * A long title and a long description wrap inside the title column —
 * `minmax(0, 1fr)` keeps them from pushing the actions out — while the
 * actions hold the right edge and wrap as a group. The second header
 * pins data-theme="dark". The code sample next to the preview is this
 * file, imported with `?raw`.
 */
import {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@augur/design-system";

export function PageHeaderLongContentExample() {
  return (
    <div className="example-card-grid">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>
            Reconciled fills and open exposure for the derivatives desk, week 34
          </PageHeaderTitle>
          <PageHeaderDescription>
            This report gathers every fill matched against the clearing feed, the open
            exposure that remains after netting, and the reconciliation breaks that still
            need a reviewer's decision before the week can be closed.
          </PageHeaderDescription>
          <PageHeaderActions>
            <Button>Review breaks</Button>
            <Button variant="outline">Schedule</Button>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
      <PageHeader data-theme="dark">
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>
            Reconciled fills and open exposure for the derivatives desk, week 34
          </PageHeaderTitle>
          <PageHeaderDescription>
            This report gathers every fill matched against the clearing feed, the open
            exposure that remains after netting, and the reconciliation breaks that still
            need a reviewer's decision before the week can be closed.
          </PageHeaderDescription>
          <PageHeaderActions>
            <Button>Review breaks</Button>
            <Button variant="outline">Schedule</Button>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
    </div>
  );
}
