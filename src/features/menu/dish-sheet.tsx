"use client";

import { priceSummary, type Dish } from "@/domain/menu";
import { formatAddon, formatBRL } from "@/domain/money";
import { Chip, DishPhoto, DottedPriceRow, Sheet } from "@/ui";
import { dishBadges } from "./lib/presentation";

type Props = {
  dish: Dish | undefined;
  open: boolean;
  onClose: () => void;
  prepTimeMinutes: number;
};

export function DishSheet({ dish, open, onClose, prepTimeMinutes }: Props) {
  if (!dish) return null;
  const summary = priceSummary(dish);
  const muted = !dish.isAvailable;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="prato-titulo">
      <DishPhoto
        photo={dish.photo}
        sizes="(max-width: 576px) 100vw, 576px"
        preload
        className="h-[230px] w-full"
      />
      <div className={`px-5 pb-10 ${dish.photo ? "pt-5" : "pt-12"}`}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {!dish.isAvailable ? <Chip tone="neutral">Esgotado hoje</Chip> : null}
          {dishBadges(dish).map((b) => (
            <Chip key={b.key} tone={b.tone}>
              {b.label}
            </Chip>
          ))}
        </div>
        <h2 id="prato-titulo" className="font-display text-[28px] leading-tight font-semibold">
          {dish.name}
        </h2>
        {dish.description ? (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{dish.description}</p>
        ) : null}

        {summary.kind === "single" ? (
          <p
            className={`mt-4 font-display text-[28px] tabular-nums ${muted ? "text-ink-muted line-through" : "text-brand"}`}
          >
            {formatBRL(summary.price)}
          </p>
        ) : null}
        {summary.kind === "on-request" ? (
          <p className="mt-4 text-[15px] font-semibold text-brand">Consulte o preço no balcão</p>
        ) : null}
        {summary.kind === "variants" ? (
          <div className="mt-4">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Opções</h3>
            {summary.variants.map((v) => (
              <DottedPriceRow key={v.label} label={v.label} price={formatBRL(v.price)} muted={muted} />
            ))}
          </div>
        ) : null}

        {dish.addons.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Adicionais
            </h3>
            {dish.addons.map((a) => (
              <DottedPriceRow key={a.label} label={a.label} price={formatAddon(a.price)} />
            ))}
          </div>
        ) : null}

        <p className="mt-6 rounded-2xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">
          Tempo de preparo de aproximadamente {prepTimeMinutes} minutos.
        </p>
      </div>
    </Sheet>
  );
}
