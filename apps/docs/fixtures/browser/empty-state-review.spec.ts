import { test } from "@playwright/test";
import { assertOk, go } from "./helpers";

function channel(value: number) {
  const number = value;
  return number <= 0.03928 ? number / 12.92 : ((number + 0.055) / 1.055) ** 2.4;
}

function contrast(foreground: string, background: string) {
  const rgb = (value: string) => value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const [fr, fg, fb] = rgb(foreground).map((value) => channel(value / 255));
  const [br, bg, bb] = rgb(background).map((value) => channel(value / 255));
  const foregroundLuminance = 0.2126 * fr + 0.7152 * fg + 0.0722 * fb;
  const backgroundLuminance = 0.2126 * br + 0.7152 * bg + 0.0722 * bb;
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

test("EmptyState dark specimens paint their scoped semantic surface", async ({ page }) => {
  await go(page, "/patterns/empty-state");
  await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });

  const evidence = await page.locator(".doc-example-theme").evaluateAll((panels) =>
    panels.map((panel) => {
      const element = panel as HTMLElement;
      const emptyState = element.querySelector(".aug-empty-state") as HTMLElement;
      const outline = element.querySelector(".aug-button--outline") as HTMLElement | null;
      const panelStyle = getComputedStyle(element);
      const emptyStyle = getComputedStyle(emptyState);
      return {
        background: panelStyle.backgroundColor,
        foreground: panelStyle.color,
        theme: element.dataset.theme ?? "light",
        emptyBackground: emptyStyle.backgroundColor,
        descriptionColor: getComputedStyle(emptyState.querySelector(".aug-empty-state-description") as HTMLElement).color,
        outlineColor: outline ? getComputedStyle(outline).color : null,
      };
    }),
  );

  const darkEvidence = evidence.filter((item) => item.theme === "dark");
  assertOk("all three EmptyState dark specimens sit in a painted dark scope", darkEvidence.length === 3, JSON.stringify(evidence));
  assertOk("dark wrapper background is distinct from the light docs canvas", darkEvidence.every((item) => item.background !== "rgb(245, 245, 248)"), JSON.stringify(evidence));
  assertOk("transparent EmptyState preserves wrapper background", evidence.every((item) => item.emptyBackground === "rgba(0, 0, 0, 0)"), JSON.stringify(evidence));
  assertOk("dark wrapper supplies a foreground role", darkEvidence.every((item) => item.foreground !== "rgb(14, 14, 33)"), JSON.stringify(evidence));
  assertOk("dark outline action inherits the scoped foreground", darkEvidence[0]?.outlineColor === darkEvidence[0]?.foreground, JSON.stringify(evidence));
  assertOk("each dark wrapper foreground clears normal-text contrast", darkEvidence.every((item) => contrast(item.foreground, item.background) >= 4.5), JSON.stringify(evidence));
  assertOk("each dark description clears normal-text contrast", darkEvidence.every((item) => contrast(item.descriptionColor, item.background) >= 4.5), JSON.stringify(evidence));
});

for (const theme of ["light", "dark"]) {
  test(`documentation code blocks preserve Shiki foreground in ${theme} theme`, async ({ page }) => {
    await go(page, "/reference/component-conventions");
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);

    const evidence = await page.locator(".prose").evaluate((prose) => {
      const contrastRatio = (foreground: string, background: string) => {
        const channel = (value: number) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        const rgb = (value: string) => value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        const [fr, fg, fb] = rgb(foreground).map((value) => channel(value / 255));
        const [br, bg, bb] = rgb(background).map((value) => channel(value / 255));
        const foregroundLuminance = 0.2126 * fr + 0.7152 * fg + 0.0722 * fb;
        const backgroundLuminance = 0.2126 * br + 0.7152 * bg + 0.0722 * bb;
        return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
          (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
      };
      const blocks = [...prose.querySelectorAll("pre")].map((block) => {
        const code = block.querySelector("code");
        return code ? {
          pre: getComputedStyle(block).color,
          code: getComputedStyle(code).color,
          contrast: contrastRatio(getComputedStyle(block).color, getComputedStyle(block).backgroundColor),
        } : null;
      });
      const inline = prose.querySelector("p code, li code");
      return {
        blocks,
        inline: inline ? { color: getComputedStyle(inline).color, background: getComputedStyle(inline).backgroundColor } : null,
      };
    });

    assertOk("all fenced code blocks contain code", evidence.blocks.length > 0 && evidence.blocks.every(Boolean), JSON.stringify(evidence));
    assertOk("plain fenced code preserves each Shiki block foreground", evidence.blocks.every((block) => block?.code === block?.pre), JSON.stringify(evidence));
    assertOk("each fenced code block clears contrast", evidence.blocks.every((block) => (block?.contrast ?? 0) >= 4.5), JSON.stringify(evidence));
    assertOk("inline code retains semantic inline treatment", !!evidence.inline?.background && evidence.inline.background !== "rgba(0, 0, 0, 0)", JSON.stringify(evidence));
  });
}
