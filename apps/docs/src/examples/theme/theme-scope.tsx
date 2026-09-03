/**
 * Live example: the theme contract applies at any container level.
 *
 * Plain elements styled only with the semantic role custom properties
 * delivered by `@augur/design-system/styles.css` — no local color
 * values, so the paint always follows the resolved theme. The inner
 * panel pins `data-theme="dark"` directly, demonstrating the scoped
 * subtree behavior from the package's theme contract (see the Theming
 * foundation page for the full selection model). The code sample next
 * to the preview is this file, imported with `?raw`.
 */

const ROLES: readonly { token: string; label: string }[] = [
  { token: "--background", label: "canvas" },
  { token: "--foreground", label: "copy" },
  { token: "--primary", label: "primary action" },
] as const;

function ScopePanel(props: { title: string; hint: string; scoped?: boolean }) {
  return (
    <div className="example-theme-panel" data-theme={props.scoped ? "dark" : undefined}>
      <p className="augur-type-ui example-theme-title">{props.title}</p>
      <p className="augur-type-metadata">{props.hint}</p>
      <ul className="example-theme-roles" aria-label="Semantic roles in this scope">
        {ROLES.map((role) => (
          <li key={role.token} className="example-theme-role">
            <span
              className="example-theme-chip"
              style={{ backgroundColor: `var(${role.token})`, borderColor: "var(--border)" }}
              aria-hidden="true"
            />
            <span className="augur-type-metadata">{role.label}</span>
            <code className="augur-type-metadata">{role.token}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ThemeScopeExample() {
  return (
    <div className="example-theme-scope">
      <ScopePanel title="Inherits the page theme" hint="Roles resolve from the surrounding scope." />
      <ScopePanel
        title={'Scoped subtree: data-theme="dark"'}
        hint="The same markup, pinned dark at the container."
        scoped
      />
    </div>
  );
}
