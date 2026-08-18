import type { CoinRecord } from "../domain/coin";
import type { DetectorFilter, FilterState, FindCharacterFilter } from "../domain/filters";
import { foldSearchText } from "./normalize";

function findCharacterBucket(coin: CoinRecord): FindCharacterFilter {
  const raw = coin.findCharacter?.toLowerCase();
  if (raw?.includes("schat")) return "schatvondst";
  if (raw?.includes("los")) return "losse vondst";
  return "onbekend";
}

function detectorBucket(coin: CoinRecord): DetectorFilter {
  if (coin.detectorUsed === true) return "met";
  if (coin.detectorUsed === false) return "zonder";
  return "onbekend";
}

/**
 * The single source of truth for filtering. Map, list, statistics and the
 * result counter all consume the output of this function so they can never
 * disagree with each other.
 */
export function filterCoins(coins: CoinRecord[], f: FilterState): CoinRecord[] {
  const query = foldSearchText(f.search);
  return coins.filter((coin) => {
    if (query && !coin.searchText.includes(query)) return false;

    // Date intersection: coin range overlaps filter range.
    if (f.dateFrom !== undefined || f.dateTo !== undefined) {
      if (coin.dateStart === undefined) return false;
      const start = coin.dateStart;
      const end = coin.dateEnd ?? coin.dateStart;
      if (f.dateFrom !== undefined && end < f.dateFrom) return false;
      if (f.dateTo !== undefined && start > f.dateTo) return false;
    }

    if (f.authorities.length > 0) {
      if (!f.authorities.some((a) => coin.authorityNormalized.includes(a))) return false;
    }
    if (f.provinces.length > 0 && !f.provinces.includes(coin.province)) return false;
    if (f.municipalities.length > 0 && !f.municipalities.includes(coin.municipality)) return false;

    if (f.findCharacters.length > 0 && !f.findCharacters.includes(findCharacterBucket(coin))) {
      return false;
    }
    if (f.mints.length > 0 && (!coin.mintNormalized || !f.mints.includes(coin.mintNormalized))) {
      return false;
    }
    if (
      f.materials.length > 0 &&
      (!coin.materialNormalized || !f.materials.includes(coin.materialNormalized))
    ) {
      return false;
    }
    if (f.statuses.length > 0 && (!coin.statusNormalized || !f.statuses.includes(coin.statusNormalized))) {
      return false;
    }
    if (f.detectors.length > 0 && !f.detectors.includes(detectorBucket(coin))) return false;
    if (
      f.terrains.length > 0 &&
      (!coin.terrainNormalized || !f.terrains.includes(coin.terrainNormalized))
    ) {
      return false;
    }
    if (f.onlyWithPan && !coin.panId) return false;

    // Mass filter ignores zero/unknown values entirely (0 g in NUMIS is not
    // a real measurement).
    if (f.massMin !== undefined || f.massMax !== undefined) {
      if (!coin.hasKnownMass || coin.massGram === undefined) return false;
      if (f.massMin !== undefined && coin.massGram < f.massMin) return false;
      if (f.massMax !== undefined && coin.massGram > f.massMax) return false;
    }

    return true;
  });
}
