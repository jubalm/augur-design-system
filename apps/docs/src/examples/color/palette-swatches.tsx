/**
 * Live example: the Augur palette, painted from generated tokens.
 *
 * Every chip below paints a `--augur-color-*` custom property delivered
 * by `@augur/design-system/styles.css` — the generated output of the
 * pinned `@google/design.md` toolchain (issue #3). Nothing here restates
 * a hex value; when `DESIGN.md` changes and tokens regenerate, this
 * palette re-renders with the new values. Grouping follows the
 * companion-vs-role naming rules of the foundation decision record (§4):
 * brand companions are named, runtime surfaces are described by job.
 *
 * The pairing table renders the contrast pairings `DESIGN.md` records,
 * with foreground and background also referenced from the generated
 * variables; the ratios shown are the recorded values, independently
 * recomputed and enforced by the package test suite
 * (packages/design-system/docs/semantic-themes.md).
 */

type Swatch = { token: string; name: string; job: string };

const GROUPS: readonly { title: string; note: string; swatches: readonly Swatch[] }[] = [
  {
    title: "Brand anchors",
    note: "Navy anchors dark UI and primary text; Green is a signal of intent, never decoration.",
    swatches: [
      { token: "--augur-color-primary", name: "Augur Navy", job: "brand anchor, dark canvas, primary text on light" },
      { token: "--augur-color-accent", name: "Augur Green", job: "intent signal on dark surfaces" },
    ],
  },
  {
    title: "Light surfaces",
    note: "Paper is the canvas, White creates elevation, Muted fills quiet regions, Border draws hairlines.",
    swatches: [
      { token: "--augur-color-neutral", name: "Augur Paper", job: "default light canvas" },
      { token: "--augur-color-surface-light", name: "Paper (role)", job: "light canvas surface role" },
      { token: "--augur-color-surface-light-raised", name: "Raised (role)", job: "elevated light panels: White" },
      { token: "--augur-color-surface-light-muted", name: "Muted (role)", job: "quiet light regions" },
      { token: "--augur-color-border-light", name: "Border", job: "hairline rules, never text" },
    ],
  },
  {
    title: "Dark surfaces",
    note: "Navy is the dark canvas; the Surface steps lift panels and controls tonally.",
    swatches: [
      { token: "--augur-color-surface-dark-1", name: "Surface 1", job: "first dark layer: cards" },
      { token: "--augur-color-surface-dark-2", name: "Surface 2", job: "second dark layer: popovers" },
      { token: "--augur-color-surface-dark-3", name: "Surface 3 / Raised", job: "third dark layer: raised" },
      { token: "--augur-color-surface-dark-mist", name: "Mist", job: "dark edges and rules only, never copy" },
    ],
  },
  {
    title: "Companions",
    note: "Deep is the accessible green for light surfaces; Wash fills without carrying text; Graphite and Pewter are secondary voices.",
    swatches: [
      { token: "--augur-color-accent-deep", name: "Deep", job: "readable green on light: actions, focus, signals" },
      { token: "--augur-color-accent-wash", name: "Wash", job: "light green fill only, never readable text" },
      { token: "--augur-color-secondary", name: "Augur Graphite", job: "secondary text on light surfaces" },
      { token: "--augur-color-secondary-dark", name: "Augur Pewter", job: "secondary text on dark surfaces" },
    ],
  },
] as const;

/** The contrast pairings DESIGN.md records, foreground over background. */
const PAIRINGS: readonly { fg: string; bg: string; pairing: string; ratio: string }[] = [
  { fg: "--augur-color-primary", bg: "--augur-color-surface-light", pairing: "Navy on Paper", ratio: "17.49:1" },
  { fg: "--augur-color-secondary", bg: "--augur-color-surface-light", pairing: "Graphite on Paper", ratio: "7.81:1" },
  { fg: "--augur-color-accent-deep", bg: "--augur-color-surface-light", pairing: "Deep on Paper", ratio: "7.17:1" },
  { fg: "--augur-color-surface-light", bg: "--augur-color-primary", pairing: "Paper on Navy", ratio: "17.49:1" },
  { fg: "--augur-color-secondary-dark", bg: "--augur-color-primary", pairing: "Pewter on Navy", ratio: "7.53:1" },
  { fg: "--augur-color-secondary-dark", bg: "--augur-color-surface-dark-3", pairing: "Pewter on Surface 3", ratio: "6.00:1" },
  { fg: "--augur-color-accent", bg: "--augur-color-primary", pairing: "Green on Navy", ratio: "11.87:1" },
] as const;

export function PaletteSwatchesExample() {
  return (
    <div className="example-palette">
      {GROUPS.map((group) => (
        <section key={group.title} className="example-palette-group">
          <p className="augur-type-ui example-palette-group-title">{group.title}</p>
          <p className="augur-type-metadata">{group.note}</p>
          <ul className="example-palette-grid" aria-label={`Palette group: ${group.title}`}>
            {group.swatches.map((swatch) => (
              <li key={swatch.token} className="example-palette-swatch">
                {/* The custom-property reference IS the demonstration:
                    the paint follows the generated token. */}
                <span
                  className="example-palette-chip"
                  style={{ backgroundColor: `var(${swatch.token})` }}
                  aria-hidden="true"
                />
                <span className="augur-type-metadata">{swatch.name}</span>
                <code className="augur-type-metadata">{swatch.token}</code>
                <span className="augur-type-metadata example-palette-job">{swatch.job}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <table className="example-palette-pairs">
        <caption className="augur-type-metadata">
          Contrast pairings recorded in <code>DESIGN.md</code>, painted from the same generated tokens
        </caption>
        <thead>
          <tr>
            <th scope="col">Pairing</th>
            <th scope="col">Sample</th>
            <th scope="col">Recorded ratio</th>
          </tr>
        </thead>
        <tbody>
          {PAIRINGS.map((pair) => (
            <tr key={pair.pairing}>
              <th scope="row">{pair.pairing}</th>
              <td>
                {/* Inline styles reference the generated variables, so the
                    sample re-resolves with the tokens; the text sits on the
                    pairing it demonstrates. */}
                <span
                  className="example-palette-sample augur-type-ui"
                  style={{ backgroundColor: `var(${pair.bg})`, color: `var(${pair.fg})` }}
                >
                  Open · Final · 14 responses
                </span>
              </td>
              <td className="augur-type-metadata">{pair.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
