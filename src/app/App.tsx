import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { FilterState } from "../domain/filters";
import { EMPTY_FILTERS } from "../domain/filters";
import { DATASET_SUMMARY, useCoinFilters } from "../hooks/useCoinFilters";
import { useSelectedCoin } from "../hooks/useSelectedCoin";
import { useUrlExplorerState } from "../hooks/useUrlFilterState";
import { CoinDetails } from "../components/coins/CoinDetails";
import { CoinList } from "../components/coins/CoinList";
import { LocationDetails } from "../components/coins/LocationDetails";
import { StatsPanel } from "../components/coins/StatsPanel";
import { buildActiveChips } from "../components/filters/ActiveFilterChips";
import { FilterPanel } from "../components/filters/FilterPanel";
import { AppHeader } from "../components/layout/AppHeader";
import { CoinsMap } from "../components/map/CoinsMap";
import { MapControls } from "../components/map/MapControls";
import { MapLegend } from "../components/map/MapLegend";
import { MobileActionBar } from "../components/map/MobileActionBar";
import { Drawer } from "../components/ui/Drawer";
import { EmptyState } from "../components/ui/EmptyState";
import { Sheet } from "../components/ui/Sheet";

// About is noncritical for the core explorer experience — load lazily.
const AboutPage = lazy(() => import("./AboutPage"));

/**
 * Composition root. Holds no parsing/filtering logic itself: filter state
 * lives in the URL, the filtered collection comes from useCoinFilters, and
 * every view consumes the same collection.
 */
export function App() {
  const { state, update } = useUrlExplorerState();
  const { filtered, groups } = useCoinFilters(state.filters);
  const selectedCoin = useSelectedCoin(state.selectedCoinId);
  const [statsOpen, setStatsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Desktop: the filter sidebar is collapsible so the map can go full width.
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);
  // Track the Fullscreen API so the detail panel can mount INSIDE the map
  // shell while fullscreen — otherwise it renders outside the fullscreen
  // element and the browser never paints it.
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setMapFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const selectedGroup = useMemo(
    () =>
      state.selectedLocationKey
        ? groups.find((g) => g.locationKey === state.selectedLocationKey)
        : undefined,
    [groups, state.selectedLocationKey],
  );

  const setFilters = (filters: FilterState, mode: "push" | "replace" = "push") =>
    update({ filters }, mode);

  const resetFilters = () => update({ filters: EMPTY_FILTERS });

  const openCoin = (numisId: number) => update({ selectedCoinId: numisId });
  const openLocation = (locationKey: string) =>
    update({ selectedLocationKey: locationKey, selectedCoinId: undefined });
  const closePanel = () =>
    update({ selectedCoinId: undefined, selectedLocationKey: undefined });

  const detailOpen = selectedCoin !== undefined || selectedGroup !== undefined;
  // Stats and coin/location details share the same side panel. Details take
  // precedence while open; closing them returns to the stats, whose toggle
  // state is preserved — nothing is destroyed.
  const panelOpen = detailOpen || statsOpen;
  // The header stats button must reflect what is actually on screen. While a
  // coin/location detail covers the stats, toggling stats swaps the panel
  // content instead of flipping hidden state the user cannot see.
  const statsVisible = statsOpen && !detailOpen;
  const toggleStats = () => {
    if (statsVisible) {
      setStatsOpen(false);
      return;
    }
    if (detailOpen) closePanel();
    setStatsOpen(true);
  };
  const panelTitle = selectedCoin
    ? `NUMIS ${selectedCoin.numisId}`
    : selectedGroup
      ? `Vindplaats ${selectedGroup.municipality}`
      : "Statistieken";
  const closeTopPanel = () => {
    if (detailOpen) closePanel();
    else setStatsOpen(false);
  };

  const panelContent = selectedCoin ? (
    <CoinDetails
      coin={selectedCoin}
      onBack={selectedGroup ? () => update({ selectedCoinId: undefined }) : undefined}
    />
  ) : selectedGroup ? (
    <LocationDetails group={selectedGroup} onSelectCoin={openCoin} />
  ) : statsOpen ? (
    <StatsPanel coins={filtered} />
  ) : null;

  const activeFilterCount = buildActiveChips(state.filters).length;

  return (
    <div className="flex h-full flex-col">
      {/* Skip link: first tab stop, jumps past the header to the map/list. */}
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-roman-red focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-roman-paper"
      >
        Direct naar inhoud
      </a>
      <AppHeader
        view={state.view}
        onViewChange={(view) => update({ view })}
        statsOpen={statsVisible}
        onShowStats={toggleStats}
        onShowAbout={() => setAboutOpen(true)}
        recordCount={DATASET_SUMMARY.recordCount}
      />

      <div className="relative flex min-h-0 flex-1">
        <FilterPanel
          filters={state.filters}
          summary={DATASET_SUMMARY}
          resultCount={filtered.length}
          locationCount={groups.length}
          onChange={setFilters}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
          onDesktopClose={desktopFiltersOpen ? () => setDesktopFiltersOpen(false) : undefined}
          desktopOpen={desktopFiltersOpen}
        />

        {/* Desktop: floating trigger to reopen the collapsed sidebar. The
            corner map controls shift down to make room (see MapControls). */}
        {!desktopFiltersOpen && (
          <div className="absolute left-3 top-3 z-20 hidden lg:block">
            <button
              type="button"
              autoFocus
              onClick={() => setDesktopFiltersOpen(true)}
              aria-label={
                activeFilterCount > 0 ? `Toon filters, ${activeFilterCount} actief` : "Toon filters"
              }
              className="flex min-h-9 items-center gap-1.5 rounded-md border border-roman-stone/25 bg-roman-paper px-3 py-1.5 text-sm font-medium text-roman-charcoal shadow-sm transition-colors hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
            >
              Filters
              {activeFilterCount > 0 && (
                <span
                  aria-hidden
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-roman-red px-1.5 text-[11px] font-semibold text-roman-paper"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}

        <main id="hoofdinhoud" tabIndex={-1} className="relative min-w-0 flex-1 focus:outline-none">
          {/* Keying by view crossfades map ↔ list on switch. */}
          <div key={state.view} className="h-full motion-safe:animate-[limes-fade-in_180ms_ease-out]">
            {state.view === "map" ? (
              <div id="limes-map-shell" className="relative h-full">
                {/* Keep the map mounted even with zero results so the user
                    retains geographic context; show the empty state as an
                    overlay card instead of replacing the map. */}
                <CoinsMap
                  groups={groups}
                  selectedCoinId={state.selectedCoinId}
                  selectedLocationKey={state.selectedLocationKey}
                  filters={state.filters}
                  onSelectLocation={openLocation}
                  onSelectCoin={openCoin}
                />
                <MapControls indented={!desktopFiltersOpen} />
                <MapLegend />
                <MobileActionBar
                  activeFilterCount={activeFilterCount}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                />
                {filtered.length === 0 && (
                  // The overlay only dims the map — panning/zooming stays
                  // possible, only the card itself intercepts pointer events.
                  <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-roman-charcoal/20 p-4 motion-safe:animate-[limes-fade-in_160ms_ease-out]">
                    <div className="pointer-events-auto rounded-lg border border-roman-stone/25 bg-roman-paper shadow-xl">
                      <EmptyState variant="map" onReset={resetFilters} />
                    </div>
                  </div>
                )}
                {/* In fullscreen the app chrome isn't painted, so the detail
                    panel must live inside the shell: a floating card on
                    desktop, a bottom sheet on touch screens. */}
                {mapFullscreen && detailOpen && (
                  <>
                    <div className="absolute right-3 top-3 z-20 hidden h-[calc(100%-1.5rem)] w-[340px] overflow-hidden rounded-lg shadow-xl lg:block">
                      <Drawer open onClose={closeTopPanel} title={panelTitle}>
                        {panelContent}
                      </Drawer>
                    </div>
                    <div className="lg:hidden">
                      <Sheet open onClose={closeTopPanel} title={panelTitle}>
                        {panelContent}
                      </Sheet>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <CoinList coins={filtered} onSelect={openCoin} onResetFilters={resetFilters} />
            )}
          </div>
        </main>

        {/* Desktop drawer — coin/location details and stats share this panel.
            Skipped while the map is fullscreen: a copy inside the map shell
            takes over there, since elements outside the fullscreen element
            are not painted. */}
        <div className="hidden lg:block">
          <Drawer open={panelOpen && !mapFullscreen} onClose={closeTopPanel} title={panelTitle}>
            {panelContent}
          </Drawer>
        </div>

        {/* Mobile bottom sheet — likewise skipped while the map is fullscreen. */}
        <div className="lg:hidden">
          <Sheet open={panelOpen && !mapFullscreen} onClose={closeTopPanel} title={panelTitle}>
            {panelContent}
          </Sheet>
        </div>
      </div>

      {aboutOpen && (
        <Suspense fallback={null}>
          <AboutPage onClose={() => setAboutOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
