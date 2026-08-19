/**
 * Roman forts and roads of the lower-Rhine region, all from DARE — the
 * Digital Atlas of the Roman Empire (https://imperium.ahlfeldt.se,
 * J. Åhlfeldt, Univ. of Gothenburg), via the GeoJSON published at
 * github.com/klokantech/roman-empire.
 *
 * Forts — generated/dare-forts.json (scripts/import-dare.ts): the DARE
 * places of type camp / coastal station / legionary fortress / fort /
 * fortlet in the lower-Rhine region (lon 3.0–8.7, lat 50.5–53.8).
 *
 * Roads — generated/dare-roads.json: the precisely surveyed named routes
 * (roads_high, Mercator-e a.o.).
 */

import DARE_FORTS_JSON from "./generated/dare-forts.json";
import DARE_BUILDINGS_JSON from "./generated/dare-buildings.json";
import DARE_ROADS_GEOJSON from "./generated/dare-roads.json";
import FORT_OVERRIDES_JSON from "./generated/fort-overrides.json";
import FARMS_JSON from "./generated/farms.json";

type LngLat = [number, number];

interface Site {
  key: string;
  name: string;
  modern: string;
  coord: LngLat;
  secure: boolean;
  description: string;
}

interface DareLink {
  label: string;
  url: string;
}

interface DareFort extends Site {
  /** Dutch label for the DARE place type (fort, legioensvesting, …). */
  type: string;
  dareId: string;
  /** DARE date range (mindate/maxdate); 0/0 = unknown. */
  startYear: number;
  endYear: number;
  links: DareLink[];
}

/** "-30..300" → "ca. 30 v.Chr. – 300 n.Chr."; 0/0 (unknown) → "". */
function formatDareDates(start: number, end: number): string {
  if (!start && !end) return "";
  const fmt = (y: number) => (y < 0 ? `${Math.abs(y)} v.Chr.` : `${y} n.Chr.`);
  if (start === end || !end) return fmt(start);
  if (!start) return fmt(end);
  return `ca. ${fmt(start)} – ${fmt(end)}`;
}

function dareDescription(f: DareFort): string {
  const parts = [
    `${f.type.charAt(0).toUpperCase()}${f.type.slice(1)} volgens de Digital Atlas ` +
      `of the Roman Empire (DARE).`,
  ];
  const dates = formatDareDates(f.startYear, f.endYear);
  if (dates) parts.push(`Datering: ${dates}.`);
  if (!f.secure) parts.push("De ligging is een benadering.");
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Own overrides: the user's spreadsheets are authoritative for the Dutch
// limes forts (fort-overrides.json) and add the farmsteads (farms.json).
// ---------------------------------------------------------------------------

interface FortOverride {
  key: string;
  name: string;
  coord: LngLat;
  secure: boolean;
  note: string;
  startYear: number;
  endYear: number;
}

interface Farm {
  key: string;
  name: string;
  coord: LngLat;
  secure: boolean;
  kind: "vicus" | "stad";
  startYear: number;
  endYear: number;
}

/** Rough km distance on an equirectangular projection — fine below ~100 km. */
function distanceKm(a: LngLat, b: LngLat): number {
  const dx = (a[0] - b[0]) * Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180)) * 111.32;
  const dy = (a[1] - b[1]) * 110.95;
  return Math.hypot(dx, dy);
}

/** Normalise a place name for matching: lowercase, no diacritics/punctuation. */
function normName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Override ↔ DARE match: same normalised name, or within 3 km. */
const OVERRIDE_MATCH_KM = 3;

interface RichSite extends Site {
  startYear: number;
  endYear: number;
}

function overrideMatches(o: FortOverride, f: DareFort): boolean {
  const on = normName(o.name);
  if (normName(f.name).includes(on) || on.includes(normName(f.name))) return true;
  if (normName(f.modern).includes(on) || on.includes(normName(f.modern))) return true;
  return distanceKm(o.coord, f.coord) < OVERRIDE_MATCH_KM;
}

function overrideDescription(o: FortOverride): string {
  const parts = ["Fort — positie en datering uit eigen onderzoek (limes-lijst)."];
  const dates = formatDareDates(o.startYear, o.endYear);
  if (dates) parts.push(`In gebruik: ${dates}.`);
  if (o.note) parts.push(`${o.note.charAt(0).toUpperCase()}${o.note.slice(1)}.`);
  return parts.join(" ");
}

const FORT_OVERRIDES = FORT_OVERRIDES_JSON as FortOverride[];

/** DARE forts, with the user's own fort positions swapped in by name/proximity. */
function mergeForts(): RichSite[] {
  const matched = new Set<FortOverride>();
  const sites: RichSite[] = (DARE_FORTS_JSON as DareFort[]).map((f) => {
    const o = FORT_OVERRIDES.find((ov) => !matched.has(ov) && overrideMatches(ov, f));
    if (!o) {
      return {
        key: f.key,
        name: f.name,
        modern: f.modern,
        coord: f.coord,
        secure: f.secure,
        description: dareDescription(f),
        startYear: f.startYear,
        endYear: f.endYear,
      };
    }
    matched.add(o);
    return {
      key: f.key, // keep the DARE key so links keep working
      name: o.name,
      modern: f.modern,
      coord: o.coord,
      secure: o.secure,
      description: overrideDescription(o),
      startYear: o.startYear,
      endYear: o.endYear,
    };
  });
  // Overrides without a DARE counterpart are added as new sites.
  for (const o of FORT_OVERRIDES) {
    if (matched.has(o)) continue;
    sites.push({
      key: o.key,
      name: o.name,
      modern: "",
      coord: o.coord,
      secure: o.secure,
      description: overrideDescription(o),
      startYear: o.startYear,
      endYear: o.endYear,
    });
  }
  return sites;
}

const SITES: RichSite[] = mergeForts();

const FARMS: Farm[] = FARMS_JSON as Farm[];

function farmDescription(f: Farm): string {
  const label = f.kind === "stad" ? "Stad (civitas-hoofdplaats)" : "Vicus / boerderijgebied";
  const parts = [`${label} — eigen onderzoek.`];
  const dates = formatDareDates(f.startYear, f.endYear);
  if (dates) parts.push(`Datering: ${dates}.`);
  return parts.join(" ");
}

const BUILDINGS: RichSite[] = (DARE_BUILDINGS_JSON as DareFort[]).map((f) => ({
  key: f.key,
  name: f.name,
  modern: f.modern,
  coord: f.coord,
  secure: f.secure,
  description: dareDescription(f),
  startYear: f.startYear,
  endYear: f.endYear,
}));

/** External references per fort key, for the site popup. */
const LINKS_BY_KEY = new Map<string, DareLink[]>(
  (DARE_FORTS_JSON as DareFort[]).map((f) => [f.key, f.links]),
);
for (const f of DARE_BUILDINGS_JSON as DareFort[]) LINKS_BY_KEY.set(f.key, f.links);

/** DARE date range per fort key (0/0 = unknown). */
const DATES_BY_KEY = new Map<string, { start: number; end: number }>();
for (const s of [...SITES, ...BUILDINGS]) DATES_BY_KEY.set(s.key, { start: s.startYear, end: s.endYear });

/**
 * DARE road geometries. Properties per feature: `name` (string | null),
 * `major` (1 = main/named route), `approximate` (1 = course not certainly
 * known — rendered fainter).
 */
export const ROMAN_ROADS_GEOJSON: GeoJSON.FeatureCollection =
  DARE_ROADS_GEOJSON as GeoJSON.FeatureCollection;

/** All fort points as {key, lon, lat} — for client-side proximity checks. */
export const SITE_POINTS: { key: string; lon: number; lat: number }[] = SITES.map((s) => ({
  key: s.key,
  lon: s.coord[0],
  lat: s.coord[1],
}));

/** Civilian building points — separate layer, same filter behaviour. */
export const BUILDING_POINTS: { key: string; lon: number; lat: number }[] = BUILDINGS.map((s) => ({
  key: s.key,
  lon: s.coord[0],
  lat: s.coord[1],
}));

/** Farmstead points (user's vici/stad) — separate layer with farm icon. */
export const FARM_POINTS: { key: string; lon: number; lat: number }[] = FARMS.map((s) => ({
  key: s.key,
  lon: s.coord[0],
  lat: s.coord[1],
}));

function siteFeatures(sites: { key: string; name: string; modern: string; coord: LngLat; secure: boolean; description: string }[]): GeoJSON.Feature[] {
  return sites.map((s) => {
    const dates = DATES_BY_KEY.get(s.key) ?? { start: 0, end: 0 };
    return {
      type: "Feature" as const,
      properties: {
        key: s.key,
        name: s.name,
        modern: s.modern,
        secure: s.secure ? 1 : 0,
        description: s.description ?? "",
        links: JSON.stringify(LINKS_BY_KEY.get(s.key) ?? []),
        // DARE use dates; 0 = unknown. The date filter keeps unknowns visible
        // (see RomanRoadLayers.setRomanSitesFilter).
        startYear: dates.start,
        endYear: dates.end,
      },
      geometry: { type: "Point" as const, coordinates: s.coord },
    };
  });
}

export const ROMAN_SITES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: siteFeatures(SITES),
};

export const ROMAN_BUILDINGS_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: siteFeatures(BUILDINGS),
};

// Farms carry their own dates (not in DATES_BY_KEY).
export const ROMAN_FARMS_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: FARMS.map((f) => ({
    type: "Feature" as const,
    properties: {
      key: f.key,
      name: f.name,
      modern: "",
      secure: f.secure ? 1 : 0,
      description: farmDescription(f),
      links: "[]",
      startYear: f.startYear,
      endYear: f.endYear,
    },
    geometry: { type: "Point" as const, coordinates: f.coord },
  })),
};
