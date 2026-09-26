import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { MenuBrowser } from "./menu-browser";

describe("MenuBrowser", () => {
  it("mostra abas, destaques e todas as seções", () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    expect(screen.getByRole("navigation", { name: "Categorias do cardápio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Destaques" })).toBeInTheDocument();
    for (const c of seedMenu.categories) {
      expect(screen.getByRole("heading", { level: 2, name: c.name })).toBeInTheDocument();
    }
  });

  it("tocar num prato abre o detalhe pelo endereço", async () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    await userEvent.click(screen.getAllByRole("button", { name: /Divina Porção/ })[0]!);
    expect(window.location.search).toBe("?prato=divina-porcao");
  });

  it("tocar numa aba marca a aba como atual", async () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    const aba = screen.getByRole("button", { name: "Parmegianas" });
    await userEvent.click(aba);
    expect(aba).toHaveAttribute("aria-current", "true");
  });
});
