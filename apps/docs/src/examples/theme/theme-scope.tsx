const ROLES = [
  { token: "--background", label: "canvas" },
  { token: "--foreground", label: "copy" },
  { token: "--primary", label: "primary action" },
] as const;

// Plain markup that paints only semantic roles, so it resolves them from
// whichever theme scope contains it.
function RolePanel(props: { title: string; hint: string }) {
  return (
    <section
      style={{
        display: "grid",
        gap: "var(--augur-spacing-xs)",
        padding: "var(--augur-spacing-md)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <p className="augur-type-ui" style={{ margin: 0 }}>
        {props.title}
      </p>
      <p className="augur-type-metadata" style={{ margin: 0, color: "var(--muted-foreground)" }}>
        {props.hint}
      </p>
      <ul
        aria-label="Semantic roles in this scope"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--augur-spacing-sm) var(--augur-spacing-lg)",
          margin: "var(--augur-spacing-sm) 0 0",
          padding: 0,
          listStyle: "none",
        }}
      >
        {ROLES.map((role) => (
          <li key={role.token} style={{ display: "inline-flex", alignItems: "center", gap: "var(--augur-spacing-sm)" }}>
            <span
              aria-hidden="true"
              style={{ width: 14, height: 14, border: "1px solid var(--border)", backgroundColor: `var(${role.token})` }}
            />
            <span className="augur-type-metadata">{role.label}</span>
            <code className="augur-type-metadata">{role.token}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ThemeScopeExample() {
  return (
    <>
      <RolePanel title="Inherits the page theme" hint="Roles resolve from the surrounding scope." />
      <div data-theme="dark">
        <RolePanel title={'Scoped subtree: data-theme="dark"'} hint="The same markup, pinned dark at the container." />
      </div>
    </>
  );
}
