"use client";

import type { OpeningRange } from "@/domain/menu";
import { formatOpenStatus, openStatus } from "@/domain/opening-hours";
import { useNow } from "@/lib/use-now";

export function OpenStatus({ hours, timeZone }: { hours: OpeningRange[]; timeZone: string }) {
  const now = useNow();
  if (!now) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-4 w-44 animate-pulse rounded-full bg-surface-muted"
      />
    );
  }
  const status = openStatus(hours, now, timeZone);
  const open = status.kind === "open";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${open ? "text-success" : "text-ink-muted"}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${open ? "bg-success" : "bg-ink-muted"}`}
      />
      {formatOpenStatus(status)}
    </span>
  );
}
