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
import DARE_ROADS_GEOJSON from "./generated/dare-roads.json";

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

const SITES: Site[] = (DARE_FORTS_JSON as DareFort[]).map((f) => ({
  key: f.key,
  name: f.name,
  modern: f.modern,
  coord: f.coord,
  secure: f.secure,
  description: dareDescription(f),
}));

/** External references per fort key, for the site popup. */
const LINKS_BY_KEY = new Map<string, DareLink[]>(
  (DARE_FORTS_JSON as DareFort[]).map((f) => [f.key, f.links]),
);

/**
 * DARE road geometries. Properties per feature: `name` (string | null),
 * `major` (1 = main/named route), `approximate` (1 = course not certainly
 * known — rendered fainter).
 */
export const ROMAN_ROADS_GEOJSON: GeoJSON.FeatureCollection =
  DARE_ROADS_GEOJSON as GeoJSON.FeatureCollection;

export const ROMAN_SITES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: SITES.map((s) => ({
    type: "Feature" as const,
    properties: {
      name: s.name,
      modern: s.modern,
      secure: s.secure ? 1 : 0,
      description: s.description ?? "",
      links: JSON.stringify(LINKS_BY_KEY.get(s.key) ?? []),
    },
    geometry: { type: "Point" as const, coordinates: s.coord },
  })),
};
