/** Shared copy for the static #52 applied example and its Markdown view. */
import proposalReviewSource from "../examples/patterns/proposal-review.tsx?raw";

export const PROPOSAL_REVIEW = {
  title: "Proposal review",
  description:
    "An illustrative, static review page that combines PageHeader, the reference record, and one in-page primary action.",
  detailsTitle: "Proposal details",
  details:
    "This illustrative page has no voting logic, submission, backend connection, or live proposal data. Review details only moves to this explanation on the same page.",
} as const;

export const PROPOSAL_REVIEW_MARKDOWN = `# ${PROPOSAL_REVIEW.title}

${PROPOSAL_REVIEW.description}

**Open query — LQ-042**

Did the proposal pass before 30 June?

Choices: Yes and No. They are equally presented, unavailable, and neither is selected.

Status: Open  
Response: Not submitted  
Closes: 14:32 UTC

## ${PROPOSAL_REVIEW.detailsTitle}

${PROPOSAL_REVIEW.details}

The rendered page is composed from the existing PageHeader, reference record, and Button:

\`\`\`tsx
${proposalReviewSource.trimEnd()}
\`\`\`
`;
