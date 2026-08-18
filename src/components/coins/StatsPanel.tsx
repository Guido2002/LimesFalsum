import { useMemo } from "react";
import type { CoinRecord } from "../../domain/coin";
import { groupByLocation } from "../../lib/grouping";

interface StatsPanelProps {
  coins: CoinRecord[];
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
          className="h-full origin-left rounded bg-roman-terracotta motion-safe:animate-[limes-bar-grow_450ms_ease-out]"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

/** Headline metric tile with the Roman display face. */
function StatTile({
  label,
  value,
  index = 0,
}: {
  label: string;
  value: string | number;
  index?: number;
}) {
  return (
    <div
      className="rounded-md border border-roman-stone/15 bg-roman-parchment/60 px-3 py-2.5 motion-safe:animate-[limes-pop-in_220ms_ease-out_both]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <dd className="font-display text-lg font-semibold leading-tight text-roman-charcoal">
        {value}
      </dd>
      <dt className="mt-0.5 text-[11px] uppercase tracking-wide text-roman-stone">{label}</dt>
    </div>
  );
}

/** Definition-list row for the breakdown section. */
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <dt className="text-roman-stone">{label}</dt>
      <dd className="font-medium text-roman-charcoal">{value}</dd>
    </div>
  );
}

/**
 * Statistics content for the shared side panel (Drawer on desktop, Sheet on
 * mobile). Always computed from the *filtered* collection so numbers match
 * the map, list and counter exactly. The surrounding panel provides the
 * chrome: title, close button, Escape handling and focus management.
 */
export function StatsPanel({ coins }: StatsPanelProps) {
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

  return (
    <div className="space-y-5 px-4 py-4">
      <p className="text-xs text-roman-stone">
        Het verhaal van de {coins.length} munten in je huidige selectie.
      </p>

      <dl className="grid grid-cols-3 gap-2">
        <StatTile label="Munten" value={coins.length} index={0} />
        <StatTile label="Plekken" value={stats.locations} index={1} />
        <StatTile
          label="Periode"
          value={stats.dateMin !== undefined ? `${stats.dateMin}–${stats.dateMax}` : "—"}
          index={2}
        />
      </dl>

      <dl className="divide-y divide-roman-stone/10 text-sm">
        <StatRow label="Losse vondsten" value={stats.loose} />
        <StatRow label="Verborgen schatten" value={stats.hoard} />
        <StatRow label="Gevonden met detector" value={stats.withDetector} />
        <StatRow label="Zonder detector" value={stats.withoutDetector} />
      </dl>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
          Wie staat er op de munten?
        </h3>
        <div className="space-y-1.5">
          {stats.authorities.map(([label, value]) => (
            <Bar key={label} label={label} value={value} max={stats.authorities[0]?.[1] ?? 1} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
          Waar kwamen ze uit de grond?
        </h3>
        <div className="space-y-1.5">
          {stats.provinces.map(([label, value]) => (
            <Bar key={label} label={label} value={value} max={stats.provinces[0]?.[1] ?? 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
