import { AUGUR_FONTS } from "@augur/design-system";

/**
 * Live example: read machine-readable font provenance from the package.
 *
 * The rows are computed from the imported `AUGUR_FONTS` provenance
 * export — exactly what a consumer (docs site, registry, product app)
 * can render to audit family, version, license, and delivered weights
 * without reading node_modules. The code sample next to the preview is
 * this file, imported with `?raw`.
 */
export function FontProvenanceExample() {
  return (
    <dl className="example-provenance">
      {AUGUR_FONTS.map((font) => (
        <div key={font.family} className="example-provenance-item">
          <dt className="augur-type-control">{font.family}</dt>
          <dd className="augur-type-metadata">
            <code>{font.package}</code> · v{font.version} · {font.license} · weights{" "}
            {font.weights.join("/")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
