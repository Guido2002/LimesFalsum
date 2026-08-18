import { BarChart3, X } from "lucide-react";
import { useMemo } from "react";
import type { CoinRecord } from "../../domain/coin";
import { groupByLocation } from "../../lib/grouping";

interface StatsPanelProps {
  coins: CoinRecord[];
  open: boolean;
  onClose: () => void;
}

function countBy<T extends string>(values: (T | undefined)[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
      <span className="truncate text-roman-charcoal">{label}</span>
      <span className="text-roman-stone">{value}</span>
      <div className="col-span-2 h-1.5 rounded bg-roman-parchment">
        <div
          className="h-full rounded bg-roman-terracotta"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Compact statistics drawer — always computed from the *filtered* collection
 * so numbers match the map, list and counter exactly.
 */
export function StatsPanel({ coins, open, onClose }: StatsPanelProps) {
  const stats = useMemo(() => {
    const locations = groupByLocation(coins);
    const dates = coins.flatMap((c) =>
      c.dateStart !== undefined ? [c.dateStart, c.dateEnd ?? c.dateStart] : [],
    );
    const authorities = countBy(coins.flatMap((c) => c.authorityNormalized)).slice(0, 6);
    const provinces = countBy(coins.map((c) => c.province));
    const loose = coins.filter((c) => c.findCharacter?.toLowerCase().includes("los")).length;
    const hoard = coins.filter((c) => c.findCharacter?.toLowerCase().includes("schat")).length;
    const withDetector = coins.filter((c) => c.detectorUsed === true).length;
    const withoutDetector = coins.filter((c) => c.detectorUsed === false).length;
    return {
      locations: locations.length,
      dateMin: dates.length ? Math.min(...dates) : undefined,
      dateMax: dates.length ? Math.max(...dates) : undefined,
      authorities,
      provinces,
      loose,
      hoard,
      withDetector,
      withoutDetector,
    };
  }, [coins]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Datasetstatistieken"
      className="absolute right-3 top-14 z-20 w-72 rounded-md border border-roman-stone/25 bg-roman-paper shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-roman-stone/15 px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-roman-charcoal">
          <BarChart3 className="h-4 w-4 text-roman-red" aria-hidden />
          Statistieken (huidige selectie)
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluit statistieken"
          className="rounded p-1 text-roman-stone hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="space-y-3 px-3 py-3 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt className="text-roman-stone">Zichtbare munten</dt>
          <dd className="text-right font-semibold text-roman-charcoal">{coins.length}</dd>
          <dt className="text-roman-stone">Unieke locaties</dt>
          <dd className="text-right font-semibold text-roman-charcoal">{stats.locations}</dd>
          <dt className="text-roman-stone">Datingsbereik</dt>
          <dd className="text-right font-semibold text-roman-charcoal">
            {stats.dateMin !== undefined ? `${stats.dateMin}–${stats.dateMax}` : "—"}
          </dd>
          <dt className="text-roman-stone">Losse vondsten</dt>
          <dd className="text-right text-roman-charcoal">{stats.loose}</dd>
          <dt className="text-roman-stone">Schatvondsten</dt>
          <dd className="text-right text-roman-charcoal">{stats.hoard}</dd>
          <dt className="text-roman-stone">Met detector</dt>
          <dd className="text-right text-roman-charcoal">{stats.withDetector}</dd>
          <dt className="text-roman-stone">Zonder detector</dt>
          <dd className="text-right text-roman-charcoal">{stats.withoutDetector}</dd>
        </dl>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
            Meest voorkomende autoriteiten
          </h3>
          <div className="space-y-1.5">
            {stats.authorities.map(([label, value]) => (
              <Bar
                key={label}
                label={label}
                value={value}
                max={stats.authorities[0]?.[1] ?? 1}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
            Per provincie
          </h3>
          <div className="space-y-1.5">
            {stats.provinces.map(([label, value]) => (
              <Bar key={label} label={label} value={value} max={stats.provinces[0]?.[1] ?? 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
