import { useMemo } from "react";
import type { CoinRecord, DatasetSummary, LocationGroup } from "../domain/coin";
import type { FilterState } from "../domain/filters";
import { filterCoins } from "../lib/search";
import { groupByLocation } from "../lib/grouping";
import coinsData from "../data/generated/coins.json";
import summaryData from "../data/generated/dataset-summary.json";

export const ALL_COINS = coinsData as CoinRecord[];
export const DATASET_SUMMARY = summaryData as DatasetSummary;

/** All view layers (map, list, stats, counter) derive from this one hook. */
export function useCoinFilters(filters: FilterState): {
  filtered: CoinRecord[];
  groups: LocationGroup[];
} {
  const filtered = useMemo(() => filterCoins(ALL_COINS, filters), [filters]);
  const groups = useMemo(() => groupByLocation(filtered), [filtered]);
  return { filtered, groups };
}
