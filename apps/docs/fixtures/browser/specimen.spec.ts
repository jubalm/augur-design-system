// Specimen rendering repair (#44) — computed-style parity between the
// bare package host and the docs prose host, plus palette chip fields.
import { test, type Page } from "@playwright/test";
import { assertOk, BARE_ORIGIN, go, ORIGIN, shot, site } from "./helpers";

const BARE_HOST = `${BARE_ORIGIN}/packages/design-system/fixtures/bare-hosts.html`;

const componentMetrics = () => {
  const g = (el: Element | null | undefined, prop: string) => (el ? (getComputedStyle(el) as unknown as Record<string, string>)[prop] : null);
  const card = document.querySelector(".aug-card:not([data-theme])");
  const title = card?.querySelector(".aug-card-title");
  const desc = card?.querySelector(".aug-card-description");
  const contentP = card?.querySelector(".aug-card-content > p");
  const header = document.querySelector('.aug-page-header:not([data-theme]), .aug-page-header[data-theme="light"]');
  const phTitle = header?.querySelector(".aug-page-header-title");
  const phDesc = header?.querySelector(".aug-page-header-description");
  const ol = header?.querySelector(".aug-page-header-breadcrumb ol");
  const li2 = header?.querySelector(".aug-page-header-breadcrumb li + li");
  const crumb = header?.querySelector(".aug-page-header-breadcrumb a:not([aria-current])");
  const current = header?.querySelector('.aug-page-header-breadcrumb [aria-current="page"]');
  return {
    cardTitleSize: g(title, "fontSize"),
    cardTitleLh: g(title, "lineHeight"),
    cardTitleMt: g(title, "marginTop"),
    cardTitleMb: g(title, "marginBottom"),
    cardTitleWeight: g(title, "fontWeight"),
    cardDescLh: g(desc, "lineHeight"),
    cardContentPLh: g(contentP, "lineHeight"),
    phTitleSize: g(phTitle, "fontSize"),
    phTitleMt: g(phTitle, "marginTop"),
    phDescLh: g(phDesc, "lineHeight"),
    olPadding: g(ol, "paddingInlineStart"),
    li2MarginTop: g(li2, "marginTop"),
    crumbColor: g(crumb, "color"),
    crumbDecoration: g(crumb, "textDecorationLine"),
    currentColor: g(current, "color"),
  };
};

const METRIC_LABELS: Record<string, string> = {
  cardTitleSize: "card title font-size",
  cardTitleLh: "card title line-height",
  cardTitleMt: "card title margin-top",
  cardTitleMb: "card title margin-bottom",
  cardTitleWeight: "card title font-weight",
  cardDescLh: "card description line-height",
  cardContentPLh: "card content paragraph line-height",
  phTitleSize: "page-header title font-size",
  phTitleMt: "page-header title margin-top",
  phDescLh: "page-header description line-height",
  olPadding: "breadcrumb list inline padding",
  li2MarginTop: "breadcrumb second-item offset",
  crumbColor: "breadcrumb link color",
  crumbDecoration: "breadcrumb link decoration",
  currentColor: "breadcrumb current-page color",
};

test.describe("specimen rendering repair (#44)", () => {
  test("card typography and spacing are identical in bare host and docs", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, BARE_HOST);
    await page.evaluate(() => document.fonts.ready);
    const bareMetrics = (await page.evaluate(componentMetrics)) as Record<string, string | null>;
    await shot(page, "bare-hosts", true);

    await go(page, ORIGIN + site("/components/card"));
    await page.evaluate(() => document.fonts.ready);
    const docs = (await page.evaluate(componentMetrics)) as Record<string, string | null>;

    for (const key of Object.keys(METRIC_LABELS).filter((k) => k.startsWith("card"))) {
      assertOk(`${METRIC_LABELS[key]} identical in bare host and docs`, docs[key] != null && docs[key] === bareMetrics[key], `docs ${docs[key]} vs bare ${bareMetrics[key]}`);
    }
  });

  test("page-header metrics match in both hosts and respond to a narrow containing block", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, BARE_HOST);
    await page.evaluate(() => document.fonts.ready);
    const bareMetrics = (await page.evaluate(componentMetrics)) as Record<string, string | null>;
    const bareNarrow = await page.evaluate(() => {
      const header = document.querySelector("#page-header-host .aug-page-header") as HTMLElement | null;
      if (!header) return null;
      header.style.width = "290px";
      const title = header.querySelector(".aug-page-header-title")?.getBoundingClientRect();
      const description = header.querySelector(".aug-page-header-description")?.getBoundingClientRect();
      const actions = header.querySelector(".aug-page-header-actions")?.getBoundingClientRect();
      return {
        containerType: getComputedStyle(header).containerType,
        titleWidth: title?.width ?? 0,
        descriptionWidth: description?.width ?? 0,
        descriptionBottom: description?.bottom ?? 0,
        actionsTop: actions?.top ?? 0,
      };
    });
    assertOk(
      "standalone PageHeader responds to a narrow containing block",
      bareNarrow != null &&
        bareNarrow.containerType === "inline-size" &&
        bareNarrow.titleWidth >= 120 &&
        bareNarrow.descriptionWidth >= 120 &&
        bareNarrow.actionsTop >= bareNarrow.descriptionBottom,
      JSON.stringify(bareNarrow),
    );

    await go(page, ORIGIN + site("/patterns/page-header"));
    await page.evaluate(() => document.fonts.ready);
    const docs = (await page.evaluate(componentMetrics)) as Record<string, string | null>;
    const phKeys = Object.keys(METRIC_LABELS).filter((k) => k.startsWith("ph") || k.startsWith("ol") || k.startsWith("li2") || k.startsWith("crumb") || k.startsWith("current"));
    for (const key of phKeys) {
      assertOk(`${METRIC_LABELS[key]} identical in bare host and docs`, docs[key] != null && docs[key] === bareMetrics[key], `docs ${docs[key]} vs bare ${bareMetrics[key]}`);
    }
  });

  test("palette chips are painted fields in both themes and at 390px", async ({ page }) => {
    const readChips = (p: Page) =>
      p.evaluate(() => {
        const chips = [...document.querySelectorAll(".example-palette-chip")] as HTMLElement[];
        const cs = getComputedStyle(chips[0]);
        const rect = chips[0].getBoundingClientRect();
        return {
          count: chips.length,
          display: cs.display,
          height: cs.height,
          painted: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          background: cs.backgroundColor,
          border: cs.borderTopColor,
        };
      });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, ORIGIN + site("/foundations/color"));
    await page.evaluate(() => document.fonts.ready);
    const chipsLight = await readChips(page);
    assertOk("palette renders 15 chip fields (light)", chipsLight.count === 15, String(chipsLight.count));
    assertOk("palette chip is a 40px block field (light)", chipsLight.display === "block" && chipsLight.height === "40px", `${chipsLight.display} ${chipsLight.height}`);
    assertOk("palette chip paints a visible field (light)", !chipsLight.painted.startsWith("0x"), chipsLight.painted);
    assertOk("palette chip paints a token color (light)", chipsLight.background !== "rgba(0, 0, 0, 0)", chipsLight.background);
    assertOk("palette chip keeps the hairline edge (light)", chipsLight.border !== "rgba(0, 0, 0, 0)", chipsLight.border);
    await shot(page, "color-repaired-light", true);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const chipsDark = await readChips(page);
    assertOk("palette chip is a 40px block field (pinned dark)", chipsDark.display === "block" && chipsDark.height === "40px", `${chipsDark.display} ${chipsDark.height}`);
    assertOk(
      "palette chip paints its primitive token in pinned dark (theme-invariant by design)",
      chipsDark.background !== "rgba(0, 0, 0, 0)" && chipsDark.background === chipsLight.background,
      `${chipsLight.background} -> ${chipsDark.background}`,
    );
    await shot(page, "color-repaired-dark", true);

    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, ORIGIN + site("/foundations/color"));
    const mobileChips = await readChips(page);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assertOk("palette chip is a visible field at 390px", mobileChips.display === "block" && !mobileChips.painted.startsWith("0x"), mobileChips.painted);
    assertOk("color page has no horizontal overflow at 390px", mobileOverflow === false);
  });
});
