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
