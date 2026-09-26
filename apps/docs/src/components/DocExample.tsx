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
 * The frame owns presentation: with `themes: "both"` it renders the same
 * module in labeled light and dark scopes and pins each with
 * `data-theme`, so the theme contract stays visible while the displayed
 * sample stays a single-theme consumer sample.
 *
 * Rendered statically (no hydration): the preview derives from imported
 * package constants and package CSS, exactly like the page around it.
 */
const THEMES = [
  { value: "light", label: "Light theme" },
  { value: "dark", label: "Dark theme" },
] as const;

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

  const stage = (
    <div className="doc-example-stage" data-layout={example.layout ?? "stack"}>
      <example.Component />
    </div>
  );

  return (
    <figure className="doc-example" aria-labelledby={captionId}>
      <header className="doc-example-header">
        <span className="doc-example-kicker augur-type-metadata">Live example</span>
        <span className="doc-example-header-title">{example.title}</span>
      </header>
      <div className="doc-example-preview">
        {example.themes === "both" ? (
          <div className="doc-example-themes" data-pair={example.pair ?? "columns"}>
            {THEMES.map((theme) => (
              <div key={theme.value} className="doc-example-theme" data-theme={theme.value}>
                <p className="doc-example-theme-label augur-type-metadata">{theme.label}</p>
                {stage}
              </div>
            ))}
          </div>
        ) : (
          stage
        )}
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
