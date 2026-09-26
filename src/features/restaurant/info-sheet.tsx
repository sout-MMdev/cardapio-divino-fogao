"use client";

import type { ReactNode } from "react";
import type { OpeningRange, Restaurant } from "@/domain/menu";
import { weeklySchedule, zonedMoment } from "@/domain/opening-hours";
import { useNow } from "@/lib/use-now";
import { MapPinIcon, Sheet } from "@/ui";
import { OpenStatus } from "./open-status";

type Props = {
  open: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  openingHours: OpeningRange[];
};

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-line py-4">
    <h3 className="mb-2 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">{title}</h3>
    {children}
  </section>
);

export function InfoSheet({ open, onClose, restaurant, openingHours }: Props) {
  const now = useNow();
  const today = now ? zonedMoment(now, restaurant.timezone).weekday : null;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="info-title">
      <div className="px-5 pt-10 pb-10">
        <p className="text-[13px]">
          <OpenStatus hours={openingHours} timeZone={restaurant.timezone} />
        </p>
        <h2 id="info-title" className="mt-1 mb-4 font-display text-[28px] font-semibold text-brand">
          Informações
        </h2>

        <Block title="Horário">
          <ul className="space-y-1 text-[14px]">
            {weeklySchedule(openingHours).map((day) => {
              const isToday = day.weekday === today;
              return (
                <li
                  key={day.weekday}
                  aria-current={isToday ? "date" : undefined}
                  className={`flex justify-between gap-4 ${isToday ? "font-bold text-brand" : "text-ink"}`}
                >
                  <span>
                    {day.name}
                    {isToday ? " (hoje)" : ""}
                  </span>
                  <span className="tabular-nums">
                    {day.ranges.length ? day.ranges.join(" · ") : "Fechado"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="Endereço">
          <p className="text-[14px] leading-relaxed">{restaurant.address}</p>
          <a
            href={restaurant.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-bold text-brand-ink"
          >
            <MapPinIcon className="size-4" /> Abrir no Google Maps
          </a>
        </Block>

        <Block title="Pagamento">
          <ul className="flex flex-wrap gap-1.5">
            {restaurant.paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-lg bg-surface-muted px-2.5 py-1 text-[12px] font-semibold text-ink"
              >
                {method}
              </li>
            ))}
          </ul>
          {restaurant.paymentNotes.map((note) => (
            <p key={note} className="mt-2 text-[13px] font-semibold text-brand">
              {note}
            </p>
          ))}
        </Block>

        <Block title="Bom saber">
          <ul className="space-y-1 text-[14px] leading-relaxed">
            {restaurant.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
            <li>Preparo em cerca de {restaurant.prepTimeMinutes} minutos.</li>
          </ul>
        </Block>
      </div>
    </Sheet>
  );
}
