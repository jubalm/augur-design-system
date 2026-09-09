/**
 * Live example: PageHeader composition.
 *
 * The full part set — breadcrumb slot, title, description, and an
 * actions slot whose first Button is the primary (the view's one green
 * signal) with a quiet outline action behind it. The second header pins
 * data-theme="dark" so the same composition is visible under both
 * themes. Demo titles use `headingLevel={2}` so the docs page's own h1
 * stays the top of the outline; a real page header would keep the h1
 * default. The code sample next to the preview is this file, imported
 * with `?raw`.
 */
import {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderBreadcrumb,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@augur/design-system";

export function PageHeaderCompositionExample() {
  return (
    <div className="example-card-grid">
      <PageHeader>
        <PageHeaderBreadcrumb aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="#accounts">Accounts</a>
            </li>
            <li>
              <a href="#accounts-positions" aria-current="page">
                Positions
              </a>
            </li>
          </ol>
        </PageHeaderBreadcrumb>
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>Positions</PageHeaderTitle>
          <PageHeaderDescription>
            Every open and closed position for the selected account.
          </PageHeaderDescription>
          <PageHeaderActions>
            <Button>New position</Button>
            <Button variant="outline">Export CSV</Button>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
      <PageHeader data-theme="dark">
        <PageHeaderBreadcrumb aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="#accounts">Accounts</a>
            </li>
            <li>
              <a href="#accounts-positions" aria-current="page">
                Positions
              </a>
            </li>
          </ol>
        </PageHeaderBreadcrumb>
        <PageHeaderContent>
          <PageHeaderTitle headingLevel={2}>Positions</PageHeaderTitle>
          <PageHeaderDescription>
            Every open and closed position for the selected account.
          </PageHeaderDescription>
          <PageHeaderActions>
            <Button>New position</Button>
            <Button variant="outline">Export CSV</Button>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
    </div>
  );
}
