import { AUGUR_FONTS, AUGUR_FONT_FAMILIES } from "@augur/design-system";

/**
 * Live typography demonstration for the docs (issue #7).
 *
 * This component is a real consumer of the public workspace package: it
 * imports `AUGUR_FONT_FAMILIES` and `AUGUR_FONTS` from the
 * `@augur/design-system` entry point and applies the package's typography
 * role classes from `styles.css`. Nothing here reimplements package
 * values — when starter components land (#11–#14) they will be rendered
 * through the same real-import path.
 *
 * Rendered statically (no hydration needed): everything shown is derived
 * from imported constants and package CSS.
 */

const ROLES: readonly { className: string; label: string; sample: string }[] = [
  { className: "augur-type-display", label: "display", sample: "Ask clearly" },
  { className: "augur-type-heading-1", label: "heading-1", sample: "Record the decision" },
  { className: "augur-type-heading-2", label: "heading-2", sample: "Keep the record scannable" },
  {
    className: "augur-type-body",
    label: "body",
    sample: "Body copy carries explanation and context in the supporting voice.",
  },
  { className: "augur-type-control", label: "control", sample: "Record your response" },
  { className: "augur-type-ui", label: "ui", sample: "Filter: open queries" },
  { className: "augur-type-metadata", label: "metadata", sample: "Final · 14 responses · updated 2h ago" },
] as const;

export function FontRoles() {
  return (
    <div className="font-demo">
      <div className="font-demo-roles">
        {ROLES.map((role) => (
          <div key={role.className} className="font-demo-role">
            <p className="augur-type-metadata font-demo-role-label">{role.label}</p>
            {/* The role class carries the family/size/weight; no local copies. */}
            <p className={role.className}>{role.sample}</p>
          </div>
        ))}
      </div>

      <div className="font-demo-consumption">
        <p className="augur-type-metadata font-demo-role-label">
          Stack applied from the imported <code>AUGUR_FONT_FAMILIES</code> constant (primary voice)
        </p>
        <p className="font-demo-stack" style={{ fontFamily: AUGUR_FONT_FAMILIES.primary }}>
          Sora applied at runtime from the package export
        </p>
        <p className="augur-type-metadata font-demo-role-label">
          Secondary voice, same mechanism
        </p>
        <p className="font-demo-stack" style={{ fontFamily: AUGUR_FONT_FAMILIES.secondary }}>
          Schibsted Grotesk applied at runtime from the package export
        </p>
      </div>

      <table className="font-demo-provenance">
        <caption className="augur-type-metadata font-demo-role-label">
          Delivered families from the imported <code>AUGUR_FONTS</code> provenance export
        </caption>
        <thead>
          <tr>
            <th scope="col">Family</th>
            <th scope="col">Package</th>
            <th scope="col">Version</th>
            <th scope="col">License</th>
            <th scope="col">Weights</th>
          </tr>
        </thead>
        <tbody>
          {AUGUR_FONTS.map((font) => (
            <tr key={font.family}>
              <td>{font.family}</td>
              <td>
                <code>{font.package}</code>
              </td>
              <td>{font.version}</td>
              <td>{font.license}</td>
              <td>{font.weights.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
