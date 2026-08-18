import { useMemo } from "react";
import type { CoinRecord } from "../domain/coin";
import { ALL_COINS } from "./useCoinFilters";

const BY_ID = new Map(ALL_COINS.map((c) => [c.numisId, c]));

/** Resolve the selected coin from the ?coin= URL param. */
export function useSelectedCoin(selectedCoinId: number | undefined): CoinRecord | undefined {
  return useMemo(
    () => (selectedCoinId === undefined ? undefined : BY_ID.get(selectedCoinId)),
    [selectedCoinId],
  );
}
