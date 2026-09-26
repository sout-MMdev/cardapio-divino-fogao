import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

describe("readEnv", () => {
  it("usa seed quando nada está configurado", () => {
    expect(readEnv({})).toEqual({ MENU_SOURCE: "seed" });
  });

  it("exige URL e chave quando a fonte é supabase", () => {
    expect(() => readEnv({ MENU_SOURCE: "supabase" })).toThrow();
    expect(
      readEnv({
        MENU_SOURCE: "supabase",
        SUPABASE_URL: "https://abc.supabase.co",
        SUPABASE_ANON_KEY: "chave",
      }),
    ).toEqual({
      MENU_SOURCE: "supabase",
      SUPABASE_URL: "https://abc.supabase.co",
      SUPABASE_ANON_KEY: "chave",
    });
  });

  it("rejeita fonte desconhecida", () => {
    expect(() => readEnv({ MENU_SOURCE: "planilha" })).toThrow();
  });
});
