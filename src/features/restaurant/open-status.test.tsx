import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { OpenStatus } from "./open-status";

const renderAt = (iso: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  render(<OpenStatus hours={seedMenu.openingHours} timeZone="America/Sao_Paulo" />);
};

describe("OpenStatus", () => {
  afterEach(() => vi.useRealTimers());

  it("mostra aberto com horário de fechamento", () => {
    renderAt("2026-09-26T15:30:00-03:00");
    expect(screen.getByText("Aberto agora · fecha às 22h")).toBeInTheDocument();
  });

  it("mostra quando abre se estiver fechado", () => {
    renderAt("2026-09-26T23:10:00-03:00");
    expect(screen.getByText("Fechado · abre amanhã às 11h")).toBeInTheDocument();
  });
});
