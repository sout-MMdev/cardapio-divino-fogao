import { describe, expect, it } from "vitest";
import { getMenuRepository } from "./get-menu-repository";
import { SeedMenuRepository } from "./seed/seed-menu-repository";
import { SupabaseMenuRepository } from "./supabase/supabase-menu-repository";

describe("getMenuRepository", () => {
  it("usa o seed por padrão", () => {
    expect(getMenuRepository({ MENU_SOURCE: "seed" })).toBeInstanceOf(SeedMenuRepository);
  });

  it("monta o repositório Supabase quando configurado (sem acessar a rede)", () => {
    const repo = getMenuRepository({
      MENU_SOURCE: "supabase",
      SUPABASE_URL: "https://abc.supabase.co",
      SUPABASE_ANON_KEY: "chave",
    });
    expect(repo).toBeInstanceOf(SupabaseMenuRepository);
  });
});
