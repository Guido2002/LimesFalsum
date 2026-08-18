import { BarChart3, Info, List, Map as MapIcon } from "lucide-react";
import type { ViewMode } from "../../hooks/useUrlFilterState";

interface AppHeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onShowStats: () => void;
  onShowAbout: () => void;
  recordCount: number;
}

/** Compact header: wordmark, dataset count, view toggle, stats, about. */
export function AppHeader({
  view,
  onViewChange,
  onShowStats,
  onShowAbout,
  recordCount,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b-2 border-roman-bronze/40 bg-roman-oxblood px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-baseline gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-semibold leading-none tracking-wide text-roman-gold">
            Limes Coins
          </h1>
          <div className="meander mt-1 w-24" aria-hidden />
        </div>
        <p className="hidden truncate text-xs text-roman-parchment/70 sm:block">
          Romeinse muntvondsten in Nederland · {recordCount} records
        </p>
      </div>

      <nav className="flex items-center gap-1" aria-label="Hoofdnavigatie">
        <div
          role="group"
          aria-label="Weergave"
          className="flex rounded-md border border-roman-gold/30"
        >
          <button
            type="button"
            onClick={() => onViewChange("map")}
            aria-pressed={view === "map"}
            className={`flex items-center gap-1.5 rounded-l-md px-2.5 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold ${
              view === "map"
                ? "bg-roman-red text-roman-paper"
                : "bg-transparent text-roman-parchment hover:bg-roman-red/40"
            }`}
          >
            <MapIcon className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Kaart</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            className={`flex items-center gap-1.5 rounded-r-md px-2.5 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold ${
              view === "list"
                ? "bg-roman-red text-roman-paper"
                : "bg-transparent text-roman-parchment hover:bg-roman-red/40"
            }`}
          >
            <List className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Lijst</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onShowStats}
          aria-label="Toon statistieken"
          title="Statistieken"
          className="rounded-md p-2 text-roman-parchment hover:bg-roman-red/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold"
        >
          <BarChart3 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onShowAbout}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-roman-parchment hover:bg-roman-red/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold"
        >
          <Info className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Over</span>
        </button>
      </nav>
    </header>
  );
}
