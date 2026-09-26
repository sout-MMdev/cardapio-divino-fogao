import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Menu } from "@/domain/menu";
import type { MenuRepository } from "../menu-repository";
import { mapMenuRows, type PhotoUrl } from "./map-menu-rows";

/** Porta de leitura das linhas cruas — permite testar o mapeamento sem rede. */
export interface MenuRowsSource {
  fetchRows(): Promise<unknown>;
}

const CATEGORY_SELECT =
  "slug, name, display_style, position, is_visible, dishes ( slug, name, description, base_price, photo_path, serves, tags, is_available, is_featured, is_visible, position, dish_variants ( label, price, position ), dish_addons ( label, price, position ) )";

export class SupabaseMenuRowsSource implements MenuRowsSource {
  constructor(private readonly client: SupabaseClient) {}

  async fetchRows(): Promise<unknown> {
    const [restaurant, openingHours, categories, promotions] = await Promise.all([
      this.client
        .from("restaurant")
        .select(
          "name, tagline, address, maps_url, timezone, prep_time_minutes, payment_methods, payment_notes, notes",
        )
        .single(),
      this.client.from("opening_hours").select("weekday, opens_at, closes_at"),
      this.client.from("categories").select(CATEGORY_SELECT),
      this.client
        .from("promotions")
        .select("slug, title, description, highlight, photo_path, is_active, position, dish:dishes ( slug )"),
    ]);
    for (const result of [restaurant, openingHours, categories, promotions]) {
      if (result.error) throw new Error(`Supabase: ${result.error.message}`);
    }
    return {
      restaurant: restaurant.data,
      openingHours: openingHours.data,
      categories: categories.data,
      promotions: promotions.data,
    };
  }
}

export class SupabaseMenuRepository implements MenuRepository {
  constructor(
    private readonly source: MenuRowsSource,
    private readonly photoUrl: PhotoUrl,
  ) {}

  async getMenu(): Promise<Menu> {
    return mapMenuRows(await this.source.fetchRows(), this.photoUrl);
  }
}

export function supabasePhotoUrl(baseUrl: string): PhotoUrl {
  const base = baseUrl.replace(/\/+$/, "");
  return (path) =>
    `${base}/storage/v1/object/public/menu-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function createSupabaseMenuRepository(config: {
  url: string;
  anonKey: string;
}): SupabaseMenuRepository {
  const client = createClient(config.url, config.anonKey, { auth: { persistSession: false } });
  return new SupabaseMenuRepository(new SupabaseMenuRowsSource(client), supabasePhotoUrl(config.url));
}
