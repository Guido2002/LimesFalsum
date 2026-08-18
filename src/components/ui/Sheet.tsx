import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Mobile bottom sheet with drag-to-dismiss. Used for location and coin
 * details on small screens where a side drawer would cover the map.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    setDragY(Math.max(0, delta));
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragY > 90) onClose();
    setDragY(0);
    startY.current = null;
  }, [dragY, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className="fixed inset-x-0 bottom-0 z-30 flex max-h-[75dvh] flex-col rounded-t-xl border-t border-roman-stone/25 bg-roman-paper pb-[env(safe-area-inset-bottom)] shadow-2xl"
      style={{ transform: `translateY(${dragY}px)` }}
    >
      <div
        className="flex cursor-grab items-center justify-center pt-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className="h-1.5 w-10 rounded-full bg-roman-stone/40" aria-hidden />
      </div>
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="truncate text-sm font-semibold text-roman-charcoal">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluit paneel"
          className="rounded p-2 text-roman-stone hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain border-t border-roman-stone/15">{children}</div>
    </div>
  );
}
