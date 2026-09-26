import { getMenuRepository } from "@/data/get-menu-repository";
import { MenuBrowser } from "@/features/menu";
import { PromoCarousel } from "@/features/promotions";
import { RestaurantHeader, buildRestaurantJsonLd, serializeJsonLd } from "@/features/restaurant";
import { SiteFooter } from "./_components/site-footer";
import { TopBar } from "./_components/top-bar";
import { UrlSheets } from "./_components/url-sheets";

/** Modo seed: estático. Modo supabase: regenera no máximo a cada hora (parte 2 revalida ao salvar). */
export const revalidate = 3600;

export default async function MenuPage() {
  const menu = await getMenuRepository().getMenu();
  return (
    <>
      <TopBar restaurantName={menu.restaurant.name} />
      <main className="mx-auto max-w-xl pb-6">
        <RestaurantHeader restaurant={menu.restaurant} openingHours={menu.openingHours} />
        <PromoCarousel promotions={menu.promotions} />
        <MenuBrowser categories={menu.categories} />
        <SiteFooter restaurant={menu.restaurant} />
      </main>
      <UrlSheets menu={menu} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildRestaurantJsonLd(menu, process.env.SITE_URL)),
        }}
      />
    </>
  );
}
