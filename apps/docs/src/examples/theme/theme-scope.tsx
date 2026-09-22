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
