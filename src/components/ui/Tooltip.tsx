import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  /** Horizontal alignment of the bubble relative to the trigger. Use
      start/end for triggers near a viewport edge so the bubble stays on
      screen instead of being clipped. */
  align?: "center" | "start" | "end";
  children: ReactNode;
}

const alignments = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0",
  end: "right-0",
} as const;

/** Minimal CSS-only tooltip that stays keyboard-accessible (focus shows it). */
export function Tooltip({ label, align = "center", children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-50 mb-1 hidden w-52 max-w-[calc(100vw-2rem)] rounded-md bg-roman-charcoal px-2 py-1 text-center text-xs text-roman-paper group-hover:block group-focus-within:block ${alignments[align]}`}
      >
        {label}
      </span>
    </span>
  );
}
