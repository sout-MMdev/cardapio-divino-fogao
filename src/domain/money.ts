import { z } from "zod";

/** Valor monetário em centavos inteiros (8990 = R$ 89,90). */
export const centsSchema = z.number().int().positive().brand<"Cents">();
export type Cents = z.infer<typeof centsSchema>;

export function cents(value: number): Cents {
  if (!Number.isInteger(value)) throw new Error(`Centavos precisam ser inteiros: ${value}`);
  return value as Cents;
}

/** Converte um valor em reais (numeric do Postgres chega como number ou string). */
export function toCents(value: number | string): Cents {
  const reais = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(reais)) throw new Error(`Valor monetário inválido: ${value}`);
  return Math.round(reais * 100) as Cents;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: Cents): string {
  return brl.format(value / 100);
}

export function formatAddon(value: Cents): string {
  return `+ ${formatBRL(value)}`;
}
