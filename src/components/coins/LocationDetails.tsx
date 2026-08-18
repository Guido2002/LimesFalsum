import { MapPin } from "lucide-react";
import type { LocationGroup } from "../../domain/coin";
import { CoinListItem } from "./CoinListItem";

interface LocationDetailsProps {
  group: LocationGroup;
  onSelectCoin: (numisId: number) => void;
}

/**
 * Exact-coordinate group: several records recorded at the same RD point.
 * Opens before individual coin detail so nothing overlaps invisibly.
 */
export function LocationDetails({ group, onSelectCoin }: LocationDetailsProps) {
  return (
    <div className="pb-4">
      <header className="px-4 pb-2 pt-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> Vindplaats
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold text-roman-charcoal">
          {group.municipality}, {group.province}
        </h2>
        <p className="mt-0.5 text-sm text-roman-stone">
          {group.coins.length} muntvondsten op deze locatie
        </p>
      </header>
      <ul className="divide-y divide-roman-stone/10">
        {group.coins.map((coin) => (
          <CoinListItem key={coin.numisId} coin={coin} onSelect={onSelectCoin} />
        ))}
      </ul>
    </div>
  );
}
