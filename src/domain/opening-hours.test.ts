import { describe, expect, it } from "vitest";
import type { OpeningRange } from "./menu";
import { formatHour, formatOpenStatus, openStatus, weeklySchedule, zonedMoment } from "./opening-hours";

const SP = "America/Sao_Paulo";
const semana: OpeningRange[] = [
  ...[1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
  { weekday: 0, opensAt: "11:00", closesAt: "21:00" },
];
// 2026-09-26 é sábado
const at = (iso: string, hours = semana) => formatOpenStatus(openStatus(hours, new Date(iso), SP));

describe("zonedMoment", () => {
  it("usa o fuso do restaurante, não o do aparelho", () => {
    expect(zonedMoment(new Date("2026-09-26T15:30:00-03:00"), SP)).toEqual({
      weekday: 6,
      minutes: 930,
    });
    // 02:30 UTC de sábado = 23:30 de sexta em São Paulo
    expect(zonedMoment(new Date("2026-09-26T02:30:00Z"), SP)).toEqual({
      weekday: 5,
      minutes: 1410,
    });
  });
});

describe("openStatus", () => {
  it("aberto dentro da faixa", () => {
    expect(at("2026-09-26T15:30:00-03:00")).toBe("Aberto agora · fecha às 22h");
  });

  it("fechado exatamente no horário de fechar, abre amanhã", () => {
    expect(at("2026-09-26T22:00:00-03:00")).toBe("Fechado · abre amanhã às 11h");
  });

  it("antes de abrir no mesmo dia", () => {
    expect(at("2026-09-26T09:00:00-03:00")).toBe("Fechado · abre hoje às 11h");
  });

  it("faixa que passa da meia-noite", () => {
    const madrugada: OpeningRange[] = [{ weekday: 5, opensAt: "18:00", closesAt: "02:00" }];
    expect(at("2026-09-26T01:30:00-03:00", madrugada)).toBe("Aberto agora · fecha às 2h");
    expect(at("2026-09-26T02:00:00-03:00", madrugada)).toBe("Fechado · abre sex. às 18h");
    expect(at("2026-09-25T17:59:00-03:00", madrugada)).toBe("Fechado · abre hoje às 18h");
  });

  it("duas faixas no mesmo dia", () => {
    const partido: OpeningRange[] = [
      { weekday: 6, opensAt: "11:00", closesAt: "15:00" },
      { weekday: 6, opensAt: "18:00", closesAt: "23:30" },
    ];
    expect(at("2026-09-26T16:00:00-03:00", partido)).toBe("Fechado · abre hoje às 18h");
    expect(at("2026-09-26T19:00:00-03:00", partido)).toBe("Aberto agora · fecha às 23h30");
  });

  it("próxima abertura em outro dia da semana e sem horários", () => {
    expect(
      at("2026-09-26T12:00:00-03:00", [{ weekday: 3, opensAt: "11:00", closesAt: "22:00" }]),
    ).toBe("Fechado · abre qua. às 11h");
    expect(at("2026-09-26T12:00:00-03:00", [])).toBe("Fechado");
  });
});

describe("formatação", () => {
  it("formatHour", () => {
    expect(formatHour("22:00")).toBe("22h");
    expect(formatHour("22:30")).toBe("22h30");
    expect(formatHour("09:00")).toBe("9h");
  });

  it("weeklySchedule começa na segunda e termina no domingo", () => {
    const dias = weeklySchedule(semana);
    expect(dias.map((d) => d.name)).toEqual([
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ]);
    expect(dias[6]).toEqual({ weekday: 0, name: "Domingo", ranges: ["11:00 – 21:00"] });
    expect(weeklySchedule([]).every((d) => d.ranges.length === 0)).toBe(true);
  });
});
