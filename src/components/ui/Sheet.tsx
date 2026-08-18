import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

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
  const startT = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);

  // Exit animation before unmounting — the sheet drops back down instead of
  // disappearing. Reduced-motion users get an instant close.
  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
      return;
    }
    if (!rendered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRendered(false);
      return;
    }
    setClosing(true);
    const t = setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, 180);
    return () => clearTimeout(t);
  }, [open, rendered]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the sheet so keyboard/screen-reader users land in the
    // dialog instead of staying on the map trigger; restore it on close.
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    startT.current = e.timeStamp;
    // Capture the pointer so the drag continues even off the header.
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    setDragY(Math.max(0, delta));
  }, []);

  const onPointerUp = useCallback(() => {
    const elapsed = Math.max(1, performance.now() - startT.current);
    const velocity = dragY / elapsed; // px per ms
    // Dismiss on a long drag OR a short fast flick downward.
    if (dragY > 90 || velocity > 0.4) onClose();
    setDragY(0);
    startY.current = null;
  }, [dragY, onClose]);

  // Shared handler props for the whole header: the drag pill, the title bar
  // and the space around them all initiate a drag — like native sheets.
  // Pointer Events cover touch, mouse and pen in one code path.
  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  } as const;

  if (!rendered) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      className={`fixed inset-x-0 bottom-0 z-30 flex max-h-[75dvh] flex-col rounded-t-xl border-t border-roman-stone/25 bg-roman-paper pb-[env(safe-area-inset-bottom)] shadow-2xl focus:outline-none ${
        closing
          ? "motion-safe:animate-[limes-slide-down_180ms_ease-in]"
          : dragY === 0
            ? "motion-safe:animate-[limes-slide-up_200ms_ease-out]"
            : ""
      }`}
      style={{ transform: `translateY(${dragY}px)` }}
    >
      {/* The entire header (pill + title bar) is the drag surface. The pill
          darkens while dragging to signal the sheet is being moved. */}
      <div
        className="cursor-grab touch-none active:cursor-grabbing"
        {...dragHandlers}
      >
        <div className="flex items-center justify-center pt-2">
          <span
            className={`h-1.5 w-10 rounded-full transition-colors ${
              dragY > 0 ? "bg-roman-stone/70" : "bg-roman-stone/40"
            }`}
            aria-hidden
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="truncate text-sm font-semibold text-roman-charcoal">{title}</h2>
          {/* The close button must not start a drag — stop pointer propagation. */}
          <div onPointerDown={(e) => e.stopPropagation()}>
            <IconButton variant="subtle" size="lg" label="Sluit paneel" onClick={onClose}>
              <X className="h-4 w-4" aria-hidden />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain border-t border-roman-stone/15">{children}</div>
    </div>
  );
}
