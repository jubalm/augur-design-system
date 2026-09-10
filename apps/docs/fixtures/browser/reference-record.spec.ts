// Reference record (#52, contract frame C) — pinned light/dark pair,
// artwork guard, mobile behavior.
import { test, type Page } from "@playwright/test";
import { assertOk, go, ORIGIN, shot, site } from "./helpers";

const read = (page: Page) =>
  page.evaluate(() => {
    const panels = [...document.querySelectorAll(".example-record-panel")] as HTMLElement[];
    const q = panels[0].querySelector(".example-record-question") as HTMLElement;
    const qSize = getComputedStyle(q).fontSize;
    const signals = [...document.querySelectorAll(".example-record-signal")].map((s) => {
      const r = s.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)} ${getComputedStyle(s).backgroundColor}`;
    });
    const btns = [...panels[0].querySelectorAll(".example-record-choices .aug-button")];
    const bw = btns.map((b) => Math.round(b.getBoundingClientRect().width));
    const bh = btns.map((b) => Math.round(b.getBoundingClientRect().height));
    const pressed = btns.map((b) => b.getAttribute("aria-pressed"));
    const domOrder = [...panels[0].children].map((el) => el.className);
    return {
      count: panels.length,
      themes: panels.map((x) => x.dataset.theme),
      widths: panels.map((x) => Math.round(x.getBoundingClientRect().width)),
      heights: panels.map((x) => Math.round(x.getBoundingClientRect().height)),
      bgs: panels.map((x) => getComputedStyle(x).backgroundColor),
      qSize,
      signals,
      btnCount: btns.length,
      bw,
      bh,
      pressed,
      domOrder,
      response: (panels[0].querySelector(".example-record-response") as HTMLElement).textContent?.replace(/\s+/g, " ").trim() ?? "",
    };
  });

test.describe("reference record (#52)", () => {
  test("pinned pair, geometry, state signals, and dark host", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, ORIGIN + site("/patterns/reference-record"));
    await page.evaluate(() => document.fonts.ready);
    const light = await read(page);
    assertOk("record renders as a pinned light/dark pair", light.count === 2 && light.themes[0] === "light" && light.themes[1] === "dark", light.themes.join("/"));
    assertOk("pair geometry identical", light.widths[0] === light.widths[1] && Math.abs(light.heights[0] - light.heights[1]) <= 1, `${light.widths.join("x")} / ${light.heights.join("x")}`);
    assertOk("pair panels paint differently", light.bgs[0] !== light.bgs[1], light.bgs.join(" vs "));
    assertOk("state signals are exactly 32x2 in both panels", light.signals.every((s) => s.startsWith("32x2")), light.signals.join(" | "));
    assertOk("question is the first substantive element after the state rail", light.domOrder[0] === "example-record-state" && light.domOrder[1].includes("example-record-question"), light.domOrder.join(" > "));
    assertOk("question renders at the approved heading-2 scale (focal point)", light.qSize === "20px", light.qSize);
    assertOk("choices are equal (two buttons, same size)", light.btnCount === 2 && light.bw[0] === light.bw[1] && light.bh[0] === light.bh[1], `${light.bw.join("x")} / ${light.bh.join("x")}`);
    assertOk("static choices do not announce a fabricated selection", light.pressed.every((value) => value === null), light.pressed.join("/"));
    assertOk("response is explicit and quiet", light.response.startsWith("Response") && light.response.includes("Not submitted"), light.response);
    await shot(page, "reference-record-light-1440", true);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const dark = await read(page);
    assertOk(
      "pair stays a true pair under dark host; signals hold Deep (light pin) and Green (dark pin)",
      dark.bgs[0] !== dark.bgs[1] && dark.signals[0].includes("rgb(9, 94, 66)") && dark.signals[1].includes("rgb(42, 231, 168)"),
      dark.signals.join(" | "),
    );
    await shot(page, "reference-record-dark-1440", true);
  });

  test("pattern examples contain no improvised artwork", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const counts: Record<string, number> = {};
    for (const route of [site("/patterns/reference-record"), site("/patterns/empty-state"), site("/patterns/page-header"), site("/patterns/form-field")]) {
      await go(page, ORIGIN + route);
      counts[route] = await page.evaluate(
        () => [...document.querySelectorAll(".doc-example-preview img, .doc-example-preview svg")].filter((el) => !el.closest("[class*='empty-state-icon']")).length,
      );
    }
    assertOk("pattern examples contain no improvised artwork (no img/svg)", Object.values(counts).every((c) => c === 0), JSON.stringify(counts));
  });

  test("choices stay side by side at 390px with no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, ORIGIN + site("/patterns/reference-record"));
    const mob = await page.evaluate(() => {
      const btns = ([...document.querySelectorAll(".example-record-panel")][0] as HTMLElement).querySelectorAll(".example-record-choices .aug-button");
      const tops = [...btns].map((b) => Math.round(b.getBoundingClientRect().top));
      return { sameRow: tops[0] === tops[1], overflow: document.documentElement.scrollWidth > window.innerWidth };
    });
    assertOk("choices stay side by side at 390", mob.sameRow);
    assertOk("no horizontal overflow at 390", mob.overflow === false);
    await shot(page, "reference-record-light-390", true);
  });
});
