import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { InfoSheet } from "./info-sheet";

describe("InfoSheet", () => {
  afterEach(() => vi.useRealTimers());

  it("lista horários com o dia de hoje destacado, endereço, mapa e pagamento", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T15:30:00-03:00")); // sábado
    render(
      <InfoSheet
        open
        onClose={() => {}}
        restaurant={seedMenu.restaurant}
        openingHours={seedMenu.openingHours}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Informações" });
    const hoje = within(dialog).getByText(/Sábado/).closest("[aria-current]");
    expect(hoje).toHaveAttribute("aria-current", "date");
    expect(within(dialog).getByRole("link", { name: /Abrir no Google Maps/ })).toHaveAttribute(
      "href",
      seedMenu.restaurant.mapsUrl,
    );
    expect(within(dialog).getByText("Não aceitamos Banrisul.")).toBeInTheDocument();
    expect(within(dialog).getByText("Pix")).toBeInTheDocument();
    expect(within(dialog).getByText(/salada de tomate/)).toBeInTheDocument();
  });
});
