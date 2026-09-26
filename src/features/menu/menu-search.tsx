"use client";

import { useMemo } from "react";
import type { Category } from "@/domain/menu";
import { MIN_QUERY_LENGTH, searchDishes } from "@/domain/search";
import { SearchIcon, Sheet } from "@/ui";
import { inlinePrice } from "./lib/presentation";

type Props = {
  open: boolean;
  categories: Category[];
  query: string;
  onQueryChange: (query: string) => void;
  onPickDish: (slug: string) => void;
  onPickCategory: (slug: string) => void;
  onClose: () => void;
};

export function MenuSearch({
  open,
  categories,
  query,
  onQueryChange,
  onPickDish,
  onPickCategory,
  onClose,
}: Props) {
  const hits = useMemo(() => searchDishes(categories, query), [categories, query]);
  const searching = query.trim().length >= MIN_QUERY_LENGTH;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="busca-titulo">
      <div className="px-5 pt-10 pb-10">
        <h2 id="busca-titulo" className="font-display text-[26px] font-semibold text-brand">
          Buscar
        </h2>
        <label className="mt-3 flex min-h-12 items-center gap-2 rounded-full border border-line bg-bg px-4 focus-within:border-brand">
          <SearchIcon className="size-5 text-ink-muted" />
          <input
            type="search"
            aria-label="Buscar no cardápio"
            placeholder="Ex.: parmegiana, chopp, batata…"
            data-autofocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-12 w-full bg-transparent text-[16px] outline-none placeholder:text-ink-muted"
          />
        </label>

        <div aria-live="polite">
        {searching && hits.length > 0 ? (
          <ul className="mt-4">
            {hits.map((hit) => (
              <li key={hit.dish.slug}>
                <button
                  type="button"
                  onClick={() => onPickDish(hit.dish.slug)}
                  className="flex w-full items-baseline justify-between gap-3 border-b border-line py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-[16px] font-semibold">
                      {hit.dish.name}
                    </span>
                    <span className="block text-[12px] text-ink-muted">{hit.categoryName}</span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-brand">
                    {inlinePrice(hit.dish)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {searching && hits.length === 0 ? (
          <p className="mt-6 text-[15px] text-ink">Nada encontrado para “{query.trim()}”</p>
        ) : null}
        </div>

        {!searching || hits.length === 0 ? (
          <div className="mt-6">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Categorias
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => onPickCategory(c.slug)}
                    className="min-h-11 rounded-full bg-surface-muted px-4 text-[14px] font-semibold text-ink"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
