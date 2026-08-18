import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function visibleFocusables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * Focus containment for aria-modal overlays. On activation, focus moves to
 * the first focusable element inside (or the container itself); Tab and
 * Shift+Tab cycle within the container; on teardown, focus returns to the
 * element that had it before. Escape handling stays with the caller.
 */
export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    previousFocus.current = document.activeElement;
    const items = visibleFocusables(container);
    (items[0] ?? container).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = visibleFocusables(container);
      if (focusable.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      // Focus escaped outside (e.g. browser chrome edge cases) — pull it back.
      if (current && !container.contains(current)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
  }, [active]);

  return ref;
}
