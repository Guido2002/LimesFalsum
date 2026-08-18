import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { foldSearchText } from "../../lib/normalize";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Enable a search box inside the option list (useful for municipalities) */
  searchable?: boolean;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  searchable = false,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = foldSearchText(query);
    return options.filter((o) => foldSearchText(o).includes(q));
  }, [options, query]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    );
  };

  return (
    <div className="rounded-md border border-roman-stone/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
      >
        <span className="font-medium text-roman-charcoal">{label}</span>
        <span className="flex items-center gap-1.5">
          {selected.length > 0 && (
            <span className="rounded-full bg-roman-red px-1.5 py-0.5 text-[11px] font-semibold text-roman-paper">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-roman-stone transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
      </button>
      {open && (
        <div className="border-t border-roman-stone/15 p-2">
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter opties..."
              aria-label={`Filter opties voor ${label}`}
              className="mb-1.5 w-full rounded border border-roman-stone/25 px-2 py-1 text-sm focus:border-roman-red focus:outline-none"
            />
          )}
          <ul className="max-h-44 space-y-0.5 overflow-y-auto" role="group" aria-label={label}>
            {visibleOptions.map((option) => (
              <li key={option}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-roman-charcoal hover:bg-roman-parchment">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggle(option)}
                    className="h-3.5 w-3.5 accent-roman-red"
                  />
                  <span className="truncate">{option}</span>
                </label>
              </li>
            ))}
            {visibleOptions.length === 0 && (
              <li className="px-1.5 py-1 text-xs text-roman-stone">Geen opties gevonden.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
