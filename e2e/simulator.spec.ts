import { test, expect } from "@playwright/test";

test.describe("Hvad nu hvis-simulator", () => {
  test("kan genberegne et scenarie og derefter nulstille", async ({ page }) => {
    await page.goto("/simulator");
    await expect(
      page.getByRole("heading", { name: "Hvad nu hvis?", level: 1 })
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel("Vælg kommende kamp").waitFor({ state: "visible" });

    await page.getByRole("button", { name: /Genberegn sæson/ }).click();

    // Vent til beregningen er færdig igen (knappen holder op med at vise "Genberegner")
    await expect(page.getByRole("button", { name: "Genberegn sæson" })).toBeVisible({
      timeout: 20000,
    });

    // Scenarie-pil "→" bør nu være synlig et sted i sammenligningen
    await expect(page.getByText("→")).toBeVisible();

    await page.getByRole("button", { name: "Nulstil scenarie" }).click();
    await expect(page.getByText("→")).toHaveCount(0);
  });
});
