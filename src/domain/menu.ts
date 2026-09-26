import type { Category, Cents, Dish, PriceLine } from "./schema";

export type {
  Category,
  DisplayStyle,
  Dish,
  Menu,
  OpeningRange,
  Photo,
  PriceLine,
  Promotion,
  Restaurant,
  Tag,
} from "./schema";

export type PriceSummary =
  | { kind: "single"; price: Cents }
  | { kind: "variants"; variants: PriceLine[] }
  | { kind: "on-request" };

export function priceSummary(dish: Pick<Dish, "basePrice" | "variants">): PriceSummary {
  if (dish.variants.length > 0) return { kind: "variants", variants: dish.variants };
  if (dish.basePrice !== null) return { kind: "single", price: dish.basePrice };
  return { kind: "on-request" };
}

export function featuredDishes(categories: Category[]): Dish[] {
  return categories.flatMap((c) => c.dishes.filter((d) => d.isFeatured));
}

export function findDish(
  categories: Category[],
  slug: string,
): { dish: Dish; category: Category } | undefined {
  for (const category of categories) {
    const dish = category.dishes.find((d) => d.slug === slug);
    if (dish) return { dish, category };
  }
  return undefined;
}

export function countDishes(categories: Category[]): number {
  return categories.reduce((total, c) => total + c.dishes.length, 0);
}
