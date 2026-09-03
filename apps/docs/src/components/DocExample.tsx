import type { ExampleDefinition } from "../lib/examples";

/**
 * Example block for documentation content (issue #8).
 *
 * Renders a live example and the source of the exact module that is
 * rendered, taken from the example's `?raw` import — the sample and the
 * preview share one source file, so they stay synchronized by
 * construction (see src/content/README.md, "Live examples").
 *
 * Rendered statically (no hydration): the preview derives from imported
 * package constants and package CSS, exactly like the page around it.
 */
export function DocExample(props: { example: ExampleDefinition }) {
  const { example } = props;
  return (
    <figure className="doc-example" aria-labelledby={`example-${example.id}-caption`}>
      <div className="doc-example-preview">
        <example.Component />
      </div>
      <figcaption id={`example-${example.id}-caption`} className="doc-example-caption">
        <span className="doc-example-title augur-type-ui">{example.title}</span>
        <span className="augur-type-metadata">{example.description}</span>
      </figcaption>
      <pre className="doc-example-code">
        <code>{example.code.trimEnd()}</code>
      </pre>
    </figure>
  );
}
