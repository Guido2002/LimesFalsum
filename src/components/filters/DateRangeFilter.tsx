interface DateRangeFilterProps {
  min: number;
  max: number;
  from?: number;
  to?: number;
  onChange: (from?: number, to?: number) => void;
}

/**
 * Dual-range timeline over the parsed dataset extent (derived, never
 * hardcoded). A record matches when its dating range intersects the filter.
 */
export function DateRangeFilter({ min, max, from, to, onChange }: DateRangeFilterProps) {
  const lo = from ?? min;
  const hi = to ?? max;

  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
        Datering
      </legend>
      <div className="mb-1 flex justify-between text-xs text-roman-charcoal">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          aria-label={`Datering vanaf (${lo})`}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi);
            onChange(v === min && hi === max ? undefined : v, to);
          }}
          className="h-7 w-full cursor-pointer accent-roman-red"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          aria-label={`Datering tot en met (${hi})`}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo);
            onChange(from, v === max && (from ?? min) === min ? undefined : v);
          }}
          className="h-7 w-full cursor-pointer accent-roman-red"
        />
      </div>
      <p className="mt-1 text-[11px] text-roman-stone">
        {min}–{max} n.Chr.
      </p>
    </fieldset>
  );
}
