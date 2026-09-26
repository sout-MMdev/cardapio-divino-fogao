import type { Promotion } from "@/domain/menu";

export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;
  return (
    <section aria-label="Promoções" className="pb-2">
      {/* tabIndex: a lista rola na horizontal e não tem itens focáveis — teclado precisa alcançá-la */}
      <ul
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {promotions.map((promo) => (
          <li
            key={promo.slug}
            className="flex min-h-[132px] w-[72%] max-w-[270px] shrink-0 snap-start flex-col justify-between rounded-[20px] bg-brand px-4 py-3.5 text-brand-ink"
          >
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase opacity-90">
                Promoção
              </p>
              <p className="mt-1 font-display text-[19px] leading-tight italic">{promo.title}</p>
              {promo.description ? (
                <p className="mt-1 text-[12.5px] leading-snug opacity-95">{promo.description}</p>
              ) : null}
            </div>
            {promo.highlight ? (
              <p className="mt-2 font-display text-[20px] font-semibold">{promo.highlight}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
