import { lazy, Suspense, useMemo, useState } from "react";
import type { FilterState } from "../domain/filters";
import { EMPTY_FILTERS } from "../domain/filters";
import { DATASET_SUMMARY, useCoinFilters } from "../hooks/useCoinFilters";
import { useSelectedCoin } from "../hooks/useSelectedCoin";
import { useUrlExplorerState } from "../hooks/useUrlFilterState";
import { CoinDetails } from "../components/coins/CoinDetails";
import { CoinList } from "../components/coins/CoinList";
import { LocationDetails } from "../components/coins/LocationDetails";
import { StatsPanel } from "../components/coins/StatsPanel";
import { FilterPanel } from "../components/filters/FilterPanel";
import { AppHeader } from "../components/layout/AppHeader";
import { CoinsMap } from "../components/map/CoinsMap";
import { MapControls } from "../components/map/MapControls";
import { MapLegend } from "../components/map/MapLegend";
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

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        view={state.view}
        onViewChange={(view) => update({ view })}
        statsOpen={statsOpen}
        onShowStats={() => setStatsOpen((v) => !v)}
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
        />

        {/* Mobile filter trigger + search */}
        <div className="absolute left-3 top-3 z-20 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-md border border-roman-stone/25 bg-roman-paper px-4 py-2.5 text-sm font-medium text-roman-charcoal shadow-sm transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
          >
            Filters
            {filtered.length !== DATASET_SUMMARY.recordCount && (
              <span className="rounded-full bg-roman-red px-1.5 py-0.5 text-[11px] font-semibold text-roman-paper">
                {filtered.length}
              </span>
            )}
          </button>
        </div>

        <main className="relative min-w-0 flex-1">
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
                  onSelectLocation={openLocation}
                  onSelectCoin={openCoin}
                />
                <MapControls />
                <MapLegend />
                {filtered.length === 0 && (
                  <div className="absolute inset-0 z-10 grid place-items-center bg-roman-charcoal/20 p-4 motion-safe:animate-[limes-fade-in_160ms_ease-out]">
                    <div className="rounded-lg border border-roman-stone/25 bg-roman-paper shadow-xl">
                      <EmptyState variant="map" onReset={resetFilters} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <CoinList coins={filtered} onSelect={openCoin} onResetFilters={resetFilters} />
            )}
          </div>
        </main>

        {/* Desktop drawer — coin/location details and stats share this panel */}
        <div className="hidden lg:block">
          <Drawer open={panelOpen} onClose={closeTopPanel} title={panelTitle}>
            {panelContent}
          </Drawer>
        </div>

        {/* Mobile bottom sheet */}
        <div className="lg:hidden">
          <Sheet open={panelOpen} onClose={closeTopPanel} title={panelTitle}>
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
