"use client";

import type { Category } from "@/domain/menu";
import { CompactRow } from "./compact-row";
import { DishRow } from "./dish-row";
import { sectionId } from "./lib/presentation";

export function CategorySection({
  category,
  onOpen,
}: {
  category: Category;
  onOpen: (slug: string) => void;
}) {
  const id = sectionId(category.slug);
  const count = category.dishes.length;
  const compact = category.displayStyle === "compact";
  return (
    <section
      id={id}
      data-menu-section={category.slug}
      aria-labelledby={`${id}-titulo`}
      className="scroll-mt-(--sticky-offset) px-5 pt-8"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 id={`${id}-titulo`} className="font-display text-[24px] font-semibold">
          {category.name}
        </h2>
        <span className="text-[12px] text-ink-muted">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
      <ul className={compact ? "mt-1" : ""}>
        {category.dishes.map((dish) => (
          <li key={dish.slug}>
            {compact ? (
              <CompactRow dish={dish} onOpen={onOpen} />
            ) : (
              <DishRow dish={dish} onOpen={onOpen} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
