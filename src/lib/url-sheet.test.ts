import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { closeSheet, openSheet, parseUrlSheet, updateSheetValue, useUrlSheet } from "./url-sheet";

describe("parseUrlSheet", () => {
  it("interpreta prato, busca e info (prato tem prioridade)", () => {
    expect(parseUrlSheet("")).toEqual({ kind: "none" });
    expect(parseUrlSheet("?prato=batatao-divino")).toEqual({ kind: "prato", slug: "batatao-divino" });
    expect(parseUrlSheet("?busca=parm")).toEqual({ kind: "busca", query: "parm" });
    expect(parseUrlSheet("?info")).toEqual({ kind: "info" });
    expect(parseUrlSheet("?busca=x&prato=y")).toEqual({ kind: "prato", slug: "y" });
  });
});

describe("abrir e fechar painéis", () => {
  it("abrir empilha no histórico e fechar volta (o 'voltar' do celular funciona)", async () => {
    const { result } = renderHook(() => useUrlSheet());
    act(() => openSheet("prato", "batatao-divino"));
    expect(result.current).toEqual({ kind: "prato", slug: "batatao-divino" });
    expect(window.location.search).toBe("?prato=batatao-divino");
    await act(() => closeSheet());
    expect(result.current).toEqual({ kind: "none" });
    expect(window.location.search).toBe("");
  });

  it("fechar um painel aberto por link direto troca o endereço sem sair do site", async () => {
    window.history.replaceState(null, "", "/?prato=batatao-divino");
    const before = window.history.length;
    const { result } = renderHook(() => useUrlSheet());
    expect(result.current.kind).toBe("prato");
    await act(() => closeSheet());
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
    expect(window.history.length).toBe(before);
  });

  it("atualizar a busca não cria entradas novas no histórico", () => {
    act(() => openSheet("busca"));
    const before = window.history.length;
    act(() => updateSheetValue("busca", "parmegiana"));
    expect(window.location.search).toBe("?busca=parmegiana");
    expect(window.history.length).toBe(before);
  });
});
