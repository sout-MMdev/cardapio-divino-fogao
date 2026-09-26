"use client";

import { useMemo, useSyncExternalStore } from "react";

export type SheetKey = "prato" | "info" | "busca";
export type UrlSheet =
  | { kind: "none" }
  | { kind: "prato"; slug: string }
  | { kind: "info" }
  | { kind: "busca"; query: string };

/** Quantos painéis este app empilhou no histórico. Com 0, fechar troca o endereço em vez de voltar (link direto). */
let depth = 0;
let listening = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("popstate", () => {
    depth = Math.max(0, depth - 1);
    emit();
  });
}

function subscribe(listener: () => void) {
  ensureListening();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

export function parseUrlSheet(search: string): UrlSheet {
  const params = new URLSearchParams(search);
  const prato = params.get("prato");
  if (prato !== null) return { kind: "prato", slug: prato };
  const busca = params.get("busca");
  if (busca !== null) return { kind: "busca", query: busca };
  if (params.has("info")) return { kind: "info" };
  return { kind: "none" };
}

export function useUrlSheet(): UrlSheet {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseUrlSheet(search), [search]);
}

function urlFor(key: SheetKey, value: string): string {
  const params = new URLSearchParams();
  params.set(key, value);
  return `${window.location.pathname}?${params.toString().replace(/=$/, "")}`;
}

/** Abre um painel empilhando uma entrada no histórico (o Next 16 sincroniza pushState com o roteador). */
export function openSheet(key: SheetKey, value = ""): void {
  ensureListening();
  window.history.pushState(null, "", urlFor(key, value));
  depth += 1;
  emit();
}

/** Atualiza o valor do painel aberto (ex.: texto da busca) sem criar entrada no histórico. */
export function updateSheetValue(key: "busca", value: string): void {
  window.history.replaceState(null, "", urlFor(key, value));
  emit();
}

/** Fecha o painel: volta no histórico se foi aberto aqui; senão troca o endereço (link direto não sai do site). */
export function closeSheet(): Promise<void> {
  ensureListening();
  if (depth > 0) {
    return new Promise((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
      window.history.back();
    });
  }
  window.history.replaceState(null, "", window.location.pathname);
  emit();
  return Promise.resolve();
}
