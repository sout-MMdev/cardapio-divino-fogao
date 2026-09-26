import { priceSummary, type Menu } from "@/domain/menu";
import { WEEKDAY_NAMES } from "@/domain/opening-hours";

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const reais = (cents: number) => (cents / 100).toFixed(2);

type Offer = { "@type": "Offer"; price: string; priceCurrency: "BRL"; name?: string };

/** Dados estruturados schema.org (Restaurant + Menu) para o Google ler o cardápio. */
export function buildRestaurantJsonLd(menu: Menu, url?: string) {
  const { restaurant } = menu;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant" as const,
    name: restaurant.name,
    ...(url ? { url } : {}),
    servesCuisine: "Brasileira (comida mineira)",
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: "São Leopoldo",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    openingHoursSpecification: menu.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[h.weekday],
      name: WEEKDAY_NAMES[h.weekday],
      opens: h.opensAt,
      closes: h.closesAt,
    })),
    hasMenu: {
      "@type": "Menu" as const,
      inLanguage: "pt-BR",
      hasMenuSection: menu.categories.map((category) => ({
        "@type": "MenuSection" as const,
        name: category.name,
        hasMenuItem: category.dishes.map((dish) => {
          const summary = priceSummary(dish);
          const offers: Offer[] =
            summary.kind === "single"
              ? [{ "@type": "Offer", price: reais(summary.price), priceCurrency: "BRL" }]
              : summary.kind === "variants"
                ? summary.variants.map((v) => ({
                    "@type": "Offer",
                    name: v.label,
                    price: reais(v.price),
                    priceCurrency: "BRL",
                  }))
                : [];
          return {
            "@type": "MenuItem" as const,
            name: dish.name,
            ...(dish.description ? { description: dish.description } : {}),
            offers,
          };
        }),
      })),
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
