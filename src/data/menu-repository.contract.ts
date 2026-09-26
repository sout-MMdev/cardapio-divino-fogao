import { describe, expect, it } from "vitest";
import { menuSchema } from "@/domain/menu";
import type { MenuRepository } from "./menu-repository";

/** Bateria compartilhada: toda implementação de MenuRepository precisa passar. */
export function describeMenuRepositoryContract(name: string, make: () => MenuRepository) {
  describe(`${name} — contrato MenuRepository`, () => {
    it("devolve um Menu válido pelo schema do domínio", async () => {
      const menu = await make().getMenu();
      expect(() => menuSchema.parse(menu)).not.toThrow();
    });

    it("toda categoria tem pelo menos um prato", async () => {
      const menu = await make().getMenu();
      expect(menu.categories.length).toBeGreaterThan(0);
      for (const category of menu.categories) expect(category.dishes.length).toBeGreaterThan(0);
    });

    it("todos os preços estão em centavos inteiros e positivos", async () => {
      const menu = await make().getMenu();
      const prices = menu.categories.flatMap((c) =>
        c.dishes.flatMap((d) => [
          d.basePrice,
          ...d.variants.map((v) => v.price),
          ...d.addons.map((a) => a.price),
        ]),
      );
      for (const price of prices) {
        if (price === null) continue;
        expect(Number.isInteger(price)).toBe(true);
        expect(price).toBeGreaterThan(0);
      }
    });

    it("é estável entre chamadas", async () => {
      const repo = make();
      expect(await repo.getMenu()).toEqual(await repo.getMenu());
    });
  });
}
