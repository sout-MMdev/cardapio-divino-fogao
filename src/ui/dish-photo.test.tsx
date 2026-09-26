import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DishPhoto } from "./dish-photo";

describe("DishPhoto", () => {
  it("mostra a foto com texto alternativo", () => {
    render(<DishPhoto photo={{ src: "/menu-photos/x.jpg", alt: "Batatão" }} sizes="80px" />);
    expect(screen.getByAltText("Batatão")).toBeInTheDocument();
  });

  it("some sem deixar ícone quebrado quando a imagem falha", () => {
    const { container } = render(
      <DishPhoto photo={{ src: "/menu-photos/nao-existe.jpg", alt: "X" }} sizes="80px" />,
    );
    fireEvent.error(screen.getByAltText("X"));
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada sem foto", () => {
    const { container } = render(<DishPhoto sizes="80px" />);
    expect(container).toBeEmptyDOMElement();
  });
});
