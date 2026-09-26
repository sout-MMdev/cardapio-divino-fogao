import { describe, expect, it } from "vitest";
import { cents } from "@/domain/money";
import { makeDish } from "@/test/fixtures";
import { dishBadges, inlinePrice, sectionId } from "./presentation";

describe("apresentação do prato", () => {
  it("inlinePrice cobre preço único, até 2 variações, várias variações e sob consulta", () => {
    expect(inlinePrice(makeDish())).toBe("R$ 29,90");
    expect(
      inlinePrice(
        makeDish({
          variants: [
            { label: "Pequena", price: cents(2990) },
            { label: "Grande", price: cents(4290) },
          ],
        }),
      ),
    ).toBe("Pequena R$ 29,90 · Grande R$ 42,90");
    expect(
      inlinePrice(
        makeDish({
          variants: [
            { label: "200 ml", price: cents(900) },
            { label: "300 ml", price: cents(1100) },
            { label: "500 ml", price: cents(1300) },
          ],
        }),
      ),
    ).toBe("a partir de R$ 9,00");
    expect(inlinePrice(makeDish({ basePrice: null }))).toBe("Consulte o preço");
  });

  it("dishBadges traduz 'serve N', vegetariano e mais pedido", () => {
    expect(
      dishBadges(makeDish({ serves: 3, tags: ["vegetariano", "mais_pedido"] })).map((b) => b.label),
    ).toEqual(["Mais pedido", "Serve até 3 pessoas", "Vegetariano"]);
  });

  it("sectionId é estável", () => {
    expect(sectionId("parmegianas")).toBe("secao-parmegianas");
  });
});
