import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-roman-red text-roman-paper hover:bg-roman-oxblood border border-roman-red",
  ghost:
    "bg-transparent text-roman-charcoal hover:bg-roman-parchment border border-transparent",
  outline:
    "bg-roman-paper text-roman-charcoal hover:bg-roman-parchment border border-roman-stone/30",
};

export function Button({ variant = "ghost", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-roman-red disabled:opacity-50 motion-safe:active:scale-[0.96] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
