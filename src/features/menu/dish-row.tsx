"use client";

import type { Dish } from "@/domain/menu";
import { Chip, DishPhoto } from "@/ui";
import { dishBadges, inlinePrice } from "./lib/presentation";

export function DishRow({ dish, onOpen }: { dish: Dish; onOpen: (slug: string) => void }) {
  const badges = dishBadges(dish);
  return (
    <button
      type="button"
      onClick={() => onOpen(dish.slug)}
      className="flex w-full items-center gap-3.5 border-b border-line py-4 text-left"
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block font-display text-[17px] leading-snug font-semibold ${dish.isAvailable ? "text-ink" : "text-ink-muted"}`}
        >
          {dish.name}
        </span>
        {dish.description ? (
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-muted">
            {dish.description}
          </span>
        ) : null}
        {badges.length > 0 ? (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {badges.map((b) => (
              <Chip key={b.key} tone={b.tone}>
                {b.label}
              </Chip>
            ))}
          </span>
        ) : null}
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          {!dish.isAvailable ? <Chip tone="neutral">Esgotado hoje</Chip> : null}
          <span
            className={`text-[14px] font-bold tabular-nums ${dish.isAvailable ? "text-brand" : "text-ink-muted line-through"}`}
          >
            {inlinePrice(dish)}
          </span>
        </span>
      </span>
      <DishPhoto
        photo={dish.photo}
        sizes="80px"
        className={`size-[76px] shrink-0 rounded-card ${dish.isAvailable ? "" : "grayscale"}`}
      />
    </button>
  );
}
