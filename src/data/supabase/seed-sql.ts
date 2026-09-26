import type { Menu } from "@/domain/menu";

const q = (value: string | null | undefined) =>
  value == null ? "null" : `'${value.replace(/'/g, "''")}'`;
const money = (value: number | null) => (value === null ? "null" : (value / 100).toFixed(2));
const textArray = (values: string[]) =>
  values.length ? `array[${values.map(q).join(", ")}]::text[]` : "'{}'::text[]";
const photoPath = (src: string | undefined) => (src ? src.replace(/^\/menu-photos\//, "") : null);

/** Gera supabase/seed.sql a partir do seed do domínio (fonte única dos dados). */
export function buildSeedSql(menu: Menu): string {
  const r = menu.restaurant;
  const out: string[] = [
    "-- GERADO por scripts/generate-seed-sql.ts a partir de src/data/seed/menu.ts. Não edite à mão.",
    "-- ⚠️ Não aplicar em nenhum projeto remoto sem autorização explícita do dono do projeto.",
    "begin;",
    "truncate table public.promotions, public.dish_addons, public.dish_variants, public.dishes, public.categories, public.opening_hours, public.restaurant restart identity cascade;",
    "",
    `insert into public.restaurant (name, tagline, address, maps_url, timezone, prep_time_minutes, payment_methods, payment_notes, notes) values (${[
      q(r.name),
      q(r.tagline),
      q(r.address),
      q(r.mapsUrl),
      q(r.timezone),
      String(r.prepTimeMinutes),
      textArray(r.paymentMethods),
      textArray(r.paymentNotes),
      textArray(r.notes),
    ].join(", ")});`,
    "",
  ];
  for (const h of menu.openingHours) {
    out.push(
      `insert into public.opening_hours (weekday, opens_at, closes_at) values (${h.weekday}, ${q(h.opensAt)}, ${q(h.closesAt)});`,
    );
  }
  menu.categories.forEach((category, categoryIndex) => {
    out.push("");
    out.push(
      `insert into public.categories (slug, name, display_style, position) values (${q(category.slug)}, ${q(category.name)}, ${q(category.displayStyle)}, ${categoryIndex});`,
    );
    category.dishes.forEach((dish, dishIndex) => {
      out.push(
        `insert into public.dishes (category_id, slug, name, description, base_price, photo_path, serves, tags, is_available, is_featured, position) select id, ${[
          q(dish.slug),
          q(dish.name),
          q(dish.description),
          money(dish.basePrice),
          q(photoPath(dish.photo?.src)),
          dish.serves === undefined ? "null" : String(dish.serves),
          textArray(dish.tags),
          String(dish.isAvailable),
          String(dish.isFeatured),
          String(dishIndex),
        ].join(", ")} from public.categories where slug = ${q(category.slug)};`,
      );
      dish.variants.forEach((v, i) =>
        out.push(
          `insert into public.dish_variants (dish_id, label, price, position) select id, ${q(v.label)}, ${money(v.price)}, ${i} from public.dishes where slug = ${q(dish.slug)};`,
        ),
      );
      dish.addons.forEach((a, i) =>
        out.push(
          `insert into public.dish_addons (dish_id, label, price, position) select id, ${q(a.label)}, ${money(a.price)}, ${i} from public.dishes where slug = ${q(dish.slug)};`,
        ),
      );
    });
  });
  out.push("");
  menu.promotions.forEach((p, i) => {
    const dishId = p.dishSlug
      ? `(select id from public.dishes where slug = ${q(p.dishSlug)})`
      : "null";
    out.push(
      `insert into public.promotions (slug, title, description, highlight, photo_path, dish_id, position) values (${[
        q(p.slug),
        q(p.title),
        q(p.description),
        q(p.highlight),
        q(photoPath(p.photo?.src)),
        dishId,
        String(i),
      ].join(", ")});`,
    );
  });
  out.push("commit;");
  return `${out.join("\n")}\n`;
}
