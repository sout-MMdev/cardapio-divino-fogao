export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">Você está offline</h1>
      <p className="mt-2 text-[15px] text-ink-muted">
        Conecte-se à internet para ver o cardápio atualizado.
      </p>
    </main>
  );
}
