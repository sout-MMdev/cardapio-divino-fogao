import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { UrlSheets } from "./url-sheets";

const renderAt = (url: string) => {
  window.history.replaceState(null, "", url);
  render(<UrlSheets menu={seedMenu} />);
};

describe("UrlSheets", () => {
  it("?prato= abre o detalhe do prato", () => {
    renderAt("/?prato=batatao-divino");
    expect(screen.getByRole("dialog", { name: "Batatão Divino" })).toBeInTheDocument();
  });

  it("?prato= com slug inexistente não abre nada", () => {
    renderAt("/?prato=nao-existe");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("?info abre as informações", () => {
    renderAt("/?info");
    expect(screen.getByRole("dialog", { name: "Informações" })).toBeInTheDocument();
  });

  it("?busca=chopp abre a busca com o texto e o resultado", () => {
    renderAt("/?busca=chopp");
    expect(screen.getByRole("searchbox")).toHaveValue("chopp");
    expect(screen.getByRole("button", { name: /Chopp/ })).toBeInTheDocument();
  });
});
