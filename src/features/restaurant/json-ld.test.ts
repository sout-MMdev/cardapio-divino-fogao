import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { buildRestaurantJsonLd, serializeJsonLd } from "./json-ld";

describe("JSON-LD do restaurante", () => {
  const ld = buildRestaurantJsonLd(seedMenu, "https://exemplo.com.br");

  it("descreve o restaurante com cardápio, seções e ofertas em BRL", () => {
    expect(ld["@type"]).toBe("Restaurant");
    expect(ld.hasMenu.hasMenuSection).toHaveLength(9);
    const batatao = ld.hasMenu.hasMenuSection[1]?.hasMenuItem.find(
      (i) => i.name === "Batatão Divino",
    );
    expect(batatao?.offers).toEqual([{ "@type": "Offer", price: "89.90", priceCurrency: "BRL" }]);
  });

  it("omite ofertas de pratos sem preço e escapa '<' ao serializar", () => {
    const parmTilapia = ld.hasMenu.hasMenuSection[2]?.hasMenuItem.find(
      (i) => i.name === "Parmegiana de tilápia",
    );
    expect(parmTilapia?.offers).toEqual([]);
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</script>");
  });
});
