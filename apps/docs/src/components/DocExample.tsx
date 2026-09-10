import type { ExampleDefinition } from "../lib/examples";
import { codeToHtml } from "shiki";

/**
 * Example block for documentation content.
 *
 * Renders a live example and the source of the exact module that is
 * rendered, taken from the example's `?raw` import — the sample and the
 * preview share one source file, so they stay synchronized by
 * construction (see src/content/README.md, "Live examples").
 *
 * Rendered statically (no hydration): the preview derives from imported
 * package constants and package CSS, exactly like the page around it.
 */
export async function DocExample(props: { example: ExampleDefinition }) {
  const { example } = props;
  const captionId = `example-${example.id}-caption`;
  const sourceCode = example.code.trimEnd();
  const highlightedCode = await codeToHtml(sourceCode, {
    defaultColor: false,
    lang: "tsx",
    structure: "inline",
    tabindex: false,
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
  });
  const source = (
    <pre className="doc-example-code">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );

  return (
    <figure className="doc-example" aria-labelledby={captionId}>
      <header className="doc-example-header">
        <span className="doc-example-kicker augur-type-metadata">Live example</span>
        <span className="doc-example-header-title">{example.title}</span>
      </header>
      <div className="doc-example-preview">
        <example.Component />
      </div>
      <figcaption id={captionId} className="doc-example-caption">
        <span className="visually-hidden">{example.title}</span>
        <span className="augur-type-metadata">{example.description}</span>
      </figcaption>
      <details className="doc-example-source">
        <summary className="doc-example-source-summary augur-type-ui">View source</summary>
        {source}
      </details>
    </figure>
  );
}
