import {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@augur/design-system";

function LongContentHeader(props: { theme: "light" | "dark" }) {
  return (
    <PageHeader data-theme={props.theme}>
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
  );
}

export function PageHeaderLongContentExample() {
  return (
    <div className="example-page-header-grid">
      <div className="example-page-header-panel" data-theme="light">
        <p className="augur-type-ui example-page-header-theme-label">Light theme</p>
        <LongContentHeader theme="light" />
      </div>
      <div className="example-page-header-panel" data-theme="dark">
        <p className="augur-type-ui example-page-header-theme-label">Dark theme</p>
        <LongContentHeader theme="dark" />
      </div>
    </div>
  );
}
