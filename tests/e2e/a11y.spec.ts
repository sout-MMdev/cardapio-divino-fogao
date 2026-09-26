import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
};

test("cardápio sem violações graves", async ({ page }) => {
  await page.goto("/");
  expect(await seriousViolations(page)).toEqual([]);
});

test("detalhe do prato sem violações graves", async ({ page }) => {
  await page.goto("/?prato=batatao-divino");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("informações sem violações graves", async ({ page }) => {
  await page.goto("/?info");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
