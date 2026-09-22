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
