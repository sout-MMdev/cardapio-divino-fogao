import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { MenuSearch } from "./menu-search";

const setup = (query: string) => {
  const handlers = {
    onQueryChange: vi.fn(),
    onPickDish: vi.fn(),
    onPickCategory: vi.fn(),
    onClose: vi.fn(),
  };
  render(<MenuSearch open categories={seedMenu.categories} query={query} {...handlers} />);
  return handlers;
};

describe("MenuSearch", () => {
  it("digitar atualiza a busca", async () => {
    const { onQueryChange } = setup("");
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar no cardápio" }), "p");
    expect(onQueryChange).toHaveBeenCalledWith("p");
  });

  it("mostra os resultados e abre o prato escolhido", async () => {
    const { onPickDish } = setup("parmegiana");
    const results = screen.getAllByRole("button", { name: /Parmegiana/ });
    expect(results).toHaveLength(4);
    await userEvent.click(results[0]!);
    expect(onPickDish).toHaveBeenCalledWith("parmegiana-de-frango");
  });

  it("sem resultado, oferece atalhos para as categorias", async () => {
    const { onPickCategory } = setup("xyz");
    expect(screen.getByText("Nada encontrado para “xyz”").closest("[aria-live]")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Parmegianas" }));
    expect(onPickCategory).toHaveBeenCalledWith("parmegianas");
  });
});
