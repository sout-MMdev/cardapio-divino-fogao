import type { ReactNode } from "react";

type Props = { label: ReactNode; price: string; muted?: boolean };

export function DottedPriceRow({ label, price, muted = false }: Props) {
  return (
    <div className="flex items-baseline gap-2 py-1.5 text-[14px]">
      <span className={`min-w-0 ${muted ? "text-ink-muted" : "text-ink"}`}>{label}</span>
      <span
        aria-hidden="true"
        className="mb-1 min-w-4 flex-1 border-b border-dotted border-line-strong"
      />
      <span
        className={`shrink-0 font-bold tabular-nums ${muted ? "text-ink-muted line-through" : "text-brand"}`}
      >
        {price}
      </span>
    </div>
  );
}
