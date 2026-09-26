import { cents } from "@/domain/money";
import type { Category, Dish, Menu } from "@/domain/menu";

export function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    slug: "batata-frita",
    name: "Batata frita",
    basePrice: cents(2990),
    variants: [],
    addons: [],
    tags: [],
    isAvailable: true,
    isFeatured: false,
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    slug: "porcoes",
    name: "Porções",
    displayStyle: "rows",
    dishes: [makeDish()],
    ...overrides,
  };
}

export function makeMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    restaurant: {
      name: "Divino Fogão",
      tagline: "Comida da Fazenda · São Leopoldo",
      address: "R. Primeiro de Março, 821",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Divino+Fog%C3%A3o",
      timezone: "America/Sao_Paulo",
      prepTimeMinutes: 20,
      paymentMethods: ["Pix"],
      paymentNotes: [],
      notes: [],
    },
    openingHours: [{ weekday: 6, opensAt: "11:00", closesAt: "22:00" }],
    categories: [makeCategory()],
    promotions: [],
    ...overrides,
  };
}
