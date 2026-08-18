import type { CoinRecord, LocationGroup } from "../domain/coin";

export function locationKey(rdX: number, rdY: number): string {
  return `${rdX}:${rdY}`;
}

/**
 * Group coins that share the exact same RD coordinate.
 * This is distinct from zoom-level map clustering: records like the 18 coins
 * at RD 139000,452000 are one recorded findspot and must be selectable as a
 * group regardless of zoom.
 */
export function groupByLocation(coins: CoinRecord[]): LocationGroup[] {
  const groups = new Map<string, LocationGroup>();
  for (const coin of coins) {
    let group = groups.get(coin.locationKey);
    if (!group) {
      group = {
        locationKey: coin.locationKey,
        rdX: coin.rdX,
        rdY: coin.rdY,
        longitude: coin.longitude,
        latitude: coin.latitude,
        province: coin.province,
        municipality: coin.municipality,
        coins: [],
      };
      groups.set(coin.locationKey, group);
    }
    group.coins.push(coin);
  }
  // Deterministic order: largest groups first, then by location key.
  return [...groups.values()].sort(
    (a, b) => b.coins.length - a.coins.length || a.locationKey.localeCompare(b.locationKey),
  );
}
