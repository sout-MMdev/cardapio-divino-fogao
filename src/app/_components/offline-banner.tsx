"use client";

import { useSyncExternalStore } from "react";
import { WifiOffIcon } from "@/ui";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[92%] items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-surface shadow-lg"
    >
      <WifiOffIcon className="size-4" /> Você está offline — mostrando o cardápio salvo
    </div>
  );
}
