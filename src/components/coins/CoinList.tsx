import { ArrowDownUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { CoinRecord } from "../../domain/coin";
import { formatDating } from "../../lib/dates";
import { EmptyState } from "../ui/EmptyState";

type SortKey = "date-asc" | "date-desc" | "authority" | "municipality" | "mass" | "numis";

interface CoinListProps {
  coins: CoinRecord[];
  onSelect: (numisId: number) => void;
  onResetFilters: () => void;
}

const SORT_LABELS: Record<SortKey, string> = {
  "date-asc": "Datering oud → nieuw",
  "date-desc": "Datering nieuw → oud",
  authority: "Autoriteit A–Z",
  municipality: "Gemeente A–Z",
  mass: "Massa",
  numis: "NUMIS-nummer",
};

function sortCoins(coins: CoinRecord[], key: SortKey): CoinRecord[] {
  const sorted = [...coins];
  switch (key) {
    case "date-asc":
      sorted.sort((a, b) => (a.dateStart ?? Infinity) - (b.dateStart ?? Infinity));
      break;
    case "date-desc":
      sorted.sort((a, b) => (b.dateStart ?? -Infinity) - (a.dateStart ?? -Infinity));
      break;
    case "authority":
      sorted.sort((a, b) => a.authorityRaw.localeCompare(b.authorityRaw, "nl"));
      break;
    case "municipality":
      sorted.sort((a, b) => a.municipality.localeCompare(b.municipality, "nl"));
      break;
    case "mass":
      // Unknown mass (0 g source values) always sorts last.
      sorted.sort(
        (a, b) =>
          (a.hasKnownMass ? (a.massGram ?? 0) : Infinity) -
          (b.hasKnownMass ? (b.massGram ?? 0) : Infinity),
      );
      break;
    case "numis":
      sorted.sort((a, b) => a.numisId - b.numisId);
      break;
  }
  return sorted;
}

/** Full list alternative to the map. Shares the same filtered collection. */
export function CoinList({ coins, onSelect, onResetFilters }: CoinListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date-asc");
  const sorted = useMemo(() => sortCoins(coins, sortKey), [coins, sortKey]);

  if (coins.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-roman-stone/15 bg-roman-paper px-4 py-2">
        <p className="text-sm text-roman-stone">
          {coins.length} {coins.length === 1 ? "munt" : "munten"}
        </p>
        <label className="flex items-center gap-2 text-sm text-roman-charcoal">
          <ArrowDownUp className="h-3.5 w-3.5 text-roman-stone" aria-hidden />
          <span className="sr-only">Sorteer munten</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded border border-roman-stone/25 bg-roman-paper px-2 py-1 text-sm focus:border-roman-red focus:outline focus:outline-2 focus:outline-roman-red/40"
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Desktop: table */}
      <div className="hidden flex-1 overflow-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-roman-parchment text-xs uppercase tracking-wide text-roman-stone">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">Autoriteit</th>
              <th scope="col" className="px-4 py-2 font-semibold">Datering</th>
              <th scope="col" className="px-4 py-2 font-semibold">Gemeente</th>
              <th scope="col" className="px-4 py-2 font-semibold">Provincie</th>
              <th scope="col" className="px-4 py-2 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2 font-semibold">NUMIS</th>
              <th scope="col" className="px-4 py-2 font-semibold">PAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-roman-stone/10">
            {sorted.map((coin) => (
              <tr
                key={coin.numisId}
                onClick={() => onSelect(coin.numisId)}
                className="cursor-pointer transition-colors hover:bg-roman-parchment/70"
              >
                {/* The first cell holds a real button: keyboard and screen-reader
                    users get a proper named action; the row stays clickable as
                    a convenience for pointer users. */}
                <td className="max-w-52 px-4 py-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(coin.numisId);
                    }}
                    className="block w-full truncate rounded-sm text-left font-medium text-roman-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
                  >
                    {coin.authorityNormalized[0] ?? coin.authorityRaw}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-roman-stone">
                  {formatDating(coin.dateStart, coin.dateEnd)}
                  {coin.dateUncertain ? " (?)" : ""}
                </td>
                <td className="max-w-40 truncate px-4 py-2 text-roman-charcoal">{coin.municipality}</td>
                <td className="px-4 py-2 text-roman-stone">{coin.province}</td>
                <td className="max-w-40 truncate px-4 py-2 text-roman-stone">
                  {coin.statusNormalized ?? coin.statusRaw}
                </td>
                <td className="px-4 py-2 text-roman-bronze-dark">{coin.numisId}</td>
                <td className="px-4 py-2 text-roman-stone">{coin.panId ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="flex-1 divide-y divide-roman-stone/10 overflow-y-auto md:hidden">
        {sorted.map((coin, index) => (
          <li key={coin.numisId}>
            <button
              type="button"
              onClick={() => onSelect(coin.numisId)}
              style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
              className="block w-full px-4 py-3 text-left hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-roman-red motion-safe:animate-[limes-item-in_240ms_ease-out_both]"
            >
              <span className="block text-sm font-medium text-roman-charcoal">
                {coin.authorityNormalized[0] ?? coin.authorityRaw}
              </span>
              <span className="block text-xs text-roman-stone">
                {formatDating(coin.dateStart, coin.dateEnd)} · {coin.municipality},{" "}
                {coin.province}
              </span>
              <span className="mt-0.5 block text-xs text-roman-bronze-dark">
                NUMIS {coin.numisId}
                {coin.panId ? ` · PAN ${coin.panId}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
