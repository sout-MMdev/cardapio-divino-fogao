import { priceSummary, type Dish } from "@/domain/menu";
import { formatBRL } from "@/domain/money";
import type { ChipTone } from "@/ui";

export const FEATURED_SECTION = { slug: "destaques", name: "Destaques" } as const;
export const sectionId = (slug: string) => `secao-${slug}`;

export function inlinePrice(dish: Pick<Dish, "basePrice" | "variants">): string {
  const summary = priceSummary(dish);
  if (summary.kind === "single") return formatBRL(summary.price);
  if (summary.kind === "on-request") return "Consulte o preço";
  if (summary.variants.length <= 2) {
    return summary.variants.map((v) => `${v.label} ${formatBRL(v.price)}`).join(" · ");
  }
  const lowest = summary.variants.reduce((min, v) => (v.price < min.price ? v : min));
  return `a partir de ${formatBRL(lowest.price)}`;
}

export type DishBadge = { key: string; label: string; tone: ChipTone };

export function dishBadges(dish: Pick<Dish, "serves" | "tags">): DishBadge[] {
  const badges: DishBadge[] = [];
  if (dish.tags.includes("mais_pedido")) {
    badges.push({ key: "mais_pedido", label: "Mais pedido", tone: "accent" });
  }
  if (dish.serves) {
    badges.push({ key: "serves", label: `Serve até ${dish.serves} pessoas`, tone: "accent" });
  }
  if (dish.tags.includes("vegetariano")) {
    badges.push({ key: "vegetariano", label: "Vegetariano", tone: "success" });
  }
  return badges;
}
