import type { Restaurant } from "@/domain/menu";

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="mt-10 px-5 pb-10 text-center text-[12px] leading-relaxed text-ink-muted">
      <p className="font-display text-[16px] text-brand">{restaurant.name}</p>
      <p>{restaurant.address}</p>
      <p className="mt-2">Preços em reais. Imagens ilustrativas. Sujeito a alteração sem aviso.</p>
    </footer>
  );
}
