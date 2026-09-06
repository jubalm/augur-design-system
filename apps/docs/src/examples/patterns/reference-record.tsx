/**
 * Live example: the reference record (issue #52, contract frame C).
 *
 * A static, source-grounded composition of package components — the
 * question leads, two choices receive equal structure and emphasis,
 * and state/response/time sit explicit and quiet. There is no product
 * submission workflow: the recorded response is part of the fixture
 * copy. The record renders as a true pair — one pinned light, one
 * pinned dark panel with identical content, order, and geometry under
 * either host theme. All styling comes from the semantic roles and
 * encoded tokens; no drawn artwork.
 */
import { Button } from "@augur/design-system";

function RecordPanel(props: { theme: "light" | "dark" }) {
  return (
    <div className="example-record-panel" data-theme={props.theme}>
      <div className="example-record-state">
        <span className="example-record-signal" aria-hidden="true" />
        <span className="augur-type-ui example-record-state-label">
          Open
        </span>
      </div>
      <p className="augur-type-heading-1 example-record-question">
        Vote on this query
      </p>
      <div className="example-record-choices">
        <Button variant="outline" aria-pressed="true">
          Yes
        </Button>
        <Button variant="outline" aria-pressed="false">
          No
        </Button>
      </div>
      <p className="augur-type-body example-record-response">
        <span className="augur-type-editorial-label">Response</span>
        Yes — recorded 14:32 UTC
      </p>
      <p className="augur-type-metadata example-record-id">
        Query ID LQ-042
      </p>
    </div>
  );
}

export function ReferenceRecordExample() {
  return (
    <div className="example-record-field">
      <RecordPanel theme="light" />
      <RecordPanel theme="dark" />
    </div>
  );
}
