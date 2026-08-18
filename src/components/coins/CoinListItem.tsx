import type { CoinRecord } from "../../domain/coin";
import { formatDating } from "../../lib/dates";

interface CoinListItemProps {
  coin: CoinRecord;
  onSelect: (numisId: number) => void;
}

/** Compact result row used in location drawers and the list view. */
export function CoinListItem({ coin, onSelect }: CoinListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(coin.numisId)}
        className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-roman-red"
      >
        <span className="block truncate text-sm font-medium text-roman-charcoal">
          {coin.authorityNormalized[0] ?? coin.authorityRaw}
        </span>
        <span className="block text-xs text-roman-stone">
          {coin.objectRaw} · {formatDating(coin.dateStart, coin.dateEnd)}
          {coin.dateUncertain ? " (?)" : ""}
        </span>
        <span className="mt-0.5 block text-xs text-roman-bronze">NUMIS {coin.numisId}</span>
      </button>
    </li>
  );
}
