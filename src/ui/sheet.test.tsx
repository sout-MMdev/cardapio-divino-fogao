import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sheet } from "./sheet";

const renderSheet = (open: boolean, onClose = vi.fn()) =>
  render(
    <Sheet open={open} onClose={onClose} labelledBy="titulo">
      <h2 id="titulo">Batatão Divino</h2>
    </Sheet>,
  );

describe("Sheet", () => {
  it("abre como diálogo nomeado pelo título", () => {
    renderSheet(true);
    expect(screen.getByRole("dialog", { name: "Batatão Divino" })).toHaveAttribute("open");
  });

  it("fica fechado quando open=false", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fecha pelo botão, pela tecla Esc (cancel) e pelo fundo", async () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
