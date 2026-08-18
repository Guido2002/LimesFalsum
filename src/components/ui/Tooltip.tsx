import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

/** Minimal CSS-only tooltip that stays keyboard-accessible (focus shows it). */
export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden w-52 -translate-x-1/2 rounded-md bg-roman-charcoal px-2 py-1 text-center text-xs text-roman-paper group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}
