import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Right-hand detail drawer (desktop). Renders with dialog semantics, closes
 * on Escape, and returns focus to the previously focused element on close.
 */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      className="flex h-full w-[380px] shrink-0 flex-col border-l border-roman-stone/20 bg-roman-paper shadow-lg focus:outline-none"
    >
      <div className="flex items-center justify-between border-b border-roman-stone/15 px-4 py-3">
        <h2 className="truncate text-sm font-semibold text-roman-charcoal">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluit detailpaneel"
          className="rounded p-1 text-roman-stone transition-colors hover:bg-roman-parchment hover:text-roman-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
