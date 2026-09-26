import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { PromoCarousel } from "./promo-carousel";

it("lista as promoções com título, descrição e destaque", () => {
  render(<PromoCarousel promotions={seedMenu.promotions} />);
  expect(screen.getByRole("region", { name: "Promoções" })).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  expect(screen.getByText("3ª grátis")).toBeInTheDocument();
});

it("não renderiza nada sem promoções", () => {
  const { container } = render(<PromoCarousel promotions={[]} />);
  expect(container).toBeEmptyDOMElement();
});
