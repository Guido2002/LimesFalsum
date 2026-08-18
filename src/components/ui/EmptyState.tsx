import { SearchX } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  onReset: () => void;
  /** Map shows this as an overlay card; list view shows it full-page. */
  variant?: "map" | "list";
}

export function EmptyState({ onReset, variant = "list" }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <SearchX className="h-8 w-8 text-roman-stone" aria-hidden />
      <div>
        <p className="font-display text-base font-semibold text-roman-charcoal">
          Hier ligt niets verborgen
        </p>
        <p className="mx-auto mt-1 max-w-64 text-sm text-roman-stone">
          Geen enkele munt past bij deze filters. Maak de zoekopdracht wat ruimer —
          er is genoeg te ontdekken.
        </p>
      </div>
      <Button variant="outline" onClick={onReset}>
        {variant === "map" ? "Toon alles weer" : "Wis alle filters"}
      </Button>
    </div>
  );
}
