import { BarChart3, Info, List, Map as MapIcon } from "lucide-react";
import type { ViewMode } from "../../hooks/useUrlFilterState";

interface AppHeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  statsOpen: boolean;
  onShowStats: () => void;
  onShowAbout: () => void;
  recordCount: number;
}

/** Compact header: wordmark, dataset count, view toggle, stats, about. */
export function AppHeader({
  view,
  onViewChange,
  statsOpen,
  onShowStats,
  onShowAbout,
  recordCount,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b-2 border-roman-bronze/40 bg-roman-oxblood px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-baseline gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-semibold leading-none tracking-wide text-roman-gold">
            LimesFalsum
          </h1>
          <div className="meander mt-1 w-24" aria-hidden />
        </div>
        <p className="hidden truncate text-xs text-roman-parchment/70 sm:block">
          {recordCount} valse denarii, gevonden in Nederlandse bodem
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
            className={`flex min-h-11 items-center gap-1.5 rounded-l-md px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold sm:min-h-9 ${
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
            className={`flex min-h-11 items-center gap-1.5 rounded-r-md px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold sm:min-h-9 ${
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
          aria-pressed={statsOpen}
          aria-label="Statistieken"
          title="Statistieken"
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold sm:min-h-9 sm:min-w-9 ${
            statsOpen
              ? "bg-roman-red text-roman-paper"
              : "text-roman-parchment hover:bg-roman-red/40"
          }`}
        >
          <BarChart3 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onShowAbout}
          aria-label="Over LimesFalsum"
          title="Over LimesFalsum"
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-roman-parchment hover:bg-roman-red/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-gold sm:min-h-9"
        >
          <Info className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Over</span>
        </button>
      </nav>
    </header>
  );
}
