// Starter component browser coverage (issue #15). Assertions mirror the
// previous driver; tests are split so the runner can parallelize
// independent page loads.
import { test, type Page } from "@playwright/test";
import { assertOk, go, openDialog, shot, waitForIsland } from "./helpers";

const panelState = (page: Page) =>
  page.evaluate(() => {
    const panel = document.querySelector(".aug-dialog-content") as HTMLElement | null;
    if (!panel) return { open: false, popover: "" };
    return {
      open: true,
      inBody: document.body.contains(panel),
      overflow: getComputedStyle(document.body).overflow,
      focusInPanel: panel.contains(document.activeElement),
      role: panel.getAttribute("role"),
      labelledby:
        !!panel.getAttribute("aria-labelledby") &&
        !!document.getElementById(panel.getAttribute("aria-labelledby") as string),
      describedby:
        !!panel.getAttribute("aria-describedby") &&
        !!document.getElementById(panel.getAttribute("aria-describedby") as string),
      popover: getComputedStyle(panel).getPropertyValue("--popover").trim(),
    };
  });

test.describe("starter components (#15)", () => {
  test("dialog: keyboard, focus containment, dismissal, scroll lock, dark scope", async ({ page }) => {
    const consoleIssues: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") consoleIssues.push(`${msg.type()}: ${msg.text()}`);
    });
    await go(page, "/components/dialog");
    await page.evaluate(() => document.fonts.ready);
    await waitForIsland(page);

    const trigger = page.getByRole("button", { name: "Open dialog", exact: true });
    await openDialog(page, trigger);
    let open = await panelState(page);
    assertOk("dialog opens via keyboard Enter", open.open === true);
    assertOk("open dialog exposes the dialog role", open.role === "dialog", String(open.role));
    assertOk("dialog is named (aria-labelledby resolves)", open.labelledby === true);
    assertOk("dialog is described (aria-describedby resolves)", open.describedby === true);
    assertOk("focus moved into the panel on open", open.focusInPanel === true);
    assertOk("body scroll is locked while open", open.overflow === "hidden", String(open.overflow));
    await shot(page, "dialog-open-light");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    open = await panelState(page);
    assertOk("focus stays contained under Tab/Shift+Tab", open.focusInPanel === true);

    await page.keyboard.press("Escape");
    await page.waitForSelector(".aug-dialog-content", { state: "detached" });
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Open dialog");
    const closed = await page.evaluate(() => ({
      focus: document.activeElement?.textContent?.trim() ?? null,
      overflow: getComputedStyle(document.body).overflow,
    }));
    assertOk("Escape closes the dialog", !String(closed.focus).includes("Review query"));
    assertOk("focus is restored to the trigger after Escape", /Open dialog/.test(String(closed.focus)), String(closed.focus));
    assertOk("body scroll unlocks after close", closed.overflow !== "hidden", String(closed.overflow));

    await openDialog(page, trigger);
    await page.waitForTimeout(400);
    await page.locator(".aug-dialog-overlay").click({ position: { x: 8, y: 8 }, force: true });
    await page.waitForSelector(".aug-dialog-content", { state: "detached" });
    const afterOverlay = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);
    assertOk("overlay click dismisses the dialog", !String(afterOverlay).includes("Review query"));
    assertOk("focus restored after overlay dismissal", /Open dialog/.test(String(afterOverlay)), String(afterOverlay));

    const lightPopover = open.popover;
    const darkTrigger = page.getByRole("button", { name: "Open dialog (dark scope)" });
    await openDialog(page, darkTrigger);
    const darkPanel = await page.evaluate(() => {
      const panel = document.querySelector(".aug-dialog-content") as HTMLElement | null;
      const scope = panel?.closest('[data-theme="dark"]');
      return {
        inDarkScope: !!scope,
        popover: panel ? getComputedStyle(panel).getPropertyValue("--popover").trim() : "",
      };
    });
    assertOk("dark scoped dialog portals into the dark subtree", darkPanel.inDarkScope === true);
    assertOk(
      "dark scoped panel inherits the dark --popover role",
      darkPanel.popover !== lightPopover,
      `${lightPopover} -> ${darkPanel.popover}`,
    );
    await shot(page, "dialog-open-dark-scope");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".aug-dialog-content", { state: "detached" });
    assertOk("dialog island produces no console errors/warnings", consoleIssues.length === 0, consoleIssues.join("; ") || "clean");
  });

  test("dialog: reduced motion collapses transitions", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await go(page, "/components/dialog");
    await waitForIsland(page);
    await openDialog(page, page.getByRole("button", { name: "Open dialog", exact: true }));
    const rmDurations = await page.evaluate(() =>
      [...document.querySelectorAll(".aug-dialog-content, .aug-dialog-overlay")].flatMap((el) =>
        getComputedStyle(el).transitionDuration.split(",").map((v) => parseFloat(v)),
      ),
    );
    assertOk("reduced motion collapses open/close transitions", rmDurations.length > 0 && rmDurations.every((v) => v < 0.01), rmDurations.join(" | "));
    await context.close();
  });

  test("dialog: mobile 375px long-content panel", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await go(page, "/components/dialog");
    await waitForIsland(page);
    await openDialog(page, page.getByRole("button", { name: "Open long-content dialog" }));
    const mobilePanel = await page.evaluate(() => {
      const rect = (document.querySelector(".aug-dialog-content") as HTMLElement).getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        viewport: window.innerWidth,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    assertOk("mobile dialog panel respects the 100vw-16px cap", mobilePanel.width <= mobilePanel.viewport - 16, `${mobilePanel.width}px @ ${mobilePanel.viewport}px`);
    assertOk("mobile dialog panel fits the viewport height", mobilePanel.height <= 812, `${mobilePanel.height}px`);
    assertOk("mobile dialog causes no horizontal overflow", mobilePanel.overflowX === false);
    await shot(page, "dialog-mobile-long-content");
  });

  test("input: focus, typing, ARIA wiring, both themes", async ({ page }) => {
    await go(page, "/components/input");
    await page.evaluate(() => document.fonts.ready);
    const firstInput = page.locator("input, textarea").first();
    const inputLight = await firstInput.evaluate((el) => ({
      border: getComputedStyle(el).borderTopColor,
      background: getComputedStyle(el).backgroundColor,
      labelled: !!(el as HTMLInputElement).labels?.length,
      describedby: el.getAttribute("aria-describedby"),
    }));
    assertOk("input is programmatically labelled", inputLight.labelled === true);
    assertOk(
      "input aria-describedby points at a real element",
      !inputLight.describedby || (await page.locator(`#${CSS.escape(inputLight.describedby)}`).count()) > 0,
      String(inputLight.describedby),
    );
    await firstInput.focus();
    const focusVisible = await firstInput.evaluate((el) => el.matches(":focus-visible"));
    await firstInput.fill("typed in a real browser");
    assertOk("input receives keyboard focus (focus-visible)", focusVisible === true);
    assertOk("input accepts typed text", (await firstInput.inputValue()) === "typed in a real browser");
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    const inputDark = await firstInput.evaluate((el) => ({
      border: getComputedStyle(el).borderTopColor,
      background: getComputedStyle(el).backgroundColor,
    }));
    assertOk(
      "input paints differently in pinned dark (same node)",
      inputLight.background !== inputDark.background || inputLight.border !== inputDark.border,
      `bg ${inputLight.background} -> ${inputDark.background}; border ${inputLight.border} -> ${inputDark.border}`,
    );
    await shot(page, "input-page-dark", true);
  });

  test("form-field: label/control wiring", async ({ page }) => {
    await go(page, "/patterns/form-field");
    const formWiring = await page.evaluate(() => {
      const field = document.querySelector(".example-form-field-grid");
      const control = field?.querySelector("input, textarea, select") as HTMLElement | null;
      const label = field?.querySelector("label") as HTMLLabelElement | null;
      return {
        rendered: !!field,
        htmlForMatches: !!control && !!label && label.htmlFor === control.id,
      };
    });
    assertOk("form-field composition example renders", formWiring.rendered === true);
    assertOk("form-field label htmlFor matches the control", formWiring.htmlForMatches === true);
  });

  test("pattern pages render examples", async ({ page }) => {
    for (const route of ["/patterns/page-header", "/patterns/empty-state"]) {
      await go(page, route);
      const count = await page.locator(".example-card-grid").count();
      assertOk(`${route} examples render as built`, count >= 1, `${count} example block(s)`);
    }
  });

  const PAGE_HEADER_MATRIX = [
    "page-header-composition/light",
    "page-header-composition/dark",
    "page-header-long-content/light",
    "page-header-long-content/dark",
  ].sort();

  const readPageHeader = (page: Page) =>
    page.evaluate(() => {
      const sample = [...document.querySelectorAll(".doc-example .aug-page-header")].filter((header) =>
        header.querySelector(".aug-page-header-actions"),
      );
      return {
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        metrics: sample.map((header) => {
          const figure = header.closest("figure.doc-example");
          const specimen = (figure?.getAttribute("aria-labelledby") ?? "").replace(/^example-|-caption$/g, "");
          const title = header.querySelector(".aug-page-header-title");
          const description = header.querySelector(".aug-page-header-description");
          const actions = header.querySelector(".aug-page-header-actions");
          const rect = (element: Element | null) => element?.getBoundingClientRect();
          const titleRect = rect(title);
          const descriptionRect = rect(description);
          const actionsRect = rect(actions);
          const headerRect = rect(header);
          const right = (r: DOMRect | undefined) => r?.right ?? 0;
          return {
            specimen,
            theme: header.getAttribute("data-theme") ?? "light",
            titleWidth: Math.round(titleRect?.width ?? 0),
            descriptionWidth: Math.round(descriptionRect?.width ?? 0),
            descriptionBottom: Math.round(descriptionRect?.bottom ?? 0),
            actionsTop: Math.round(actionsRect?.top ?? 0),
            actionGap: Math.round((actionsRect?.top ?? 0) - (descriptionRect?.bottom ?? 0)),
            overflow:
              (header as HTMLElement).scrollWidth > (header as HTMLElement).clientWidth + 1 ||
              right(titleRect) > right(headerRect) + 1 ||
              right(descriptionRect) > right(headerRect) + 1,
          };
        }),
      };
    });

  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`page-header acceptance matrix at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await go(page, "/patterns/page-header");
      const audit = await readPageHeader(page);
      const keys = audit.metrics.map(({ specimen, theme }) => `${specimen}/${theme}`).sort();
      assertOk(
        `PageHeader full acceptance matrix at ${viewport.width}px`,
        keys.length === 4 && PAGE_HEADER_MATRIX.every((key, index) => key === keys[index]),
        JSON.stringify(keys),
      );
      const unreadable = audit.metrics.filter(
        ({ titleWidth, descriptionWidth, descriptionBottom, actionsTop }) =>
          titleWidth < 120 || descriptionWidth < 120 || actionsTop < descriptionBottom,
      );
      assertOk(`PageHeader stays readable at ${viewport.width}px`, unreadable.length === 0, JSON.stringify(unreadable));
      const overflowing = audit.metrics.filter(({ overflow }) => overflow);
      assertOk(`PageHeader has no horizontal overflow at ${viewport.width}px`, audit.pageOverflow === false && overflowing.length === 0, JSON.stringify({ pageOverflow: audit.pageOverflow, overflowing }));
      const divergences: string[] = [];
      for (const specimen of ["page-header-composition", "page-header-long-content"]) {
        const light = audit.metrics.find((m) => m.specimen === specimen && m.theme === "light");
        const dark = audit.metrics.find((m) => m.specimen === specimen && m.theme === "dark");
        if (!light || !dark) {
          divergences.push(`${specimen}: theme pair missing`);
          continue;
        }
        for (const key of ["titleWidth", "descriptionWidth", "actionGap"] as const) {
          if (Math.abs(light[key] - dark[key]) > 1) {
            divergences.push(`${specimen}.${key}: light ${light[key]} vs dark ${dark[key]}`);
          }
        }
      }
      assertOk(`PageHeader theme geometry matches at ${viewport.width}px`, divergences.length === 0, JSON.stringify(divergences));
    });
  }

  test("button: focus-visible and Enter/Space activation", async ({ page }) => {
    await go(page, "/components/button");
    const btn = page.locator(".aug-button:not([disabled])").first();
    await btn.focus();
    const btnFocusVisible = await btn.evaluate((el) => el.matches(":focus-visible"));
    assertOk("button shows focus-visible on keyboard focus", btnFocusVisible === true);
    let clicks = 0;
    page.on("console", (msg) => {
      if (msg.text() === "[augur-click]") clicks += 1;
    });
    await btn.evaluate((el) => el.addEventListener("click", () => console.log("[augur-click]")));
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");
    await page.waitForTimeout(300);
    assertOk("button activates via Enter and Space", clicks === 2, String(clicks));
  });
});
