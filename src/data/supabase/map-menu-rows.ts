import { menuSchema, type Menu } from "@/domain/menu";
import { menuRowsSchema } from "./rows";

export type PhotoUrl = (path: string) => string;

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
const lines = (rows: { label: string; price: number; position: number }[]) =>
  [...rows].sort(byPosition).map(({ label, price }) => ({ label, price }));

/** Converte as linhas do banco no Menu do domínio. Filtra ocultos/inativos, ordena e valida. */
export function mapMenuRows(input: unknown, photoUrl: PhotoUrl): Menu {
  const rows = menuRowsSchema.parse(input);

  const categories = rows.categories
    .filter((c) => c.is_visible)
    .sort(byPosition)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      displayStyle: c.display_style,
      dishes: c.dishes
        .filter((d) => d.is_visible)
        .sort(byPosition)
        .map((d) => ({
          slug: d.slug,
          name: d.name,
          description: d.description ?? undefined,
          basePrice: d.base_price,
          variants: lines(d.dish_variants),
          addons: lines(d.dish_addons),
          photo: d.photo_path ? { src: photoUrl(d.photo_path), alt: d.name } : undefined,
          serves: d.serves ?? undefined,
          tags: d.tags,
          isAvailable: d.is_available,
          isFeatured: d.is_featured,
        })),
    }))
    .filter((c) => c.dishes.length > 0);

  const visibleDishes = new Set(categories.flatMap((c) => c.dishes.map((d) => d.slug)));

  return menuSchema.parse({
    restaurant: {
      name: rows.restaurant.name,
      tagline: rows.restaurant.tagline,
      address: rows.restaurant.address,
      mapsUrl: rows.restaurant.maps_url,
      timezone: rows.restaurant.timezone,
      prepTimeMinutes: rows.restaurant.prep_time_minutes,
      paymentMethods: rows.restaurant.payment_methods,
      paymentNotes: rows.restaurant.payment_notes,
      notes: rows.restaurant.notes,
    },
    openingHours: rows.openingHours.map((h) => ({
      weekday: h.weekday,
      opensAt: h.opens_at,
      closesAt: h.closes_at,
    })),
    categories,
    promotions: rows.promotions
      .filter((p) => p.is_active)
      .sort(byPosition)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? undefined,
        highlight: p.highlight ?? undefined,
        photo: p.photo_path ? { src: photoUrl(p.photo_path), alt: p.title } : undefined,
        dishSlug: p.dish && visibleDishes.has(p.dish.slug) ? p.dish.slug : undefined,
      })),
  });
}
