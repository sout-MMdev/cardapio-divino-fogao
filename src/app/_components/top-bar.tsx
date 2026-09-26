"use client";

import { useEffect, useState } from "react";
import { openSheet } from "@/lib/url-sheet";
import { IconButton, InfoIcon, SearchIcon } from "@/ui";

/** Barra fixa: ícones sempre visíveis; o nome aparece quando o título grande sai da tela. */
export function TopBar({ restaurantName }: { restaurantName: string }) {
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    const title = document.getElementById("restaurant-name");
    if (!title || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowName(!entry?.isIntersecting),
      { rootMargin: "-56px 0px 0px 0px" },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-4">
        <p
          aria-hidden={!showName}
          className={`truncate font-display text-[20px] font-semibold text-brand transition-opacity duration-300 ${showName ? "opacity-100" : "opacity-0"}`}
        >
          {restaurantName}
        </p>
        <div className="flex gap-2">
          <IconButton label="Buscar no cardápio" onClick={() => openSheet("busca")}>
            <SearchIcon />
          </IconButton>
          <IconButton label="Informações da loja" onClick={() => openSheet("info")}>
            <InfoIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
