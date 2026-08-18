import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "accent";
}

export function Badge({ children, tone = "default" }: BadgeProps) {
  const styles =
    tone === "accent"
      ? "bg-roman-red/10 text-roman-red border-roman-red/25"
      : "bg-roman-parchment text-roman-charcoal border-roman-stone/20";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}
