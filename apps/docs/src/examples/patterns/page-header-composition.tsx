/**
 * Live example: PageHeader composition.
 *
 * The full part set — breadcrumb slot, title, description, and an
 * actions slot whose first Button is the primary (the view's one green
 * signal) with a quiet outline action behind it. The same composition is
 * rendered inside explicitly labeled light and dark theme scopes so the
 * comparison stays visible even when the docs page is dark. Demo titles
 * use `headingLevel={2}` so the docs page's own h1 stays the top of the
 * outline; a real page header would keep the h1 default. The code sample
 * next to the preview is this file, imported with `?raw`.
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

function PositionsHeader(props: { theme: "light" | "dark" }) {
  return (
    <PageHeader data-theme={props.theme}>
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
  );
}

export function PageHeaderCompositionExample() {
  return (
    <div className="example-page-header-grid">
      <div className="example-page-header-panel" data-theme="light">
        <p className="augur-type-ui example-page-header-theme-label">Light theme</p>
        <PositionsHeader theme="light" />
      </div>
      <div className="example-page-header-panel" data-theme="dark">
        <p className="augur-type-ui example-page-header-theme-label">Dark theme</p>
        <PositionsHeader theme="dark" />
      </div>
    </div>
  );
}
