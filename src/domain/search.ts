import type { Category, Dish } from "./menu";

export const MIN_QUERY_LENGTH = 2;

export interface SearchHit {
  dish: Dish;
  categorySlug: string;
  categoryName: string;
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Busca por palavras (todas precisam aparecer); resultados pelo nome vêm antes dos pela descrição. */
export function searchDishes(categories: Category[], query: string): SearchHit[] {
  const q = normalize(query);
  if (q.length < MIN_QUERY_LENGTH) return [];
  const tokens = q.split(" ");
  const byName: SearchHit[] = [];
  const byDescription: SearchHit[] = [];
  for (const category of categories) {
    for (const dish of category.dishes) {
      const name = normalize(dish.name);
      const haystack = `${name} ${normalize(dish.description ?? "")}`;
      if (!tokens.every((t) => haystack.includes(t))) continue;
      const hit = { dish, categorySlug: category.slug, categoryName: category.name };
      (tokens.every((t) => name.includes(t)) ? byName : byDescription).push(hit);
    }
  }
  return [...byName, ...byDescription];
}
