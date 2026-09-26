"use client";

import { priceSummary, type Dish } from "@/domain/menu";
import { formatBRL } from "@/domain/money";
import { DottedPriceRow } from "@/ui";

export function CompactRow({ dish, onOpen }: { dish: Dish; onOpen: (slug: string) => void }) {
  const summary = priceSummary(dish);
  const muted = !dish.isAvailable;
  const name = (
    <span className={muted ? "text-ink-muted" : "text-ink"}>
      {dish.name}
      {muted ? (
        <span className="ml-1.5 text-[12px] font-semibold text-ink-muted">(esgotado)</span>
      ) : null}
    </span>
  );
  return (
    <button
      type="button"
      onClick={() => onOpen(dish.slug)}
      className="block min-h-11 w-full border-b border-line/70 py-1 text-left"
    >
      {summary.kind === "variants" ? (
        <>
          <span className="block pt-1.5 text-[14px] font-semibold">{name}</span>
          {summary.variants.map((v) => (
            <span key={v.label} className="block pl-3">
              <DottedPriceRow label={v.label} price={formatBRL(v.price)} muted={muted} />
            </span>
          ))}
        </>
      ) : (
        <DottedPriceRow
          label={name}
          price={summary.kind === "single" ? formatBRL(summary.price) : "Consulte"}
          muted={muted}
        />
      )}
    </button>
  );
}
