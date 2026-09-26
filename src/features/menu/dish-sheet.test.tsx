import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cents } from "@/domain/money";
import { makeDish } from "@/test/fixtures";
import { DishSheet } from "./dish-sheet";

describe("DishSheet", () => {
  it("mostra variações, adicionais e tempo de preparo", () => {
    const dish = makeDish({
      name: "Batata frita",
      variants: [
        { label: "Pequena", price: cents(2990) },
        { label: "Grande", price: cents(4290) },
      ],
      addons: [{ label: "Cheddar", price: cents(500) }],
    });
    render(<DishSheet dish={dish} open onClose={() => {}} prepTimeMinutes={20} />);
    const dialog = screen.getByRole("dialog", { name: "Batata frita" });
    expect(within(dialog).getByText("Grande")).toBeInTheDocument();
    expect(within(dialog).getByText(/^\+ R\$\s5,00$/)).toBeInTheDocument();
    expect(within(dialog).getByText(/20 minutos/)).toBeInTheDocument();
  });

  it("prato sem preço e esgotado", () => {
    render(
      <DishSheet
        dish={makeDish({ basePrice: null, isAvailable: false })}
        open
        onClose={() => {}}
        prepTimeMinutes={20}
      />,
    );
    expect(screen.getByText("Consulte o preço no balcão")).toBeInTheDocument();
    expect(screen.getByText("Esgotado hoje")).toBeInTheDocument();
  });

  it("sem prato, nada aparece", () => {
    render(<DishSheet dish={undefined} open={false} onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("slug desconhecido (dish undefined) com open=true não abre nada", () => {
    render(<DishSheet dish={undefined} open onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
