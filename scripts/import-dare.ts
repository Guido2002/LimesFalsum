/**
 * Import Roman forts and roads from the Digital Atlas of the Roman Empire
 * (DARE, https://imperium.ahlfeldt.se, Johan Åhlfeldt, Univ. of Gothenburg),
 * as published in GeoJSON form by Klokan Technologies:
 * https://github.com/klokantech/roman-empire (data/*.geojson).
 *
 * Output (clipped to the lower-Rhine region, lon 3.0–8.7 / lat 50.5–53.8,
 * i.e. the Netherlands plus the German limes down to Bonn):
 *   - src/data/generated/dare-forts.json     — fort/camp points
 *   - src/data/generated/dare-buildings.json — civilian buildings (villa's,
 *     nederzettingen, tempels, bruggen, mijlpalen, …)
 *   - src/data/generated/dare-roads.json     — road lines with real geometry
 *     (roads_high, the surveyed named routes; GeoJSON content, .json
 *     extension so resolveJsonModule covers it)
 *
 * src/data/roman-roads.ts turns the forts into the site point layer shown on
 * the map.
 *
 * Run with: npm run data:dare
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src", "data", "generated");

const BASE = "https://raw.githubusercontent.com/klokantech/roman-empire/master/data";

/** Region of interest: [minLon, minLat, maxLon, maxLat]. */
const BBOX: [number, number, number, number] = [3.0, 50.5, 8.7, 53.8];

/**
 * DARE place-type codes used here (mapping from the klokantech style.json):
 * 15 = camp, 16 = coastal station, 17 = legionary fortress, 18 = fort,
 * 53 = fortlet.
 */
const FORT_TYPE_NL: Record<string, string> = {
  "15": "marskamp",
  "16": "kustversterking",
  "17": "legioensvesting",
  "18": "fort",
  "53": "klein fort (fortlet)",
};

/**
 * Civilian DARE place types (numeric codes from the bulk dump):
 * 13 civitas-hoofdplaats, 14 villa, 24 kerk, 32 tumulus, 34 kleine
 * nederzetting, 35 laat-Romeinse versterkte nederzetting, 43 stroomversnelling
 * (vaarweg), 46 aquaduct, 47 dam/sluis, 49 bergpas, 51 brug, 52 mijlpaal,
 * 57 mijn, 58 productieplaats, 61 heiligdom/tempel, 63 begraafplaats,
 * 66 badhuis, 76 vuurtoren.
 */
const BUILDING_TYPE_NL: Record<string, string> = {
  "13": "civitas-hoofdplaats",
  "14": "villa",
  "24": "kerk (laat-antiek)",
  "32": "grafheuvel (tumulus)",
  "34": "nederzetting",
  "35": "laat-Romeinse versterkte nederzetting",
  "43": "stroomversnelling (vaarweg)",
  "46": "aquaduct",
  "47": "dam / sluis",
  "49": "bergpas",
  "51": "brug",
  "52": "mijlpaal",
  "57": "mijn",
  "58": "productieplaats",
  "61": "heiligdom / tempel",
  "63": "begraafplaats",
  "66": "badhuis",
  "76": "vuurtoren",
};

// ---------------------------------------------------------------------------
// Mojibake repair: roads_high names were UTF-8 mis-decoded as CP1252
// (twice), e.g. "Köln" → "KÃƒÂ¶ln". Reverse it by re-encoding the chars as
// CP1252 bytes and decoding as UTF-8, repeating while it still looks mangled.
// ---------------------------------------------------------------------------

/** Reverse of the CP1252 high range (0x80–0x9F): unicode code point → byte. */
const CP1252_REVERSE: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

const MOJIBAKE_MARKER = /[ÃÂâð]/;

function asCp1252Bytes(s: string): Uint8Array | null {
  const bytes: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp <= 0xff) bytes.push(cp);
    else if (CP1252_REVERSE[cp] !== undefined) bytes.push(CP1252_REVERSE[cp]);
    else return null; // char can't be a CP1252 byte → not mojibake
  }
  return new Uint8Array(bytes);
}

function fixMojibake(s: string): string {
  let out = s;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  for (let i = 0; i < 3 && MOJIBAKE_MARKER.test(out); i++) {
    const bytes = asCp1252Bytes(out);
    if (!bytes) break;
    try {
      out = decoder.decode(bytes);
    } catch {
      break; // not valid UTF-8 when re-encoded → keep previous
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// GeoJSON helpers
// ---------------------------------------------------------------------------

type Position = number[];

interface GeoFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

function* positions(coords: unknown): Generator<Position> {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number") {
    yield coords as Position;
    return;
  }
  for (const c of coords) yield* positions(c);
}

function inBbox([lon, lat]: Position): boolean {
  return lon >= BBOX[0] && lon <= BBOX[2] && lat >= BBOX[1] && lat <= BBOX[3];
}

function intersectsBbox(feature: GeoFeature): boolean {
  for (const p of positions(feature.geometry.coordinates)) {
    if (inBbox(p)) return true;
  }
  return false;
}

/** Strip the Z dimension (roads_high is 3D) and round to ~1 m. */
function cleanCoords(coords: unknown): unknown {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === "number") {
    const [lon, lat] = coords as Position;
    return [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5];
  }
  return (coords as unknown[]).map(cleanCoords);
}

function slugify(s: string): string {
  return fixMojibake(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchGeoJson(name: string): Promise<{ features: GeoFeature[] }> {
  const res = await fetch(`${BASE}/${name}.geojson`);
  if (!res.ok) throw new Error(`Download ${name}.geojson failed: HTTP ${res.status}`);
  return (await res.json()) as { features: GeoFeature[] };
}

// ---------------------------------------------------------------------------
// Forts (DARE places, point features)
// ---------------------------------------------------------------------------

export interface DareLink {
  label: string;
  url: string;
}

export interface DareFort {
  key: string;
  name: string; // Latin name when known, else modern
  modern: string;
  coord: [number, number];
  /** DARE accuracy ≤ 200 m counts as securely located. */
  secure: boolean;
  /** Dutch label for the DARE place type. */
  type: string;
  dareId: string;
  /** DARE date range (mindate/maxdate); 0/0 = unknown. */
  startYear: number;
  endYear: number;
  /** External references parsed from the DARE tags field. */
  links: DareLink[];
}

async function importPlaces(typeMap: Record<string, string>): Promise<DareFort[]> {
  const places = new Map<string, DareFort>(); // dedupe by DARE id
  for (const file of ["places_low", "places_medium", "places_high"]) {
    const data = await fetchGeoJson(file);
    for (const f of data.features) {
      const p = f.properties as {
        id?: string;
        latin?: string;
        modern?: string;
        type?: string;
        accuracy?: number;
      };
      const typeNl = p.type ? typeMap[p.type] : undefined;
      if (!typeNl || !p.id || places.has(p.id)) continue;
      const [lon, lat] = cleanCoords(f.geometry.coordinates) as [number, number];
      if (!inBbox([lon, lat])) continue;
      const latin = fixMojibake((p.latin ?? "").trim());
      const modern = fixMojibake((p.modern ?? "").trim());
      const name = latin || modern;
      if (!name) continue;
      places.set(p.id, {
        key: slugify(name) || `dare-${p.id}`,
        name,
        modern,
        coord: [lon, lat],
        secure: (p.accuracy ?? 9999) <= 200,
        type: typeNl,
        dareId: p.id,
        startYear: 0,
        endYear: 0,
        links: [],
      });
    }
  }
  return [...places.values()].sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

function importForts(): Promise<DareFort[]> {
  return importPlaces(FORT_TYPE_NL);
}

function importBuildings(): Promise<DareFort[]> {
  return importPlaces(BUILDING_TYPE_NL);
}

// ---------------------------------------------------------------------------
// Place details: the DARE GeoJSON API gives per place the real place type,
// the date range and external references (tags) — richer than the bulk dump.
// https://imperium.ahlfeldt.se/api/geojson.php?id=<dareId>
// ---------------------------------------------------------------------------

/** DARE place-type strings the API returns, translated to Dutch. */
const PLACE_TYPE_NL: Record<string, string> = {
  fort: "fort",
  "major fort": "groot fort",
  "fortlet/tower": "klein fort / wachttoren",
  camp: "marskamp",
  fortress: "legioensvesting",
  station: "kustversterking",
  // civilian types (buildings layer)
  villa: "villa",
  settlement: "nederzetting",
  "minor settlement": "kleine nederzetting",
  "major settlement": "grote nederzetting",
  "civitas capital": "civitas-hoofdplaats",
  sanctuary: "heiligdom / tempel",
  temple: "tempel",
  bridge: "brug",
  milestone: "mijlpaal",
  mine: "mijn",
  production: "productieplaats",
  cemetery: "begraafplaats",
  bath: "badhuis",
  aqueduct: "aquaduct",
  lighthouse: "vuurtoren",
  tumulus: "grafheuvel (tumulus)",
  church: "kerk (laat-antiek)",
};

/** Turn a DARE tags string into labelled external links. */
function parseTags(tags: string | undefined, dareId: string): DareLink[] {
  const links: DareLink[] = [
    { label: "DARE", url: `https://imperium.ahlfeldt.se/places/${dareId}.html` },
  ];
  for (const tag of (tags ?? "").split(";")) {
    const eq = tag.indexOf("=");
    if (eq <= 0) continue;
    const key = tag.slice(0, eq).trim();
    const value = tag.slice(eq + 1).trim();
    if (!value) continue;
    if (key.startsWith("wikipedia:")) {
      links.push({
        label: `Wikipedia (${key.slice("wikipedia:".length)})`,
        url: `https://${key.slice("wikipedia:".length)}.wikipedia.org/wiki/${encodeURIComponent(value)}`,
      });
    } else if (key === "wikidata") {
      links.push({ label: "Wikidata", url: `https://www.wikidata.org/wiki/${encodeURIComponent(value)}` });
    } else if (key === "livius:place") {
      links.push({ label: "Livius.org", url: `https://www.livius.org/articles/place/${encodeURIComponent(value)}/` });
    } else if (key === "vici") {
      links.push({ label: "vici.org", url: `https://vici.org/vici/${encodeURIComponent(value)}` });
    }
  }
  return links;
}

interface DareDetailProps {
  name?: string;
  type?: string;
  precision?: number;
  mindate?: number;
  maxdate?: number;
  tags?: string;
}

async function fetchDetails(id: string): Promise<DareDetailProps | null> {
  try {
    const res = await fetch(`https://imperium.ahlfeldt.se/api/geojson.php?id=${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: { properties?: DareDetailProps }[] };
    return data.features?.[0]?.properties ?? null;
  } catch {
    return null;
  }
}

/** Fetch with limited parallelism to stay polite to the DARE server. */
async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

/** Enrich the forts with the DARE details API; failures keep the bulk values. */
async function enrichForts(forts: DareFort[]): Promise<void> {
  let done = 0;
  await mapPool(forts, 5, async (fort) => {
    const d = await fetchDetails(fort.dareId);
    done++;
    if (done % 10 === 0) console.log(`  details ${done}/${forts.length}`);
    if (!d) return;
    const typeNl = d.type ? PLACE_TYPE_NL[d.type.toLowerCase()] : undefined;
    if (typeNl) fort.type = typeNl;
    if (typeof d.precision === "number") fort.secure = d.precision <= 200;
    fort.startYear = d.mindate ?? 0;
    fort.endYear = d.maxdate ?? 0;
    fort.links = parseTags(d.tags, fort.dareId);
  });
}

// ---------------------------------------------------------------------------
// Roads (DARE)
// ---------------------------------------------------------------------------

async function importRoads(): Promise<GeoJSON.FeatureCollection> {
  const features: GeoJSON.Feature[] = [];

  // roads_high: precisely surveyed routes (Mercator-e / Voorburg a.o.),
  // with names. 3D coordinates; names are double-mojibake'd.
  const high = await fetchGeoJson("roads_high");
  for (const f of high.features) {
    if (!intersectsBbox(f)) continue;
    const p = f.properties as { Name?: string | null };
    const name = p.Name ? fixMojibake(p.Name.trim()) : null;
    features.push({
      type: "Feature",
      properties: { name, major: 1, approximate: 0 },
      geometry: {
        type: f.geometry.type,
        coordinates: cleanCoords(f.geometry.coordinates),
      } as GeoJSON.Geometry,
    });
  }

  return { type: "FeatureCollection", features };
}

// ---------------------------------------------------------------------------

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const forts = await importForts();
  console.log("Details ophalen per fort via de DARE API…");
  await enrichForts(forts);

  const buildings = await importBuildings();
  console.log("Details ophalen per gebouw via de DARE API…");
  await enrichForts(buildings);

  const roads = await importRoads();

  writeFileSync(join(OUT_DIR, "dare-forts.json"), JSON.stringify(forts, null, 2));
  writeFileSync(join(OUT_DIR, "dare-buildings.json"), JSON.stringify(buildings, null, 2));
  writeFileSync(join(OUT_DIR, "dare-roads.json"), JSON.stringify(roads));

  console.log(`dare-forts.json: ${forts.length} forten/kampen`);
  console.log(`dare-buildings.json: ${buildings.length} civiele vindplaatsen`);
  console.log(
    `dare-roads.json: ${roads.features.length} wegsegmenten ` +
      `(${roads.features.filter((f) => f.properties?.name).length} met naam)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
