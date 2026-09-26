import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("foto eager (acima da dobra) já nasce visível, sem esperar a hidratação (LCP)", () => {
    render(<DishPhoto photo={{ src: "/menu-photos/x.jpg", alt: "Destaque" }} sizes="80px" eager />);
    const img = screen.getByAltText("Destaque");
    expect(img).not.toHaveClass("opacity-0");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("foto lazy começa transparente e aparece ao carregar", async () => {
    render(<DishPhoto photo={{ src: "/menu-photos/x.jpg", alt: "Lazy" }} sizes="80px" />);
    const img = screen.getByAltText("Lazy");
    expect(img).toHaveClass("opacity-0");
    fireEvent.load(img);
    await waitFor(() => expect(img).toHaveClass("opacity-100"));
  });

  it("não renderiza nada sem foto", () => {
    const { container } = render(<DishPhoto sizes="80px" />);
    expect(container).toBeEmptyDOMElement();
  });
});
