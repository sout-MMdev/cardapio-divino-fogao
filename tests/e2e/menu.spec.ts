import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";

/** Fotos de desenvolvimento são de terceiros e ficam fora do git (public/menu-photos). */
const temFotosDeDev = existsSync("public/menu-photos/batatao.jpg");

test("carrega o cardápio com topo, promoções e abas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Promoções" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Categorias do cardápio" })).toBeVisible();
});

test("fotos dos destaques aparecem com altura real", async ({ page }) => {
  test.skip(!temFotosDeDev, "fotos de desenvolvimento ausentes (public/menu-photos é ignorada pelo git)");
  await page.goto("/");
  const foto = page.locator("#secao-destaques img").first();
  await expect(foto).toBeVisible();
  expect((await foto.boundingBox())?.height ?? 0).toBeGreaterThan(100);
});

test("tocar numa aba rola até a seção", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Parmegianas" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Parmegianas" })).toBeInViewport();
});

test("abre o prato e fecha com o voltar e com o botão", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Divina Porção/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Divina Porção" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: /Divina Porção/ }).first().click();
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("link direto para o prato abre e fechar continua no site", async ({ page }) => {
  await page.goto("/?prato=batatao-divino");
  await expect(page.getByRole("dialog", { name: "Batatão Divino" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page).toHaveURL(/localhost:3100\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
});

test("busca encontra parmegianas e trata o vazio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buscar no cardápio" }).click();
  const box = page.getByRole("searchbox", { name: "Buscar no cardápio" });
  await expect(box).toBeFocused();
  await box.fill("parmegiana");
  await expect(page.getByRole("dialog").getByRole("button", { name: /Parmegiana de/ })).toHaveCount(4);
  await box.fill("xyz");
  await expect(page.getByText("Nada encontrado para “xyz”")).toBeVisible();
});

test("informações da loja", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Informações da loja" }).click();
  const dialog = page.getByRole("dialog", { name: "Informações" });
  await expect(dialog.getByText("Não aceitamos Banrisul.")).toBeVisible();
});

test("tela de 344 px (Galaxy Fold) não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 344, height: 882 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
