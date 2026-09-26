import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DottedPriceRow } from "./dotted-price-row";

it("lê rótulo e preço sem anunciar o pontilhado", () => {
  const { container } = render(<DottedPriceRow label="Chopp 400 ml" price="R$ 19,00" />);
  expect(screen.getByText("Chopp 400 ml")).toBeInTheDocument();
  expect(screen.getByText("R$ 19,00")).toBeInTheDocument();
  expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
});
