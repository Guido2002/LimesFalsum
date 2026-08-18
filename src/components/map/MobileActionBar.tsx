import { Maximize2, Route, SlidersHorizontal } from "lucide-react";
import { useCallback, useState } from "react";

interface MobileActionBarProps {
  activeFilterCount: number;
  onOpenFilters: () => void;
}

/**
 * Bottom action bar for mobile/tablet — the primary map actions within thumb
 * reach. Holds Filters (with active-count badge), Roman roads toggle and
 * fit-to-data. Hidden on desktop where the sidebar and corner controls take
 * over. Replaces the top-left floating buttons on small screens.
 */
export function MobileActionBar({ activeFilterCount, onOpenFilters }: MobileActionBarProps) {
  const [roadsVisible, setRoadsVisible] = useState(true);

  const toggleRoads = useCallback(() => {
    setRoadsVisible((v) => {
      window.dispatchEvent(new CustomEvent("limes:toggle-roads", { detail: !v }));
      return !v;
    });
  }, []);

  const fitData = useCallback(() => {
    window.dispatchEvent(new Event("limes:fit-data"));
  }, []);

  const item =
    "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red motion-safe:active:scale-95";

  return (
    <nav
      aria-label="Kaartacties"
      className="absolute inset-x-3 bottom-3 z-30 flex gap-1.5 rounded-xl border border-roman-stone/25 bg-roman-paper/95 p-1.5 shadow-lg backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={toggleRoads}
        aria-pressed={roadsVisible}
        aria-label={roadsVisible ? "Verberg Romeinse wegen" : "Toon Romeinse wegen"}
        className={`${item} ${
          roadsVisible
            ? "bg-roman-parchment text-roman-red"
            : "text-roman-charcoal hover:bg-roman-parchment"
        }`}
      >
        <Route className="h-4 w-4" aria-hidden />
        Wegen
      </button>
      {/* Filters is the primary action — centered so it reads as the bar's
          main control and stays in the easiest thumb zone. */}
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} actief` : "Filters"}
        className={`${item} relative bg-roman-red text-roman-paper`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {activeFilterCount > 0 && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-roman-gold px-1 text-[10px] font-bold text-roman-oxblood"
          >
            {activeFilterCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={fitData}
        aria-label="Zoom naar alle vindplaatsen"
        className={`${item} text-roman-charcoal hover:bg-roman-parchment`}
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
        Zoom uit
      </button>
    </nav>
  );
}
