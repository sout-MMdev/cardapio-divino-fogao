import { describe, expect, it } from "vitest";
import { countDishes, featuredDishes, findDish, priceSummary } from "@/domain/menu";
import { menuSchema } from "@/domain/schema";
import { PENDING_PRICE_SLUGS, seedMenu } from "./menu";

describe("seedMenu (cardápio impresso transcrito)", () => {
  it("passa na validação do domínio", () => {
    expect(() => menuSchema.parse(seedMenu)).not.toThrow();
  });

  it("tem as 9 categorias, 56 itens e 4 promoções do impresso", () => {
    expect(seedMenu.categories.map((c) => c.slug)).toEqual([
      "porcoes-divinas",
      "para-compartilhar",
      "parmegianas",
      "pratos-com-frango",
      "carnes-e-peixe",
      "extras",
      "sobremesas",
      "bebidas",
      "cervejas-e-drinks",
    ]);
    expect(countDishes(seedMenu.categories)).toBe(56);
    expect(seedMenu.promotions).toHaveLength(4);
  });

  it("só os pratos com preço coberto no impresso ficam 'sob consulta'", () => {
    const semPreco = seedMenu.categories
      .flatMap((c) => c.dishes)
      .filter((d) => priceSummary(d).kind === "on-request")
      .map((d) => d.slug);
    expect(semPreco).toEqual([...PENDING_PRICE_SLUGS]);
  });

  it("destaques, selos e fotos de desenvolvimento", () => {
    expect(featuredDishes(seedMenu.categories).map((d) => d.slug)).toEqual([
      "batata-frita-com-calabresa",
      "divina-porcao",
      "batatao-divino",
      "parmegiana-de-frango",
    ]);
    expect(findDish(seedMenu.categories, "parmegiana-de-berinjela")?.dish.tags).toEqual([
      "vegetariano",
    ]);
    expect(findDish(seedMenu.categories, "batatao-divino")?.dish.serves).toBe(3);
    const fotos = seedMenu.categories
      .flatMap((c) => c.dishes)
      .flatMap((d) => (d.photo ? [d.photo.src] : []));
    expect(fotos.every((src) => src.startsWith("/menu-photos/"))).toBe(true);
  });

  it("restaurante no fuso de São Paulo e aviso do Banrisul", () => {
    expect(seedMenu.restaurant.timezone).toBe("America/Sao_Paulo");
    expect(seedMenu.restaurant.paymentNotes).toContain("Não aceitamos Banrisul.");
  });
});
