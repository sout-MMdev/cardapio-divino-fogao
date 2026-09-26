"use client";

import { useMemo } from "react";
import { featuredDishes, type Category } from "@/domain/menu";
import { openSheet } from "@/lib/url-sheet";
import { CategoryNav } from "./category-nav";
import { CategorySection } from "./category-section";
import { FeaturedSection } from "./featured-section";
import { FEATURED_SECTION } from "./lib/presentation";

export function MenuBrowser({ categories }: { categories: Category[] }) {
  const featured = useMemo(() => featuredDishes(categories), [categories]);
  const tabs = useMemo(
    () => [
      ...(featured.length ? [FEATURED_SECTION] : []),
      ...categories.map((c) => ({ slug: c.slug, name: c.name })),
    ],
    [categories, featured.length],
  );
  const openDish = (slug: string) => openSheet("prato", slug);
  return (
    <>
      <CategoryNav items={tabs} />
      <FeaturedSection dishes={featured} onOpen={openDish} />
      {categories.map((category) => (
        <CategorySection key={category.slug} category={category} onOpen={openDish} />
      ))}
    </>
  );
}
