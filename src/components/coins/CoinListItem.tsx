import type { CoinRecord } from "../../domain/coin";
import { formatDating } from "../../lib/dates";

interface CoinListItemProps {
  coin: CoinRecord;
  onSelect: (numisId: number) => void;
  /** Stagger position for the entrance animation (optional) */
  index?: number;
}

/** Compact result row used in location drawers and the list view. */
export function CoinListItem({ coin, onSelect, index }: CoinListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(coin.numisId)}
        style={index !== undefined ? { animationDelay: `${Math.min(index, 12) * 30}ms` } : undefined}
        className="block w-full px-4 py-3 text-left transition hover:bg-roman-parchment hover:shadow-[inset_3px_0_0_0_#8A2E25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-roman-red motion-safe:animate-[limes-item-in_240ms_ease-out_both]"
      >
        <span className="block truncate text-sm font-medium text-roman-charcoal">
          {coin.authorityNormalized[0] ?? coin.authorityRaw}
        </span>
        <span className="block text-xs text-roman-stone">
          {coin.objectRaw} · {formatDating(coin.dateStart, coin.dateEnd)}
          {coin.dateUncertain ? " (?)" : ""}
        </span>
        <span className="mt-0.5 block text-xs text-roman-bronze-dark">NUMIS {coin.numisId}</span>
      </button>
    </li>
  );
}
