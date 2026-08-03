import { test, expect } from "@playwright/test";

test.describe("Favorithold og demo-advarsel", () => {
  test("demo-advarslen er synlig på forsiden", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("DEMOVERSION")).toBeVisible();
  });

  test("bruger kan vælge favorithold og se det gemt efter reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Vælg dit hold" })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /Arsenal/ }).click();

    await expect(page.getByRole("heading", { name: "Arsenal" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Arsenal" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("bruger kan skifte hold igen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Vælg dit hold" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: /Chelsea/ }).click();
    await expect(page.getByRole("heading", { name: "Chelsea" })).toBeVisible();

    await page.getByText("Skift hold").click();
    await expect(page.getByRole("heading", { name: "Vælg dit hold" })).toBeVisible();
  });
});
