import { expect, test } from "@playwright/test";

test("sem internet, mostra o cardápio salvo e o aviso", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // a página visitada fica em cache (cacheOnNavigation)
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Você está offline");
  await context.setOffline(false);
});
