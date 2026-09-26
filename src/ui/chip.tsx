import type { ReactNode } from "react";

export type ChipTone = "accent" | "success" | "neutral" | "brand";

const TONES: Record<ChipTone, string> = {
  accent: "bg-surface-muted text-accent",
  success: "bg-success-soft text-success",
  neutral: "border border-line-strong text-ink-muted",
  brand: "bg-brand text-brand-ink",
};

export function Chip({ children, tone = "accent" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-5 font-bold tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
