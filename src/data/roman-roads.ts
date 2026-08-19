/**
 * Roman forts of the Netherlands, imported from the user's spreadsheet
 * (romeinse_forten_nederland.xlsx) via scripts/import-forts.ts into
 * generated/roman-sites.json. This is the single source of truth — the old
 * hand-maintained SITES table is gone.
 *
 * The road network below is a schematic reconstruction connecting the known
 * Dutch limes forts along the Rhine/Waal and the coastal/Meuse positions.
 * Segments follow the general limes route, not surveyed archaeology.
 */

import SITES_JSON from "./generated/roman-sites.json";

type LngLat = [number, number];

interface Site {
  key: string;
  name: string;
  modern: string;
  coord: LngLat;
  secure: boolean;
  description: string;
}

const SITES: Record<string, Site> = Object.fromEntries(
  (SITES_JSON as Site[]).map((s) => [s.key, s]),
);

/**
 * Schematic road topology over the imported forts. Each entry is one route as
 * an ordered chain of site keys. Routes only reference keys present in the
 * generated data; unknown keys are dropped with a console warning at build
 * time so a renamed fort never silently breaks a road.
 */
const ROADS: string[][] = [
  // Main limes road along the Rhine, west → east:
  // Katwijk → Valkenburg → Leiden → Alphen → Zwammerdam → Woerden → De Meern →
  // Utrecht → Vechten → Wijk bij Duurstede → Maurik → Kesteren → Randwijk →
  // Driel → Arnhem-Meinerswijk → Duiven → Herwen
  [
    "lugdunum",
    "praetorium-agrippinae",
    "valkenburg-de-woerd-legioenskamp",
    "matilo",
    "albaniana",
    "nigrum-pullum",
    "laurium-laurum",
    "fletio",
    "traiectum",
    "fectio",
    "levefanum",
    "mannaricium",
    "carvo",
    "randwijk",
    "driel",
    "levefanum-castra-herculis",
    "duiven-loowaard",
    "carvium",
  ],
  // Coastal / western positions
  ["den-haag-ockenburgh", "naaldwijk"],
  ["h-elinio", "naaldwijk"],
  // Flevum (Velsen) — northern coastal fort, links toward the limes mouth
  ["flevum", "lugdunum"],
  // Waal corridor and Nijmegen hub
  ["levefanum", "grinnes", "oppidum-batavorum-military-occupation"],
  ["oppidum-batavorum-military-occupation", "noviomagus-military-camps-legio-x-castra", "nijmegen-kops-plateau"],
  ["oppidum-batavorum-military-occupation", "ceuclum"],
  // Maas / southern positions
  ["ceuclum", "aardenburg"],
  ["westenschouwen-roompot", "aardenburg"],
  // Inland
  ["levefanum-castra-herculis", "ermelo-ermelosche-heide"],
];

function resolveRoutes(): { route: Site[]; approximate: boolean }[] {
  const out: { route: Site[]; approximate: boolean }[] = [];
  for (const keys of ROADS) {
    const route = keys
      .map((k) => {
        const s = SITES[k];
        if (!s) console.warn(`[roman-roads] unknown site key dropped from a road: "${k}"`);
        return s;
      })
      .filter((s): s is Site => Boolean(s));
    if (route.length < 2) continue;
    out.push({ route, approximate: route.some((s) => !s.secure) });
  }
  return out;
}

export const ROMAN_ROADS_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: resolveRoutes().map(({ route, approximate }) => ({
    type: "Feature" as const,
    properties: { approximate },
    geometry: {
      type: "LineString" as const,
      coordinates: route.map((s) => s.coord),
    },
  })),
};

export const ROMAN_SITES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: (SITES_JSON as Site[]).map((s) => ({
    type: "Feature" as const,
    properties: {
      name: s.name,
      modern: s.modern,
      secure: s.secure ? 1 : 0,
      description: s.description ?? "",
    },
    geometry: { type: "Point" as const, coordinates: s.coord },
  })),
};
