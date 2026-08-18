/**
 * Single state hook for the explorer: filter state is parsed from and
 * serialized to URL search params so views are shareable and browser
 * back/forward works naturally.
 *
 * Supported params:
 *   q          search text
 *   authority  comma-separated multi-select
 *   province, municipality, mint, status, material, terrain  same
 *   find       los|schat|onbekend (comma-separated)
 *   detector   met|zonder|onbekend
 *   from, to   dating range (years)
 *   massMin, massMax
 *   pan        "1" → only records with a PAN number
 *   coin       NUMIS id of the open record
 *   loc        locationKey of the open location drawer
 *   view       map | list
 */
import { useCallback, useEffect, useState } from "react";
import type { DetectorFilter, FilterState, FindCharacterFilter } from "../domain/filters";
import { EMPTY_FILTERS } from "../domain/filters";

export type ViewMode = "map" | "list";

export interface ExplorerState {
  filters: FilterState;
  view: ViewMode;
  selectedCoinId?: number;
  selectedLocationKey?: string;
}

const FIND_VALUES: FindCharacterFilter[] = ["losse vondst", "schatvondst", "onbekend"];
const DETECTOR_VALUES: DetectorFilter[] = ["met", "zonder", "onbekend"];

function listParam(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

export function parseStateFromUrl(search: string): ExplorerState {
  const params = new URLSearchParams(search);
  const num = (key: string): number | undefined => {
    const v = params.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const filters: FilterState = {
    ...EMPTY_FILTERS,
    search: params.get("q") ?? "",
    dateFrom: num("from"),
    dateTo: num("to"),
    authorities: listParam(params, "authority"),
    provinces: listParam(params, "province"),
    municipalities: listParam(params, "municipality"),
    mints: listParam(params, "mint"),
    statuses: listParam(params, "status"),
    materials: listParam(params, "material"),
    terrains: listParam(params, "terrain"),
    findCharacters: listParam(params, "find").filter((v): v is FindCharacterFilter =>
      FIND_VALUES.includes(v as FindCharacterFilter),
    ),
    detectors: listParam(params, "detector").filter((v): v is DetectorFilter =>
      DETECTOR_VALUES.includes(v as DetectorFilter),
    ),
    onlyWithPan: params.get("pan") === "1",
    massMin: num("massMin"),
    massMax: num("massMax"),
  };

  const view: ViewMode = params.get("view") === "list" ? "list" : "map";
  const selectedCoinId = num("coin");
  const selectedLocationKey = params.get("loc") ?? undefined;

  return { filters, view, selectedCoinId, selectedLocationKey };
}

function serializeState(state: ExplorerState): string {
  const params = new URLSearchParams();
  const f = state.filters;

  if (f.search.trim()) params.set("q", f.search.trim());
  if (f.dateFrom !== undefined) params.set("from", String(f.dateFrom));
  if (f.dateTo !== undefined) params.set("to", String(f.dateTo));
  if (f.authorities.length) params.set("authority", f.authorities.join(","));
  if (f.provinces.length) params.set("province", f.provinces.join(","));
  if (f.municipalities.length) params.set("municipality", f.municipalities.join(","));
  if (f.mints.length) params.set("mint", f.mints.join(","));
  if (f.statuses.length) params.set("status", f.statuses.join(","));
  if (f.materials.length) params.set("material", f.materials.join(","));
  if (f.terrains.length) params.set("terrain", f.terrains.join(","));
  if (f.findCharacters.length) params.set("find", f.findCharacters.join(","));
  if (f.detectors.length) params.set("detector", f.detectors.join(","));
  if (f.onlyWithPan) params.set("pan", "1");
  if (f.massMin !== undefined) params.set("massMin", String(f.massMin));
  if (f.massMax !== undefined) params.set("massMax", String(f.massMax));
  if (state.view !== "map") params.set("view", state.view);
  if (state.selectedCoinId !== undefined) params.set("coin", String(state.selectedCoinId));
  if (state.selectedLocationKey) params.set("loc", state.selectedLocationKey);

  const s = params.toString();
  return s ? `?${s}` : window.location.pathname;
}

/**
 * useUrlExplorerState keeps the whole explorer state in the URL via the
 * History API. pushState is used for selections (back button closes the
 * drawer); replaceState for typing in the search box (no history spam).
 */
export function useUrlExplorerState(): {
  state: ExplorerState;
  update: (patch: Partial<ExplorerState>, mode?: "push" | "replace") => void;
} {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onChange = () => setSearch(window.location.search);
    window.addEventListener("popstate", onChange);
    window.addEventListener("limes:urlchange", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("limes:urlchange", onChange);
    };
  }, []);

  const state = parseStateFromUrl(search);

  const update = useCallback(
    (patch: Partial<ExplorerState>, mode: "push" | "replace" = "push") => {
      const next: ExplorerState = { ...parseStateFromUrl(window.location.search), ...patch };
      const url = serializeState(next);
      if (mode === "replace") {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
      // Notify listeners (this hook re-parses on popstate + custom event).
      window.dispatchEvent(new Event("limes:urlchange"));
    },
    [],
  );

  return { state, update };
}
