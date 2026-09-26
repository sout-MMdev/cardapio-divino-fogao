import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("ao fechar, fecha o <dialog> de verdade (evento close → foco volta para quem abriu)", () => {
    const { rerender } = render(<DishSheet dish={makeDish()} open onClose={() => {}} prepTimeMinutes={20} />);
    const onDialogClose = vi.fn();
    screen.getByRole("dialog").addEventListener("close", onDialogClose);
    rerender(<DishSheet dish={undefined} open={false} onClose={() => {}} prepTimeMinutes={20} />);
    expect(onDialogClose).toHaveBeenCalled();
  });

  it("sem foto (ou com foto quebrada), o título desce abaixo do botão Fechar", () => {
    render(
      <DishSheet
        dish={makeDish({ name: "Tiras de filé de frango grelhado", photo: { src: "/x.jpg", alt: "Foto" } })}
        open
        onClose={() => {}}
        prepTimeMinutes={20}
      />,
    );
    const titulo = () => screen.getByRole("heading", { level: 2 }).parentElement;
    expect(titulo()).toHaveClass("pt-5");
    fireEvent.error(screen.getByAltText("Foto"));
    expect(titulo()).toHaveClass("pt-16");
  });

  it("slug desconhecido (dish undefined) com open=true não abre nada", () => {
    render(<DishSheet dish={undefined} open onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
