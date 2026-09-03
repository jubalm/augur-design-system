/**
 * Live theming demonstration for the docs (issue #7).
 *
 * Rendered statically: the panels are plain elements styled only with the
 * semantic role custom properties delivered by
 * `@augur/design-system/styles.css`, so they visibly re-resolve when the
 * page theme changes (header toggle, system preference, or the scoped
 * `[data-theme]` subtree required by the package's theme contract).
 *
 * The inner panel carries `data-theme="dark"` directly, demonstrating the
 * contract's container-level scope: a dark region inside a light page (or
 * the reverse, when the page is dark — the mapping is symmetric).
 */

const SWATCHES: readonly { token: string; label: string }[] = [
  { token: "--background", label: "canvas" },
  { token: "--card", label: "raised panel" },
  { token: "--primary", label: "primary action" },
  { token: "--muted", label: "quiet region" },
  { token: "--border", label: "hairline rule" },
  { token: "--ring", label: "focus ring" },
] as const;

function SwatchRow() {
  return (
    <ul className="theme-swatch-row" aria-label="Semantic color roles in the current theme">
      {SWATCHES.map((swatch) => (
        <li key={swatch.token} className="theme-swatch">
          {/* The inline custom property reference IS the demonstration:
              the paint follows the role, never a local color value. */}
          <span className="theme-swatch-chip" style={{ backgroundColor: `var(${swatch.token})` }} aria-hidden="true" />
          <span className="augur-type-metadata">{swatch.label}</span>
          <code className="augur-type-metadata">{swatch.token}</code>
        </li>
      ))}
    </ul>
  );
}

export function ThemingDemo() {
  return (
    <div className="theme-demo">
      <div className="theme-demo-panel">
        <p className="augur-type-ui theme-demo-title">Current page theme</p>
        <p className="augur-type-body">
          Toggle System / Light / Dark in the header, or change your system
          preference while "System" is selected — these chips re-resolve
          through the package's semantic roles.
        </p>
        <SwatchRow />
      </div>

      <div className="theme-demo-panel" data-theme="dark">
        <p className="augur-type-ui theme-demo-title">
          Scoped subtree: <code>data-theme="dark"</code> on this panel
        </p>
        <p className="augur-type-body">
          The theme contract applies at any container level. This region
          renders the dark role set even when the surrounding page is light.
        </p>
        <SwatchRow />
      </div>
    </div>
  );
}
