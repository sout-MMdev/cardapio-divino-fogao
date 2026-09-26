"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { CloseIcon } from "./icons";

type Props = { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode };

const DRAG_TO_CLOSE_PX = 96;

/** Painel inferior sobre <dialog> nativo: foco preso, Esc, fundo inerte e retorno de foco de graça. */
export function Sheet({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal foca o primeiro focável (o "Fechar"); respeita quem pediu foco explícito
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onPointerUp = () => {
    if (dragY > DRAG_TO_CLOSE_PX) onClose();
    dragStart.current = null;
    setDragY(0);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className="sheet"
      style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-full flex-col">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 flex h-7 cursor-grab touch-none justify-center pt-2"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1.5 w-10 rounded-full bg-line-strong/90" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 inline-flex size-11 items-center justify-center rounded-full bg-surface/90 text-brand shadow-sm backdrop-blur focus-visible:outline-2 focus-visible:outline-brand"
        >
          <CloseIcon />
        </button>
        <div className="h-full overflow-y-auto overscroll-contain">{open ? children : null}</div>
      </div>
    </dialog>
  );
}
