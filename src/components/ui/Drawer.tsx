import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "./IconButton";

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
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);

  // Play the exit animation before unmounting so the panel slides out
  // instead of vanishing. Reduced-motion users get an instant close.
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

  if (!rendered) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      className={`flex h-full w-full shrink-0 flex-col border-l border-roman-stone/20 bg-roman-paper shadow-lg focus:outline-none lg:w-[380px] ${
        closing
          ? "motion-safe:animate-[limes-slide-out-right_180ms_ease-in]"
          : "motion-safe:animate-[limes-slide-in-right_200ms_ease-out]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-roman-stone/15 px-4 py-3">
        <h2 className="truncate text-sm font-semibold text-roman-charcoal">{title}</h2>
        <IconButton variant="subtle" size="md" label="Sluit detailpaneel" onClick={onClose}>
          <X className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
