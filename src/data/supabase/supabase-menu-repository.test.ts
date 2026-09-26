import { describe, expect, it } from "vitest";
import { describeMenuRepositoryContract } from "../menu-repository.contract";
import { menuRowsFixture } from "./__fixtures__/menu-rows";
import { mapMenuRows } from "./map-menu-rows";
import {
  SupabaseMenuRepository,
  supabasePhotoUrl,
  type MenuRowsSource,
} from "./supabase-menu-repository";

const photoUrl = supabasePhotoUrl("https://abc.supabase.co/");
const fakeSource = (rows: unknown = menuRowsFixture): MenuRowsSource => ({
  fetchRows: async () => structuredClone(rows),
});

describeMenuRepositoryContract(
  "SupabaseMenuRepository (dados de exemplo)",
  () => new SupabaseMenuRepository(fakeSource(), photoUrl),
);

describe("mapMenuRows", () => {
  const menu = mapMenuRows(structuredClone(menuRowsFixture), photoUrl);

  it("esconde categorias e pratos ocultos e remove categorias que ficaram vazias", () => {
    expect(menu.categories.map((c) => c.slug)).toEqual(["porcoes", "parmegianas"]);
    expect(menu.categories[0]?.dishes.map((d) => d.slug)).toEqual(["batata-frita"]);
  });

  it("ordena variações por posição e converte numeric em centavos", () => {
    const batata = menu.categories[0]?.dishes[0];
    expect(batata?.variants).toEqual([
      { label: "Pequena", price: 2990 },
      { label: "Grande", price: 4290 },
    ]);
    expect(batata?.addons).toEqual([{ label: "Cheddar", price: 500 }]);
    expect(menu.categories[1]?.dishes[0]?.basePrice).toBe(4590);
  });

  it("monta a URL pública da foto e troca null por ausência", () => {
    expect(menu.categories[1]?.dishes[0]?.photo).toEqual({
      src: "https://abc.supabase.co/storage/v1/object/public/menu-photos/parmegiana%20frango.jpg",
      alt: "Parmegiana de frango",
    });
    expect(menu.categories[0]?.dishes[0]?.photo).toBeUndefined();
    expect(menu.categories[0]?.dishes[0]?.isAvailable).toBe(false);
  });

  it("corta os segundos do horário", () => {
    expect(menu.openingHours).toEqual([{ weekday: 6, opensAt: "11:00", closesAt: "22:00" }]);
  });

  it("omite promoções inativas e desliga o vínculo com prato oculto", () => {
    expect(menu.promotions.map((p) => p.slug)).toEqual(["batata", "aponta-oculto"]);
    expect(menu.promotions[0]?.dishSlug).toBe("batata-frita");
    expect(menu.promotions[1]?.dishSlug).toBeUndefined();
  });

  it("falha alto com dados inválidos (nunca renderiza cardápio pela metade)", () => {
    const quebrado = structuredClone(menuRowsFixture);
    quebrado.categories[0]!.display_style = "grade";
    expect(() => mapMenuRows(quebrado, photoUrl)).toThrow();
  });
});
