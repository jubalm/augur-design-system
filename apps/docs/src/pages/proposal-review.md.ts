import { PROPOSAL_REVIEW_MARKDOWN } from "../lib/proposal-review";

export const prerender = true;

export function GET() {
  return new Response(PROPOSAL_REVIEW_MARKDOWN, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
