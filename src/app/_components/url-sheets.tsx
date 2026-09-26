"use client";

import { findDish, type Menu } from "@/domain/menu";
import { DishSheet, MenuSearch, sectionId } from "@/features/menu";
import { InfoSheet } from "@/features/restaurant";
import { closeSheet, openSheet, updateSheetValue, useUrlSheet } from "@/lib/url-sheet";

/** Compõe os painéis das features a partir do endereço (?prato, ?info, ?busca). */
export function UrlSheets({ menu }: { menu: Menu }) {
  const sheet = useUrlSheet();
  const dish = sheet.kind === "prato" ? findDish(menu.categories, sheet.slug)?.dish : undefined;
  const close = () => void closeSheet();
  return (
    <>
      <DishSheet
        dish={dish}
        open={Boolean(dish)}
        onClose={close}
        prepTimeMinutes={menu.restaurant.prepTimeMinutes}
      />
      <InfoSheet
        open={sheet.kind === "info"}
        onClose={close}
        restaurant={menu.restaurant}
        openingHours={menu.openingHours}
      />
      <MenuSearch
        open={sheet.kind === "busca"}
        categories={menu.categories}
        query={sheet.kind === "busca" ? sheet.query : ""}
        onQueryChange={(query) => updateSheetValue("busca", query)}
        onPickDish={(slug) => openSheet("prato", slug)}
        onPickCategory={async (slug) => {
          await closeSheet();
          document.getElementById(sectionId(slug))?.scrollIntoView({ block: "start" });
        }}
        onClose={close}
      />
    </>
  );
}
