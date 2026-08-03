import { test, expect } from "@playwright/test";

test.describe("PWA og demo-markering", () => {
  test("siden linker til manifest.json, og det svarer med gyldigt indhold", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(manifestHref).toBe("/manifest.json");

    const response = await request.get("/manifest.json");
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest.name).toBe("English League Predictor");
    expect(manifest.display).toBe("standalone");
  });

  test("service workeren registreres i browseren", async ({ page }) => {
    await page.goto("/");
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      return reg !== null;
    });
    expect(swRegistered).toBe(true);
  });

  test("sw.js og offline.html er tilgængelige", async ({ request }) => {
    const sw = await request.get("/sw.js");
    expect(sw.ok()).toBe(true);
    const offline = await request.get("/offline.html");
    expect(offline.ok()).toBe(true);
  });

  test("datastatus-badge viser 'Demo – syntetiske data' konsekvent på flere sider", async ({
    page,
  }) => {
    for (const path of ["/naeste-runde", "/prognose", "/program", "/hold"]) {
      await page.goto(path);
      await expect(page.getByText("Demo – syntetiske data").first()).toBeVisible({
        timeout: 15000,
      });
    }
  });
});
