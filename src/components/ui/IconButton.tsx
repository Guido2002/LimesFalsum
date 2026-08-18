import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "surface" | "header" | "subtle" | "chip";
type Size = "xs" | "sm" | "md" | "lg" | "map" | "nav";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** surface: bordered card on the map · header: on the oxblood bar ·
      subtle: transparent close/dismiss · chip: tiny round chip remove */
  variant?: Variant;
  /** map: 44px touch / 36px desktop · nav: header toggle sizing */
  size?: Size;
  /** Toggled-on styling — pair with aria-pressed on the caller */
  active?: boolean;
  /** Accessible name; icon-only buttons must always have one */
  label: string;
  children: ReactNode;
}

const base =
  "inline-flex shrink-0 items-center justify-center transition focus-visible:outline focus-visible:outline-2 motion-safe:active:scale-90 disabled:opacity-50";

const variants: Record<Variant, string> = {
  surface:
    "rounded-md border border-roman-stone/25 bg-roman-paper/95 text-roman-charcoal shadow-sm hover:bg-roman-parchment focus-visible:outline-roman-red",
  header:
    "rounded-md text-roman-parchment hover:bg-roman-red/40 focus-visible:outline-roman-gold",
  subtle:
    "rounded text-roman-stone hover:bg-roman-parchment hover:text-roman-charcoal focus-visible:outline-roman-red",
  chip: "rounded-full text-roman-stone hover:bg-roman-red/10 hover:text-roman-red focus-visible:outline-roman-red",
};

const activeStyles: Record<Variant, string> = {
  surface: "border-roman-bronze/50 bg-roman-parchment text-roman-red hover:bg-roman-parchment",
  header: "bg-roman-red text-roman-paper hover:bg-roman-red",
  subtle: "bg-roman-parchment text-roman-charcoal",
  chip: "bg-roman-red/10 text-roman-red",
};

const sizes: Record<Size, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  map: "h-11 w-11 lg:h-9 lg:w-9",
  nav: "min-h-11 min-w-11 p-2 sm:min-h-9 sm:min-w-9",
};

/** Icon-only action button with a mandatory accessible name. */
export function IconButton({
  variant = "subtle",
  size = "md",
  active = false,
  label,
  className = "",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${base} ${variants[variant]} ${active ? activeStyles[variant] : ""} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
