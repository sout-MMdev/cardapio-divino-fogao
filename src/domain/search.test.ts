import { describe, expect, it } from "vitest";
import { makeCategory, makeDish } from "@/test/fixtures";
import { normalize, searchDishes } from "./search";

const categories = [
  makeCategory({
    slug: "porcoes",
    name: "Porções",
    dishes: [
      makeDish({ slug: "pao-de-alho", name: "Pão de alho" }),
      makeDish({ slug: "polenta", name: "Polenta frita" }),
    ],
  }),
  makeCategory({
    slug: "parmegianas",
    name: "Parmegianas",
    dishes: [
      makeDish({
        slug: "parm-frango",
        name: "Parmegiana de frango",
        description: "Acompanha arroz branco ou integral.",
      }),
      makeDish({ slug: "parm-berinjela", name: "Parmegiana de berinjela" }),
    ],
  }),
  makeCategory({
    slug: "frango",
    name: "Frango",
    dishes: [makeDish({ slug: "file", name: "Filé de frango grelhado" })],
  }),
];
const slugs = (q: string) => searchDishes(categories, q).map((h) => h.dish.slug);

describe("normalize", () => {
  it("remove acentos, caixa e espaços extras", () => {
    expect(normalize("  Pão   de ALHO ")).toBe("pao de alho");
    expect(normalize("Açaí")).toBe("acai");
  });
});

describe("searchDishes", () => {
  it("ignora acentos e maiúsculas", () => {
    expect(slugs("pao")).toEqual(["pao-de-alho"]);
    expect(slugs("PARMEGIANA")).toEqual(["parm-frango", "parm-berinjela"]);
  });

  it("exige todas as palavras, em qualquer ordem, com espaços extras", () => {
    expect(slugs("  frango   parme ")).toEqual(["parm-frango"]);
  });

  it("encontra pela descrição, mas depois dos que batem no nome", () => {
    expect(slugs("arroz")).toEqual(["parm-frango"]);
    expect(slugs("frango")).toEqual(["parm-frango", "file"]);
  });

  it("devolve a categoria de cada resultado", () => {
    expect(searchDishes(categories, "file")[0]).toMatchObject({
      categorySlug: "frango",
      categoryName: "Frango",
    });
  });

  it("não busca com menos de 2 caracteres e não quebra com símbolos", () => {
    expect(slugs("a")).toEqual([]);
    expect(slugs("xyz")).toEqual([]);
    expect(() => slugs("(frango[")).not.toThrow();
    expect(slugs("(frango[")).toEqual([]);
  });
});
