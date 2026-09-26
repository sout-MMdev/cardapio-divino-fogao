import { readEnv, type Env } from "@/lib/env";
import type { MenuRepository } from "./menu-repository";
import { SeedMenuRepository } from "./seed/seed-menu-repository";
import { createSupabaseMenuRepository } from "./supabase/supabase-menu-repository";

export function getMenuRepository(env: Env = readEnv()): MenuRepository {
  switch (env.MENU_SOURCE) {
    case "supabase":
      return createSupabaseMenuRepository({ url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY });
    case "seed":
      return new SeedMenuRepository();
  }
}
