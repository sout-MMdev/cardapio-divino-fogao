"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, MINUTE / 4);
  return () => window.clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / MINUTE);
const getServerSnapshot = () => null;

/** Hora atual com precisão de minuto; null durante a renderização no servidor (evita divergência na hidratação). */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return minute === null ? null : new Date(minute * MINUTE);
}
