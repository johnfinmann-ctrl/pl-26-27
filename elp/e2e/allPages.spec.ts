import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", heading: null },
  { path: "/naeste-runde", heading: "Næste runde" },
  { path: "/prognose", heading: "Prognose" },
  { path: "/program", heading: "Program" },
  { path: "/hold", heading: "Hold" },
  { path: "/simulator", heading: "Hvad nu hvis?" },
  { path: "/metoden", heading: "Metoden" },
];

test.describe("Alle syv hovedsider", () => {
  for (const p of pages) {
    test(`${p.path} åbner uden fejl`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      if (p.heading) {
        await expect(
          page.getByRole("heading", { name: p.heading, level: 1 })
        ).toBeVisible({ timeout: 15000 });
      }

      expect(consoleErrors).toEqual([]);
    });
  }

  test("mobilvisning har ingen vandret overflow på forsiden", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(hasOverflow).toBe(false);
  });

  test("bundmenuen viser alle syv sider", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Hovedmenu" });
    await expect(nav).toBeVisible();
    for (const label of [
      "Overblik",
      "Næste runde",
      "Prognose",
      "Program",
      "Hold",
      "Simulator",
      "Metoden",
    ]) {
      await expect(nav.getByText(label)).toBeVisible();
    }
  });
});
