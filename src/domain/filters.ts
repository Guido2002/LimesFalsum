/**
 * Filter state shared by map, list and statistics.
 * A single pure `filterCoins` function applies this state so every view
 * shows exactly the same subset of records.
 */

export type FindCharacterFilter = "losse vondst" | "schatvondst" | "onbekend";
export type DetectorFilter = "met" | "zonder" | "onbekend";

export interface FilterState {
  search: string;
  dateFrom?: number;
  dateTo?: number;
  authorities: string[];
  provinces: string[];
  municipalities: string[];
  findCharacters: FindCharacterFilter[];
  mints: string[];
  materials: string[];
  statuses: string[];
  detectors: DetectorFilter[];
  terrains: string[];
  onlyWithPan: boolean;
  massMin?: number;
  massMax?: number;
}

export const EMPTY_FILTERS: FilterState = {
  search: "",
  authorities: [],
  provinces: [],
  municipalities: [],
  findCharacters: [],
  mints: [],
  materials: [],
  statuses: [],
  detectors: [],
  terrains: [],
  onlyWithPan: false,
};

export function isFilterActive(f: FilterState): boolean {
  return (
    f.search.trim() !== "" ||
    f.dateFrom !== undefined ||
    f.dateTo !== undefined ||
    f.authorities.length > 0 ||
    f.provinces.length > 0 ||
    f.municipalities.length > 0 ||
    f.findCharacters.length > 0 ||
    f.mints.length > 0 ||
    f.materials.length > 0 ||
    f.statuses.length > 0 ||
    f.detectors.length > 0 ||
    f.terrains.length > 0 ||
    f.onlyWithPan ||
    f.massMin !== undefined ||
    f.massMax !== undefined
  );
}
