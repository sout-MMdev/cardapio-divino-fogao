import type { Menu } from "@/domain/menu";

/** Contrato que as telas usam. Implementações: seed (padrão) e supabase (preparada). */
export interface MenuRepository {
  getMenu(): Promise<Menu>;
}
