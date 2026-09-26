import { describe, expect, it } from "vitest";
import { cents, formatAddon, formatBRL, toCents } from "./money";

describe("money", () => {
  it("formata centavos em reais no padrão brasileiro", () => {
    expect(formatBRL(cents(8990))).toBe("R$ 89,90");
    expect(formatBRL(cents(390))).toBe("R$ 3,90");
  });

  it("formata adicional com sinal de mais", () => {
    expect(formatAddon(cents(500))).toBe("+ R$ 5,00");
  });

  it("converte numeric do banco (número ou texto) para centavos sem erro de ponto flutuante", () => {
    expect(toCents("39.90")).toBe(3990);
    expect(toCents(29.9)).toBe(2990);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it("rejeita valores inválidos", () => {
    expect(() => cents(1.5)).toThrow();
    expect(() => toCents("abc")).toThrow();
  });
});
