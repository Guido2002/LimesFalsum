import { X } from "lucide-react";
import type { FilterState } from "../../domain/filters";

interface Chip {
  key: string;
  label: string;
  remove: (f: FilterState) => FilterState;
}

/** Derive the removable chips for every active filter dimension. */
export function buildActiveChips(f: FilterState): Chip[] {
  const chips: Chip[] = [];
  const listChip = (label: string, value: string, field: keyof FilterState) => ({
    key: `${String(field)}:${value}`,
    label: `${label}: ${value}`,
    remove: (next: FilterState) => ({
      ...next,
      [field]: (next[field] as string[]).filter((v) => v !== value),
    }),
  });

  if (f.search.trim()) {
    chips.push({
      key: "search",
      label: `Zoeken: ${f.search.trim()}`,
      remove: (next) => ({ ...next, search: "" }),
    });
  }
  if (f.dateFrom !== undefined || f.dateTo !== undefined) {
    chips.push({
      key: "date",
      label: `Datering: ${f.dateFrom ?? "…"}–${f.dateTo ?? "…"}`,
      remove: (next) => ({ ...next, dateFrom: undefined, dateTo: undefined }),
    });
  }
  for (const v of f.authorities) chips.push(listChip("Autoriteit", v, "authorities"));
  for (const v of f.provinces) chips.push(listChip("Provincie", v, "provinces"));
  for (const v of f.municipalities) chips.push(listChip("Gemeente", v, "municipalities"));
  for (const v of f.findCharacters) chips.push(listChip("Karakter", v, "findCharacters"));
  for (const v of f.mints) chips.push(listChip("Productieplaats", v, "mints"));
  for (const v of f.materials) chips.push(listChip("Materiaal", v, "materials"));
  for (const v of f.statuses) chips.push(listChip("Status", v, "statuses"));
  for (const v of f.detectors) {
    const labels = { met: "Met detector", zonder: "Zonder detector", onbekend: "Detector onbekend" };
    chips.push(listChip("Detector", labels[v], "detectors"));
  }
  for (const v of f.terrains) chips.push(listChip("Terrein", v, "terrains"));
  if (f.onlyWithPan) {
    chips.push({
      key: "pan",
      label: "Alleen met PAN-nummer",
      remove: (next) => ({ ...next, onlyWithPan: false }),
    });
  }
  if (f.massMin !== undefined || f.massMax !== undefined) {
    chips.push({
      key: "mass",
      label: `Massa: ${f.massMin ?? "…"}–${f.massMax ?? "…"} g`,
      remove: (next) => ({ ...next, massMin: undefined, massMax: undefined }),
    });
  }
  return chips;
}

interface ActiveFilterChipsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ActiveFilterChips({ filters, onChange }: ActiveFilterChipsProps) {
  const chips = buildActiveChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-roman-bronze/40 bg-roman-parchment py-0.5 pl-2.5 pr-1 text-xs text-roman-charcoal motion-safe:animate-[limes-pop-in_160ms_ease-out]"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onChange(chip.remove(filters))}
            aria-label={`Verwijder filter ${chip.label}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-roman-stone hover:bg-roman-red/10 hover:text-roman-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
}
