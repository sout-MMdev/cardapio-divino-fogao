import { describe, expect, it } from "vitest";
import { makeCategory, makeDish, makeMenu } from "@/test/fixtures";
import { cents } from "./money";
import { countDishes, featuredDishes, findDish, priceSummary } from "./menu";
import { menuSchema } from "./schema";

describe("menuSchema", () => {
  it("aceita um cardápio válido", () => {
    expect(() => menuSchema.parse(makeMenu())).not.toThrow();
  });

  it("rejeita slug de prato repetido entre categorias", () => {
    const menu = makeMenu({
      categories: [makeCategory({ slug: "a" }), makeCategory({ slug: "b" })],
    });
    expect(() => menuSchema.parse(menu)).toThrow(/slug repetido: batata-frita/);
  });

  it("rejeita promoção apontando para prato inexistente", () => {
    const menu = makeMenu({
      promotions: [{ slug: "promo", title: "Promo", dishSlug: "nao-existe" }],
    });
    expect(() => menuSchema.parse(menu)).toThrow(/prato inexistente/);
  });

  it("rejeita horário fora do formato HH:MM", () => {
    const menu = makeMenu({
      openingHours: [{ weekday: 1, opensAt: "24:00", closesAt: "22:00" }],
    });
    expect(() => menuSchema.parse(menu)).toThrow();
  });

  it("rejeita preço zero e tag desconhecida", () => {
    const zero = makeMenu({
      categories: [makeCategory({ dishes: [makeDish({ basePrice: 0 as never })] })],
    });
    expect(() => menuSchema.parse(zero)).toThrow();
    const tag = makeMenu({
      categories: [makeCategory({ dishes: [makeDish({ tags: ["picante" as never] })] })],
    });
    expect(() => menuSchema.parse(tag)).toThrow();
  });

  it("rejeita categoria sem pratos", () => {
    expect(() => menuSchema.parse(makeMenu({ categories: [makeCategory({ dishes: [] })] }))).toThrow();
  });
});

describe("regras do cardápio", () => {
  it("priceSummary prioriza variações, depois preço único, senão 'sob consulta'", () => {
    const variants = [{ label: "Pequena", price: cents(2990) }];
    expect(priceSummary(makeDish({ variants }))).toEqual({ kind: "variants", variants });
    expect(priceSummary(makeDish())).toEqual({ kind: "single", price: 2990 });
    expect(priceSummary(makeDish({ basePrice: null }))).toEqual({ kind: "on-request" });
  });

  it("featuredDishes, findDish e countDishes percorrem todas as categorias", () => {
    const destaque = makeDish({ slug: "batatao", name: "Batatão", isFeatured: true });
    const categories = [makeCategory(), makeCategory({ slug: "familia", dishes: [destaque] })];
    expect(featuredDishes(categories).map((d) => d.slug)).toEqual(["batatao"]);
    expect(findDish(categories, "batatao")?.category.slug).toBe("familia");
    expect(findDish(categories, "nao-existe")).toBeUndefined();
    expect(countDishes(categories)).toBe(2);
  });
});
