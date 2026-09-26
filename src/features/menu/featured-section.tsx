"use client";

import type { Dish } from "@/domain/menu";
import { DishPhoto } from "@/ui";
import { FEATURED_SECTION, dishBadges, inlinePrice, sectionId } from "./lib/presentation";

export function FeaturedSection({
  dishes,
  onOpen,
}: {
  dishes: Dish[];
  onOpen: (slug: string) => void;
}) {
  if (dishes.length === 0) return null;
  return (
    <section
      id={sectionId(FEATURED_SECTION.slug)}
      data-menu-section={FEATURED_SECTION.slug}
      aria-labelledby="titulo-destaques"
      className="scroll-mt-(--sticky-offset) pt-6"
    >
      <h2 id="titulo-destaques" className="px-5 font-display text-[24px] font-semibold">
        {FEATURED_SECTION.name}
      </h2>
      <ul className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {dishes.map((dish, index) => (
          <li key={dish.slug} className="w-[78%] max-w-[300px] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => onOpen(dish.slug)}
              className="relative block h-[220px] w-full overflow-hidden rounded-[22px] bg-brand text-left"
            >
              <DishPhoto
                photo={dish.photo}
                sizes="(max-width: 480px) 80vw, 300px"
                preload={index === 0}
                className="absolute inset-0"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[rgb(40_10_8/0.85)]"
              />
              <span className="absolute inset-x-4 bottom-4 block text-brand-ink">
                {dishBadges(dish)
                  .slice(0, 1)
                  .map((b) => (
                    <span
                      key={b.key}
                      className="mb-1.5 inline-block rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold tracking-[0.12em] text-brand uppercase"
                    >
                      {b.label}
                    </span>
                  ))}
                <span className="block font-display text-[24px] leading-tight italic">
                  {dish.name}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold">{inlinePrice(dish)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
