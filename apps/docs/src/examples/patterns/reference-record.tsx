/** Static frame C evidence. No live query, selection, or submission workflow. */
import { Button } from "@augur/design-system";
import "./reference-record.css";

/**
 * One static record panel. The optional pinned theme is used by the paired
 * specimen; an applied page leaves it unset and inherits its host theme.
 */
export function ReferenceRecordPanel(props: { theme?: "light" | "dark" }) {
  return (
    <div className="example-record-panel" data-theme={props.theme}>
      <div className="example-record-state">
        <span className="example-record-signal" aria-hidden="true" />
        <span className="augur-type-editorial-label">Open query</span>
        <span className="augur-type-metadata example-record-id">LQ-042</span>
      </div>
      <h3 className="augur-type-heading-2 example-record-question">
        Did the proposal pass before 30 June?
      </h3>
      <div className="example-record-choices" aria-label="Illustrative choices; submission unavailable">
        <Button variant="outline" aria-disabled="true">Yes</Button>
        <Button variant="outline" aria-disabled="true">No</Button>
      </div>
      <dl className="example-record-details augur-type-body">
        <div><dt>Status</dt><dd>Open</dd></div>
        <div className="example-record-response"><dt>Response</dt><dd>Not submitted</dd></div>
        <div><dt>Closes</dt><dd><time>14:32 UTC</time></dd></div>
      </dl>
    </div>
  );
}

export function ReferenceRecordExample() {
  return (
    <div className="example-record-field">
      <ReferenceRecordPanel theme="light" />
      <ReferenceRecordPanel theme="dark" />
    </div>
  );
}
