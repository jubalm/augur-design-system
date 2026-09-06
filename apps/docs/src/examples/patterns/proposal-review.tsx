/**
 * Applied static example for #52. It deliberately composes existing exports:
 * PageHeader supplies the page hierarchy, ReferenceRecordPanel supplies the
 * record, and Button supplies the one action. There is no product workflow.
 */
import {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@augur/design-system";
import { PROPOSAL_REVIEW } from "../../lib/proposal-review";
import { ReferenceRecordPanel } from "./reference-record";
import "./proposal-review.css";

export function ProposalReviewPage() {
  return (
    <article className="proposal-review-page">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>{PROPOSAL_REVIEW.title}</PageHeaderTitle>
          <PageHeaderDescription>{PROPOSAL_REVIEW.description}</PageHeaderDescription>
          <PageHeaderActions>
            <form action="#proposal-details">
              <Button type="submit">Review details</Button>
            </form>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>

      <ReferenceRecordPanel />

      <section id="proposal-details" className="proposal-review-details" tabIndex={-1}>
        <h2 className="augur-type-heading-2">{PROPOSAL_REVIEW.detailsTitle}</h2>
        <p className="augur-type-body">{PROPOSAL_REVIEW.details}</p>
      </section>
    </article>
  );
}
