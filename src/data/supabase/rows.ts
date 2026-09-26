import { z } from "zod";
import { toCents } from "@/domain/money";

const money = z.union([z.number(), z.string()]).transform((v) => toCents(v));
const time = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/)
  .transform((v) => v.slice(0, 5));

const lineRow = z.object({ label: z.string(), price: money, position: z.number() });

const dishRow = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  base_price: money.nullable(),
  photo_path: z.string().nullable(),
  serves: z.number().nullable(),
  tags: z.array(z.string()),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_visible: z.boolean(),
  position: z.number(),
  dish_variants: z.array(lineRow),
  dish_addons: z.array(lineRow),
});

/** Formato das linhas que o PostgREST devolve para as 4 consultas do cardápio. */
export const menuRowsSchema = z.object({
  restaurant: z.object({
    name: z.string(),
    tagline: z.string(),
    address: z.string(),
    maps_url: z.string(),
    timezone: z.string(),
    prep_time_minutes: z.number(),
    payment_methods: z.array(z.string()),
    payment_notes: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  openingHours: z.array(z.object({ weekday: z.number(), opens_at: time, closes_at: time })),
  categories: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      display_style: z.string(),
      position: z.number(),
      is_visible: z.boolean(),
      dishes: z.array(dishRow),
    }),
  ),
  promotions: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      highlight: z.string().nullable(),
      photo_path: z.string().nullable(),
      is_active: z.boolean(),
      position: z.number(),
      dish: z.object({ slug: z.string() }).nullable(),
    }),
  ),
});
export type MenuRows = z.output<typeof menuRowsSchema>;
