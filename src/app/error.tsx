"use client";

export default function MenuError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">
        Não foi possível carregar o cardápio
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted">Verifique sua conexão e tente de novo.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-full bg-brand px-6 text-[15px] font-bold text-brand-ink"
      >
        Tentar novamente
      </button>
    </main>
  );
}
