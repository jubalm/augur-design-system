// Standalone consumer parity (#53) and page-opening alignment parity (#65).
import { test, type Page } from "@playwright/test";
import { assertOk, BARE_ORIGIN, go, ORIGIN, shot, site } from "./helpers";

const BARE_HOST = `${BARE_ORIGIN}/packages/design-system/fixtures/bare-hosts.html`;

test.describe("standalone consumer (#53)", () => {
  test("bare package host: fonts, geometry, scoped dark, clean console", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const consumerIssues: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") consumerIssues.push(m.text());
    });
    await go(page, BARE_HOST);
    await page.evaluate(async () => {
      await document.fonts.load("16px Sora");
      await document.fonts.load("600 40px Sora");
      await document.fonts.load("16px 'Schibsted Grotesk'");
      await document.fonts.ready;
    });
    const evidence = await page.evaluate(() => {
      const btn = document.querySelector(".aug-button") as HTMLElement;
      const card = document.querySelector(".aug-card") as HTMLElement;
      const darkCard = document.querySelector('[data-theme="dark"] .aug-card, .aug-card[data-theme="dark"]') as HTMLElement | null;
      return {
        faces: document.fonts.size,
        fontsLoaded: document.fonts.status,
        sora400: document.fonts.check("16px Sora"),
        sora600: document.fonts.check("600 40px Sora"),
        schibsted: document.fonts.check("16px 'Schibsted Grotesk'"),
        bodyFamily: getComputedStyle(document.body).fontFamily,
        buttonHeight: getComputedStyle(btn).height,
        buttonRadius: getComputedStyle(btn).borderRadius,
        cardRadius: getComputedStyle(card).borderRadius,
        darkCardPresent: !!darkCard,
        darkCardBg: darkCard ? getComputedStyle(darkCard).backgroundColor : null,
        lightCardBg: getComputedStyle(card).backgroundColor,
      };
    });
    assertOk(
      "standalone consumer registers and loads the real font faces",
      evidence.faces >= 6 && evidence.fontsLoaded === "loaded" && evidence.sora400 && evidence.sora600 && evidence.schibsted,
      `faces=${evidence.faces} status=${evidence.fontsLoaded}`,
    );
    assertOk("standalone consumer body carries the secondary voice", evidence.bodyFamily.includes("Schibsted Grotesk"), evidence.bodyFamily);
    assertOk("standalone control geometry matches the encoded contract", evidence.buttonHeight === "36px" && evidence.buttonRadius === "0px", `${evidence.buttonHeight} / ${evidence.buttonRadius}`);
    assertOk("standalone card surface matches the encoded contract", evidence.cardRadius === "0px", evidence.cardRadius);
    assertOk("semantic theme evidence: scoped dark subtree paints differently", evidence.darkCardPresent && evidence.darkCardBg !== evidence.lightCardBg, `${evidence.lightCardBg} vs ${evidence.darkCardBg}`);
    assertOk("standalone consumer produces no console errors/warnings", consumerIssues.length === 0, consumerIssues.join("; ") || "clean");
    await shot(page, "standalone-consumer", true);
  });
});

// --- 15. Page-opening alignment parity (issue #65). ---------------------
const readOpening = (page: Page) =>
  page.evaluate(() => {
    const rect = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect() : null;
    };
    return {
      titleX: rect(".page-title")?.x ?? null,
      actionsRight: rect(".doc-page-head .page-actions")?.right ?? null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

test.describe("page-opening alignment parity (#65)", () => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 375, height: 812 },
  ]) {
    test(`${viewport.width}px viewport`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const read = async (path: string) => {
        await go(page, ORIGIN + site(path));
        await page.evaluate(() => document.fonts.ready);
        return readOpening(page);
      };
      const started = await read("/getting-started");
      const sectioned = await read("/foundations");
      const vp = `${viewport.width}px viewport`;
      assertOk(
        `${vp} Getting started H1 left edge matches the Foundations section page`,
        started.titleX !== null && sectioned.titleX !== null && Math.abs(started.titleX - sectioned.titleX) <= 1,
        `getting-started ${started.titleX} vs foundations ${sectioned.titleX}`,
      );
      assertOk(
        `${vp} Copy page control right edge matches the section page header pattern`,
        started.actionsRight !== null && sectioned.actionsRight !== null && Math.abs(started.actionsRight - sectioned.actionsRight) <= 1,
        `getting-started ${started.actionsRight} vs foundations ${sectioned.actionsRight}`,
      );
      assertOk(`${vp} no horizontal overflow on either page`, !started.overflowX && !sectioned.overflowX, `${started.overflowX} / ${sectioned.overflowX}`);
    });
  }
});
