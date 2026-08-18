import { SearchX } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <SearchX className="h-8 w-8 text-roman-stone" aria-hidden />
      <div>
        <p className="text-base font-semibold text-roman-charcoal">Geen muntvondsten gevonden</p>
        <p className="mt-1 text-sm text-roman-stone">Pas de filters aan of wis alle filters.</p>
      </div>
      <Button variant="outline" onClick={onReset}>
        Wis alle filters
      </Button>
    </div>
  );
}
