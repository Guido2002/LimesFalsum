import { Filter, X } from "lucide-react";
import { useEffect } from "react";
import type { DatasetSummary } from "../../domain/coin";
import { useCountUp } from "../../hooks/useCountUp";
import type { FilterState } from "../../domain/filters";
import { EMPTY_FILTERS } from "../../domain/filters";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { DateRangeFilter } from "./DateRangeFilter";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { SearchInput } from "./SearchInput";

interface FilterPanelProps {
  filters: FilterState;
  summary: DatasetSummary;
  resultCount: number;
  locationCount: number;
  onChange: (filters: FilterState, mode?: "push" | "replace") => void;
  /** Mobile: panel renders inside a collapsible overlay */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterPanel({
  filters,
  summary,
  resultCount,
  locationCount,
  onChange,
  mobileOpen,
  onMobileClose,
}: FilterPanelProps) {
  const set = (patch: Partial<FilterState>, mode: "push" | "replace" = "push") =>
    onChange({ ...filters, ...patch }, mode);

  // Escape closes the mobile overlay, matching the desktop drawers.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const dateMin = summary.dateMin ?? 0;
  const dateMax = summary.dateMax ?? 0;
  // Animated result count. Screen readers get the final value once via the
  // sr-only span; the tweening number is aria-hidden so aria-live stays calm.
  const animatedCount = useCountUp(resultCount);

  const body = (
    <div className="flex h-full flex-col">
      <div className="border-b border-roman-stone/15 p-4">
        <div className="mb-3 flex items-baseline gap-3" aria-live="polite">
          <p className="text-xl font-semibold text-roman-charcoal">
            <span aria-hidden>{animatedCount}</span>
            <span className="sr-only">{resultCount}</span>{" "}
            <span className="text-sm font-normal text-roman-stone">munten</span>
          </p>
          <p className="text-sm text-roman-stone">uit {locationCount} plekken</p>
        </div>
        <SearchInput value={filters.search} onChange={(v) => set({ search: v }, "replace")} />
        <div className="mt-3">
          <ActiveFilterChips filters={filters} onChange={(f) => onChange(f)} />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <DateRangeFilter
          min={dateMin}
          max={dateMax}
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(from, to) => set({ dateFrom: from, dateTo: to })}
        />

        <MultiSelectFilter
          label="Autoriteit / keizer"
          options={summary.authorities}
          selected={filters.authorities}
          onChange={(v) => set({ authorities: v })}
          searchable
        />
        <MultiSelectFilter
          label="Provincie"
          options={summary.provinces}
          selected={filters.provinces}
          onChange={(v) => set({ provinces: v })}
        />
        <MultiSelectFilter
          label="Gemeente"
          options={summary.municipalities}
          selected={filters.municipalities}
          onChange={(v) => set({ municipalities: v })}
          searchable
        />
        <MultiSelectFilter
          label="Karakter vondst"
          options={["losse vondst", "schatvondst", "onbekend"]}
          selected={filters.findCharacters}
          onChange={(v) => set({ findCharacters: v as FilterState["findCharacters"] })}
        />
        <MultiSelectFilter
          label="Productieplaats"
          options={summary.mints}
          selected={filters.mints}
          onChange={(v) => set({ mints: v })}
        />
        <MultiSelectFilter
          label="Materiaal"
          options={summary.materials}
          selected={filters.materials}
          onChange={(v) => set({ materials: v })}
        />
        <MultiSelectFilter
          label="Status"
          options={summary.statuses}
          selected={filters.statuses}
          onChange={(v) => set({ statuses: v })}
        />
        <MultiSelectFilter
          label="Metaaldetector"
          options={["met", "zonder", "onbekend"]}
          selected={filters.detectors}
          onChange={(v) => set({ detectors: v as FilterState["detectors"] })}
        />
        <MultiSelectFilter
          label="Terreintype"
          options={summary.terrains}
          selected={filters.terrains}
          onChange={(v) => set({ terrains: v })}
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-roman-charcoal">
          <input
            type="checkbox"
            checked={filters.onlyWithPan}
            onChange={(e) => set({ onlyWithPan: e.target.checked })}
            className="h-4 w-4 accent-roman-red"
          />
          Alleen vondsten met PAN-nummer
        </label>

        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
            Massa (gram)
          </legend>
          <div className="flex items-end gap-2">
            <label className="w-full">
              <span className="mb-1 block text-xs text-roman-stone">Min</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={filters.massMin ?? ""}
                placeholder="0"
                onChange={(e) =>
                  set({ massMin: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                className="w-full rounded border border-roman-stone/25 px-2.5 py-2 text-base focus:border-roman-red focus:outline-none lg:text-sm"
              />
            </label>
            <span className="pb-2.5 text-roman-stone" aria-hidden>
              –
            </span>
            <label className="w-full">
              <span className="mb-1 block text-xs text-roman-stone">Max</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={filters.massMax ?? ""}
                placeholder="∞"
                onChange={(e) =>
                  set({ massMax: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                className="w-full rounded border border-roman-stone/25 px-2.5 py-2 text-base focus:border-roman-red focus:outline-none lg:text-sm"
              />
            </label>
          </div>
          <p className="mt-1 text-[11px] text-roman-stone">
            Munten waarvan het gewicht niet is vastgelegd worden overgeslagen.
          </p>
        </fieldset>

        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="w-full rounded-md border border-roman-stone/25 py-2 text-sm font-medium text-roman-red transition-colors hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
        >
          Wis alle filters
        </button>
      </div>
    </div>
  );

  // Desktop: persistent sidebar.
  const desktop = (
    <aside className="hidden w-80 shrink-0 border-r border-roman-stone/20 bg-roman-parchment lg:block">
      {body}
    </aside>
  );

  // Mobile: overlay panel.
  const mobile = mobileOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-roman-charcoal/40 motion-safe:animate-[limes-fade-in_180ms_ease-out]"
        onClick={onMobileClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 grid w-[85vw] max-w-sm grid-rows-[auto_minmax(0,1fr)] bg-roman-paper shadow-2xl motion-safe:animate-[limes-slide-in_180ms_ease-out]">
        <div className="flex items-center justify-between border-b border-roman-stone/15 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-roman-charcoal">
            <Filter className="h-4 w-4" aria-hidden /> Filters
          </span>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Sluit filters"
            className="rounded p-2 text-roman-stone hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {body}
      </div>
    </div>
  ) : null;

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
