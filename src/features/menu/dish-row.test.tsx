import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { cents } from "@/domain/money";
import { makeDish } from "@/test/fixtures";
import { CompactRow } from "./compact-row";
import { DishRow } from "./dish-row";

describe("DishRow", () => {
  it("mostra nome, preço e abre o detalhe ao tocar", async () => {
    const onOpen = vi.fn();
    render(<DishRow dish={makeDish({ description: "Crocante." })} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /Batata frita/ }));
    expect(onOpen).toHaveBeenCalledWith("batata-frita");
    expect(screen.getByText(/^R\$\s29,90$/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("marca esgotado sem esconder o prato", () => {
    render(<DishRow dish={makeDish({ isAvailable: false })} onOpen={() => {}} />);
    expect(screen.getByText("Esgotado hoje")).toBeInTheDocument();
  });
});

describe("CompactRow", () => {
  it("lista cada variação com o seu preço", () => {
    render(
      <CompactRow
        dish={makeDish({
          name: "Chopp",
          variants: [
            { label: "400 ml", price: cents(1900) },
            { label: "770 ml", price: cents(2900) },
          ],
        })}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText("400 ml")).toBeInTheDocument();
    expect(screen.getByText(/^R\$\s29,00$/)).toBeInTheDocument();
  });
});
