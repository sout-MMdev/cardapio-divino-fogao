"use client";

import { useEffect, useRef, useState } from "react";
import { sectionId } from "./lib/presentation";

type Item = { slug: string; name: string };

/** Distância do topo (barra + abas) a partir da qual uma seção conta como "atual". */
const OFFSET_PX = 120;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function CategoryNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = items[0]?.slug ?? "";
        for (const item of items) {
          const el = document.getElementById(sectionId(item.slug));
          if (el && el.getBoundingClientRect().top - OFFSET_PX <= 0) current = item.slug;
        }
        setActive(current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [items]);

  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!list || !tab) return;
    list.scrollTo({
      left: tab.offsetLeft - list.clientWidth / 2 + tab.clientWidth / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [active]);

  const go = (slug: string) => {
    setActive(slug);
    document.getElementById(sectionId(slug))?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Categorias do cardápio"
      className="sticky top-14 z-30 border-b border-line bg-bg/95 backdrop-blur"
    >
      <ul ref={listRef} className="no-scrollbar mx-auto flex max-w-xl gap-1 overflow-x-auto px-3">
        {items.map((item) => {
          const isActive = item.slug === active;
          return (
            <li key={item.slug} className="shrink-0">
              <button
                type="button"
                data-tab={item.slug}
                aria-current={isActive ? "true" : undefined}
                onClick={() => go(item.slug)}
                className={`min-h-11 px-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors ${isActive ? "text-brand shadow-[inset_0_-2px_0_var(--color-brand)]" : "text-ink-muted"}`}
              >
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
