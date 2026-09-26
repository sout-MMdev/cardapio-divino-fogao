import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-brand transition-colors hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
