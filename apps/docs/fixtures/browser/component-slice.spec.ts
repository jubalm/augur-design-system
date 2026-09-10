// Button/Card computed-style review (issue #11).
import { test, type Page } from "@playwright/test";
import { assertOk, go, ORIGIN, shot, site } from "./helpers";

test.describe("component slice (Button/Card computed styles, both themes)", () => {
  const readButtonEvidence = (page: Page) =>
    page.evaluate(() => {
      const row = (theme: string) =>
        document.querySelector(theme === "dark" ? ".example-button-row[data-theme='dark']" : ".example-button-row:not([data-theme='dark'])") as HTMLElement;
      const primary = row("light").querySelector(".aug-button--default") as HTMLElement;
      const darkPrimary = row("dark").querySelector(".aug-button--default") as HTMLElement;
      const disabled = document.querySelector(".aug-button:disabled:not([aria-busy])") as HTMLElement | null;
      const loading = document.querySelector(".aug-button[aria-busy='true']") as HTMLElement | null;
      const cs = getComputedStyle(primary);
      return {
        height: cs.height,
        radius: cs.borderRadius,
        background: cs.backgroundColor,
        darkBackground: getComputedStyle(darkPrimary).backgroundColor,
        primaryToken: cs.getPropertyValue("--primary").trim(),
        font: cs.fontFamily,
        disabledCursor: disabled ? getComputedStyle(disabled).cursor : null,
        disabledOpacity: disabled ? getComputedStyle(disabled).opacity : null,
        loadingBusy: loading ? loading.getAttribute("aria-busy") : null,
        loadingSpinner: loading ? !!loading.querySelector(".aug-button-spinner") : null,
        loadingLabelVisibility: loading ? getComputedStyle(loading.querySelector(".aug-button-label") as HTMLElement).visibility : null,
      };
    });

  test("button geometry, roles, states, and pinned dark", async ({ page }) => {
    await go(page, ORIGIN + site("/components/button"));
    await page.evaluate(() => document.fonts.ready);
    const buttonLight = await readButtonEvidence(page);
    assertOk("default button height 36px (FD-02 structure)", buttonLight.height === "36px", buttonLight.height);
    assertOk("default button radius 0px (FD-03 encoded, issue #45/#51)", buttonLight.radius === "0px", buttonLight.radius);
    assertOk("control typography role applies (Sora)", buttonLight.font.includes("Sora"), buttonLight.font);
    assertOk("--primary resolves to a generated token (not var())", /^#[0-9a-f]{6}$/i.test(buttonLight.primaryToken), buttonLight.primaryToken);
    assertOk("default button paints --primary (light)", buttonLight.background !== "rgba(0, 0, 0, 0)", buttonLight.background);
    assertOk(
      "dark-scoped row paints a different action color (Deep -> Green with the theme)",
      buttonLight.background !== buttonLight.darkBackground,
      `${buttonLight.background} vs ${buttonLight.darkBackground}`,
    );
    assertOk("disabled button cursor not-allowed", buttonLight.disabledCursor === "not-allowed", String(buttonLight.disabledCursor));
    assertOk("disabled button opacity 0.5", buttonLight.disabledOpacity === "0.5", String(buttonLight.disabledOpacity));
    assertOk("loading button sets aria-busy", buttonLight.loadingBusy === "true", String(buttonLight.loadingBusy));
    assertOk("loading button renders the spinner", buttonLight.loadingSpinner === true);
    assertOk("loading button hides its label while keeping width", buttonLight.loadingLabelVisibility === "hidden", String(buttonLight.loadingLabelVisibility));
    await shot(page, "button-page-light", true);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const buttonDark = await readButtonEvidence(page);
    assertOk("pinned dark changes the same button's action color", buttonDark.background !== buttonLight.background, `${buttonLight.background} -> ${buttonDark.background}`);
  });

  test("card radius, surfaces, border, and title semantics", async ({ page }) => {
    await go(page, ORIGIN + site("/components/card"));
    await page.evaluate(() => document.fonts.ready);
    const cardLight = await page.evaluate(() => {
      const card = document.querySelector(".example-card-grid > .aug-card:not([data-theme])") as HTMLElement;
      const darkCard = document.querySelector(".example-card-grid > .aug-card[data-theme='dark']") as HTMLElement;
      const cs = getComputedStyle(card);
      return {
        radius: cs.borderRadius,
        background: cs.backgroundColor,
        cardToken: cs.getPropertyValue("--card").trim(),
        border: cs.borderTopColor,
        darkBackground: getComputedStyle(darkCard).backgroundColor,
        titleTag: card.querySelector(".aug-card-title")?.tagName ?? null,
      };
    });
    assertOk("card radius 0px (FD-03 encoded, issue #45/#50)", cardLight.radius === "0px", cardLight.radius);
    assertOk("card paints the --card role (light)", cardLight.background !== "rgba(0, 0, 0, 0)", cardLight.background);
    assertOk("--card resolves to a generated token (not var())", /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(cardLight.cardToken), cardLight.cardToken);
    assertOk("card border is the --border hairline (not transparent)", cardLight.border !== "rgba(0, 0, 0, 0)", cardLight.border);
    assertOk("dark-scoped card paints a different surface", cardLight.background !== cardLight.darkBackground, `${cardLight.background} vs ${cardLight.darkBackground}`);
    assertOk("card title renders h3", cardLight.titleTag === "H3", String(cardLight.titleTag));
    await shot(page, "card-page-light", true);
  });
});
