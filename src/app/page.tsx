import { getMenuRepository } from "@/data/get-menu-repository";

export default async function MenuPage() {
  const menu = await getMenuRepository().getMenu();
  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">
        {menu.restaurant.tagline}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-brand">{menu.restaurant.name}</h1>
      <ul className="mt-6 space-y-2">
        {menu.categories.map((c) => (
          <li key={c.slug} className="font-display text-xl">
            {c.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
