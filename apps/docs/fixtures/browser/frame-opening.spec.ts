// Shared frame alignment (#46), brand opening (#47), and the type
// specimen (#48).
import { test, type Page } from "@playwright/test";
import { assertOk, go, ORIGIN, shot, site } from "./helpers";

// --- 10. Shared frame alignment (#46). ------------------------------------
const readFrame = (page: Page) =>
  page.evaluate(() => {
    const cs = (sel: string, prop: string) => {
      const el = document.querySelector(sel);
      return el ? (getComputedStyle(el) as unknown as Record<string, string>)[prop] : null;
    };
    const probeCh = document.createElement("div");
    probeCh.style.width = "65ch";
    probeCh.style.position = "absolute";
    probeCh.style.visibility = "hidden";
    document.body.appendChild(probeCh);
    const measure65 = probeCh.getBoundingClientRect().width;
    probeCh.remove();
    const title = getComputedStyle(document.querySelector(".page-title") as HTMLElement);
    const h2 = document.querySelector(".prose h2");
    return {
      frameMax: cs(".shell", "maxWidth"),
      framePad: cs(".shell", "paddingLeft"),
      mainX: Math.round((document.querySelector(".shell") as HTMLElement).getBoundingClientRect().x),
      proseMax: cs(".prose", "maxWidth"),
      measure65: `${measure65}px`,
      titleFont: `${title.fontFamily.split(",")[0]} ${title.fontWeight} ${title.fontSize}/${title.lineHeight} ${title.letterSpacing}`,
      h2: h2 ? `${getComputedStyle(h2).fontSize}/${getComputedStyle(h2).lineHeight} w${getComputedStyle(h2).fontWeight}` : null,
      wordmark: (() => {
        const el = document.querySelector(".brand-lockup-wordmark");
        if (!el) return null;
        const s = getComputedStyle(el);
        return `${s.fontFamily.split(",")[0]} ${s.fontWeight} ${s.fontSize}/${s.lineHeight}`;
      })(),
      descriptor: (() => {
        const el = document.querySelector(".brand-lockup-descriptor");
        if (!el) return null;
        const s = getComputedStyle(el);
        return `${s.textTransform} ${s.letterSpacing} ${s.color}`;
      })(),
      headerBorder: cs(".masthead", "borderBottomColor"),
      controlEdge: cs(".doc-sidebar", "borderRightColor"),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

test.describe("shared frame alignment (#46)", () => {
  test("1440px frame, measure, roles, and both hairlines", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, ORIGIN + site("/foundations/color"));
    await page.evaluate(() => document.fonts.ready);
    const light = await readFrame(page);
    assertOk("frame is 1400px with 64px gutters at 1440", light.frameMax === "1400px" && light.framePad === "64px", `${light.frameMax} / ${light.framePad}`);
    assertOk("centered frame leaves the 20px side margin at 1440", light.mainX === 20, String(light.mainX));
    assertOk("reading measure is exactly 65ch", Math.abs(parseFloat(light.proseMax as string) - parseFloat(light.measure65)) < 0.5, `${light.proseMax} vs ${light.measure65}`);
    assertOk("page title renders the editorial-title role (Sora 400 40/48)", light.titleFont === "Sora 400 40px/48px -0.4px", light.titleFont);
    assertOk("section headings render the editorial-section metrics (28/34, regular)", light.h2 === "28px/34px w400", String(light.h2));
    assertOk("header wordmark is the ui role (Sora 400 14/20)", light.wordmark === "Sora 400 14px/20px", String(light.wordmark));
    assertOk("descriptor is uppercase tracked secondary text (+0.12em)", light.descriptor === "uppercase 1.44px rgb(74, 75, 97)", String(light.descriptor));
    assertOk("light header hairline matches the (shared) quiet separator", light.headerBorder === light.controlEdge, `${light.headerBorder} vs ${light.controlEdge}`);
    assertOk("no horizontal overflow at 1440", light.overflowX === false);
    await shot(page, "frame-1440-light", true);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const dark = await readFrame(page);
    assertOk(
      "dark editorial separator is the quiet Surface 3 step (header and sidebar hairlines share it)",
      dark.headerBorder === "rgb(36, 36, 56)" && dark.headerBorder === dark.controlEdge,
      `${dark.headerBorder} vs sidebar ${dark.controlEdge}`,
    );
    assertOk("dark descriptor flips to the dark secondary role", dark.descriptor === "uppercase 1.44px rgb(161, 161, 184)", String(dark.descriptor));
    await shot(page, "frame-1440-dark", true);
  });

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`narrow frame at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await go(page, ORIGIN + site("/foundations/color"));
      const narrow = await readFrame(page);
      assertOk(`frame uses 24px gutters at ${viewport.width}`, narrow.framePad === "24px", String(narrow.framePad));
      assertOk(`no horizontal overflow at ${viewport.width}`, narrow.overflowX === false);
      if (viewport.width === 390) {
        assertOk("page title steps down to the adopted 32/40 mobile size", narrow.titleFont === "Sora 400 32px/40px -0.32px", narrow.titleFont);
      }
      await shot(page, `frame-${viewport.width}-light`, true);
    });
  }
});

// --- 11. Brand opening (issue #47, contract frame A). ---------------------
const readOpening = (page: Page) =>
  page.evaluate(() => {
    const cs = (sel: string, prop: string) => {
      const el = document.querySelector(sel);
      return el ? (getComputedStyle(el) as unknown as Record<string, string>)[prop] : null;
    };
    const sig = document.querySelector(".opening-signal") as HTMLElement;
    const r = sig.getBoundingClientRect();
    const cols = (cs(".opening", "gridTemplateColumns") as string).split(" ").map(parseFloat);
    return {
      titleText: (document.querySelector(".opening-message h1") as HTMLElement).textContent ?? "",
      titleFont: (() => {
        const s = getComputedStyle(document.querySelector(".opening-message h1") as HTMLElement);
        return `${s.fontWeight} ${s.fontSize}/${s.lineHeight}`;
      })(),
      signal: `${Math.round(r.width)}x${Math.round(r.height)}`,
      signalColor: cs(".opening-signal", "backgroundColor"),
      actionColor: cs(".opening-action", "color"),
      actionText: (document.querySelector(".opening-action") as HTMLElement).textContent?.trim() ?? "",
      lede: (document.querySelector(".opening-lede") as HTMLElement).textContent?.replace(/\s+/g, " ").trim() ?? "",
      colRatio: cols.length === 2 ? cols[1] / cols[0] : null,
      openingHeight: Math.round((document.querySelector(".opening") as HTMLElement).getBoundingClientRect().height),
      tracks: document.querySelectorAll(".opening-footer > div").length,
      wordmarkSize: cs(".opening-wordmark", "fontSize"),
      display: cs(".opening", "display"),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

test.describe("brand opening (#47)", () => {
  test("desktop opening contract, route links, and dark signal", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, ORIGIN + site("/"));
    await page.evaluate(() => document.fonts.ready);
    const openLight = await readOpening(page);
    assertOk(
      "opening title is the locked message in the editorial-title role",
      openLight.titleText.trim() === "Make whatmatters clear." && openLight.titleFont === "400 40px/48px",
      `${openLight.titleFont} "${openLight.titleText.replace(/\s+/g, " ").trim()}"`,
    );
    assertOk("opening signal is exactly 32x2", openLight.signal === "32x2", openLight.signal);
    assertOk("light signal paints Deep through --primary", openLight.signalColor === "rgb(9, 94, 66)", openLight.signalColor);
    assertOk("text action stays neutral foreground (not accent)", openLight.actionColor === "rgb(14, 14, 33)" && openLight.actionText.startsWith("Explore the foundations"), `${openLight.actionColor} "${openLight.actionText}"`);
    assertOk("lede is the locked shared-interface-language copy", openLight.lede.startsWith("A shared interface language for Augur: foundations, components, and guidance for clear, consistent interfaces."), openLight.lede.slice(0, 60));
    assertOk("rail and message hold the 1:2 opening columns", openLight.colRatio !== null && Math.abs(openLight.colRatio - 2) < 0.05, String(openLight.colRatio));
    assertOk("opening meets the 520px desktop minimum height", openLight.openingHeight >= 520, String(openLight.openingHeight));
    assertOk("metadata row has three equal tracks", openLight.tracks === 3, String(openLight.tracks));
    assertOk("identity lockup renders at opening scale", openLight.wordmarkSize === "40px", openLight.wordmarkSize);
    assertOk("no horizontal overflow at 1440", openLight.overflowX === false);
    const routeHrefs = await page.evaluate(() =>
      [...document.querySelectorAll(".route-group a")].map((a) => new URL(a.getAttribute("href") as string, location.href).pathname),
    );
    const broken: string[] = [];
    for (const h of routeHrefs) {
      const res = await fetch(ORIGIN + (h.endsWith("/") ? `${h}index.html` : h));
      if (res.status !== 200) broken.push(h);
    }
    assertOk("all 18 route links resolve to built pages", routeHrefs.length === 18 && broken.length === 0, broken.join(", ") || "ok");
    await shot(page, "home-opening-light-1440", true);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const openDark = await readOpening(page);
    assertOk("dark signal swaps to Green on the same node", openDark.signalColor === "rgb(42, 231, 168)", openDark.signalColor);
    assertOk("dark action stays neutral foreground", openDark.actionColor === "rgb(245, 245, 248)", openDark.actionColor);
    await shot(page, "home-opening-dark-1440", true);
  });

  test("mobile stacks the opening at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, ORIGIN + site("/"));
    const openMobile = await readOpening(page);
    assertOk("mobile stacks the opening (rail above message)", openMobile.display === "flex", String(openMobile.display));
    assertOk("mobile title steps to the adopted 32/40", openMobile.titleFont === "400 32px/40px", String(openMobile.titleFont));
    assertOk("no horizontal overflow at 390", openMobile.overflowX === false);
    await shot(page, "home-opening-light-390", true);
  });
});

// --- 12. Type specimen (issue #48, contract frame B). ---------------------
test.describe("type specimen (#48)", () => {
  const read = (page: Page) =>
    page.evaluate(() => {
      const rows = [...document.querySelectorAll(".type-compare-row")];
      const field = document.querySelector(".type-display-field") as HTMLElement;
      const sample = field?.querySelector(".type-display-sample") as HTMLElement;
      const notes = document.querySelectorAll(".type-specimen-notes > div").length;
      const cs = getComputedStyle(field);
      const sampleCS = getComputedStyle(sample);
      const cols = getComputedStyle(document.querySelector(".type-specimen-grid") as HTMLElement).gridTemplateColumns.split(" ").length;
      return {
        rows: rows.length,
        fieldBg: cs.backgroundColor,
        fieldFg: cs.color,
        sampleWeight: sampleCS.fontWeight,
        sampleSize: sampleCS.fontSize,
        notes,
        cols,
        specs: rows.map((r) => (r.querySelector(".type-compare-spec") as HTMLElement).textContent?.trim().slice(0, 24)),
        rowSampleWeights: rows.slice(0, 3).map((r) => getComputedStyle(r.querySelector("[class*='augur-type-']") as HTMLElement).fontWeight),
      };
    });

  test("desktop specimen roles, grid, and dark inverse field", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go(page, ORIGIN + site("/foundations/fonts"));
    await page.evaluate(() => document.fonts.ready);
    const light = await read(page);
    assertOk("specimen shows all ten roles as compact aligned rows", light.rows === 10, String(light.rows));
    assertOk("display field is the inverse tonal field (light: Navy field, Paper text)", light.fieldBg === "rgb(14, 14, 33)" && light.fieldFg === "rgb(245, 245, 248)", `${light.fieldBg} / ${light.fieldFg}`);
    assertOk("display sample renders Sora 600 at the display role", light.sampleWeight === "600" && light.sampleSize === "40px", `${light.sampleWeight} ${light.sampleSize}`);
    assertOk("three rule-led support notes", light.notes === 3, String(light.notes));
    assertOk("frame B holds the 2:1 specimen grid at 1440", light.cols === 2, String(light.cols));
    assertOk("no false weights: leading samples carry their real roles", light.rowSampleWeights[0] === "600" && light.rowSampleWeights[2] === "600", light.rowSampleWeights.join(", "));
    await shot(page, "type-specimen-light-1440", true);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const dark = await read(page);
    assertOk("display field swaps Navy/Paper in dark while keeping geometry", dark.fieldBg === "rgb(245, 245, 248)" && dark.fieldFg === "rgb(14, 14, 33)", `${dark.fieldBg} / ${dark.fieldFg}`);
    await shot(page, "type-specimen-dark-1440", true);
  });

  test("frame B stacks at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, ORIGIN + site("/foundations/fonts"));
    const stack = await page.evaluate(() => {
      const grid = document.querySelector(".type-specimen-grid") as HTMLElement;
      const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const main = grid.children[0].getBoundingClientRect();
      const notes = grid.children[1].getBoundingClientRect();
      return { cols, mainFirst: main.top < notes.top, overflow: document.documentElement.scrollWidth > window.innerWidth };
    });
    assertOk("frame B stacks: specimen first, notes below at 390", stack.cols === 1 && stack.mainFirst, `cols=${stack.cols} mainFirst=${stack.mainFirst}`);
    assertOk("no horizontal overflow at 390", stack.overflow === false);
  });
});
