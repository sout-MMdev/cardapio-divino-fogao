"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/domain/menu";

type Props = { photo?: Photo; sizes: string; className?: string; preload?: boolean };

/** Foto opcional: sem foto ou com erro, some e o layout sem foto assume. */
export function DishPhoto({ photo, sizes, className = "", preload = false }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!photo || failed) return null;
  return (
    <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
