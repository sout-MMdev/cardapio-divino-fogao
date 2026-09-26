import type { OpeningRange, Restaurant } from "@/domain/menu";
import { ClockIcon } from "@/ui";
import { OpenStatus } from "./open-status";

type Props = { restaurant: Restaurant; openingHours: OpeningRange[] };

export function RestaurantHeader({ restaurant, openingHours }: Props) {
  return (
    <header className="px-5 pt-1 pb-5">
      <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">
        {restaurant.tagline}
      </p>
      <h1
        id="restaurant-name"
        className="mt-1.5 font-display text-[36px] leading-[1.05] font-semibold tracking-tight text-brand"
      >
        {restaurant.name}
      </h1>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-muted">
        <OpenStatus hours={openingHours} timeZone={restaurant.timezone} />
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          Preparo em ~{restaurant.prepTimeMinutes} min
        </span>
      </div>
    </header>
  );
}
