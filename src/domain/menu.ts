import { z } from "zod";
import { centsSchema, type Cents } from "./money";

export const TAGS = ["vegetariano", "mais_pedido"] as const;
export const tagSchema = z.enum(TAGS);
export const displayStyleSchema = z.enum(["rows", "compact"]);

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug inválido");
const text = z.string().trim().min(1);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "horário deve ser HH:MM");

export const photoSchema = z.object({ src: text, alt: text });
export const priceLineSchema = z.object({ label: text, price: centsSchema });

export const dishSchema = z.object({
  slug: slugSchema,
  name: text,
  description: text.optional(),
  /** null ⇒ preço vem das variações; sem variações ⇒ "Consulte o preço" */
  basePrice: centsSchema.nullable(),
  variants: z.array(priceLineSchema),
  addons: z.array(priceLineSchema),
  photo: photoSchema.optional(),
  serves: z.number().int().positive().optional(),
  tags: z.array(tagSchema),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export const categorySchema = z.object({
  slug: slugSchema,
  name: text,
  displayStyle: displayStyleSchema,
  dishes: z.array(dishSchema).min(1),
});

export const promotionSchema = z.object({
  slug: slugSchema,
  title: text,
  description: text.optional(),
  highlight: text.optional(),
  photo: photoSchema.optional(),
  dishSlug: slugSchema.optional(),
});

export const openingRangeSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  opensAt: hhmm,
  closesAt: hhmm,
});

export const restaurantSchema = z.object({
  name: text,
  tagline: text,
  address: text,
  mapsUrl: z.url(),
  timezone: text,
  prepTimeMinutes: z.number().int().positive(),
  paymentMethods: z.array(text),
  paymentNotes: z.array(text),
  notes: z.array(text),
});

export const menuSchema = z
  .object({
    restaurant: restaurantSchema,
    openingHours: z.array(openingRangeSchema),
    categories: z.array(categorySchema).min(1),
    promotions: z.array(promotionSchema),
  })
  .superRefine((menu, ctx) => {
    const unique = (label: string, slugs: string[]) => {
      const seen = new Set<string>();
      for (const slug of slugs) {
        if (seen.has(slug)) {
          ctx.addIssue({ code: "custom", message: `${label} com slug repetido: ${slug}` });
        }
        seen.add(slug);
      }
    };
    const dishSlugs = menu.categories.flatMap((c) => c.dishes.map((d) => d.slug));
    unique(
      "Categoria",
      menu.categories.map((c) => c.slug),
    );
    unique("Prato", dishSlugs);
    unique(
      "Promoção",
      menu.promotions.map((p) => p.slug),
    );
    const known = new Set(dishSlugs);
    for (const promo of menu.promotions) {
      if (promo.dishSlug && !known.has(promo.dishSlug)) {
        ctx.addIssue({
          code: "custom",
          message: `Promoção ${promo.slug} aponta para prato inexistente: ${promo.dishSlug}`,
        });
      }
    }
  });

export type Tag = z.infer<typeof tagSchema>;
export type DisplayStyle = z.infer<typeof displayStyleSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type PriceLine = z.infer<typeof priceLineSchema>;
export type Dish = z.infer<typeof dishSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type OpeningRange = z.infer<typeof openingRangeSchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;
export type Menu = z.infer<typeof menuSchema>;

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
