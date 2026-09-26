import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">Página não encontrada</h1>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 text-[15px] font-bold text-brand-ink"
      >
        Ver o cardápio
      </Link>
    </main>
  );
}
