/**
 * LimesFalsum — NUMIS data import pipeline.
 *
 * Reads the Excel workbook once at build time and writes application-ready
 * JSON + GeoJSON into src/data/generated/. The browser never parses XLSX.
 *
 * Run with: npm run data:build
 */
import * as fs from "node:fs";
import * as path from "node:path";
import XLSX from "xlsx";
import type { CoinRecord, DataQualityFlag, DatasetSummary } from "../src/domain/coin";
import { rdToWgs84, isPlausibleDutchCoordinate } from "../src/lib/coordinates";
import { parseDating } from "../src/lib/dates";
import {
  authorityIsUncertain,
  cleanText,
  foldSearchText,
  mintIsUncertain,
  normalizeAuthority,
  normalizeDetector,
  normalizeMaterial,
  normalizeMint,
  normalizeStatus,
  normalizeTerrain,
} from "../src/lib/normalize";
import { locationKey } from "../src/lib/grouping";

const EXCEL_PATH = path.resolve("data.xlsx");
const OUT_DIR = path.resolve("src/data/generated");

/** Exact column names as they appear in the workbook header row. */
const COL = {
  numisId: "F 3007 NUMIS nummer",
  panId: "F 3012 PAN nummer",
  diameterMm: "F 1401 diameter of horizontaal formaat",
  province: "F 3102 provincie",
  municipality: "F 3103 gemeente",
  findDateRaw: "F 3001 datum vondst",
  findName: "F 3006 vondstnaam",
  catalogue: "F 1601 catalogi",
  findCharacter: "F 3203 karakter vondst",
  findNumber: "F 3005 nr in vondst",
  politicalState: "F 1004 politieke staat",
  authorityRaw: "F 1005 autoriteit of opdrachtgever",
  statusRaw: "F 1503 status of functie",
  objectRaw: "F 1006 voorwerp",
  materialRaw: "F 1406 materiaal",
  mintRaw: "F 1204 productieplaats",
  datingRaw: "F 1101 datering",
  massGram: "F 1404 massa",
  excavationContext: "F 3202 welk werk",
  notes: "F 5001 opmerkingen",
  rdX: "F 3110 horizontale coördinaat",
  rdY: "F 3111 verticale coördinaat",
  treatment: "F 1314 bewerking",
  inventoryNumber: "F 2003 inventarisnummer",
  terrainRaw: "F 3201 soort terrein",
  metalDetectorRaw: "F 3204 metaaldetector",
} as const;

type RawRow = Record<string, unknown>;

function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return cleanText(String(value));
}

function fail(message: string): never {
  console.error(`\n✗ Import failed: ${message}`);
  process.exit(1);
}

function buildSearchText(c: Omit<CoinRecord, "searchText">): string {
  return foldSearchText(
    [
      String(c.numisId),
      c.panId,
      c.municipality,
      c.province,
      c.authorityRaw,
      ...c.authorityNormalized,
      c.mintRaw,
      c.mintNormalized,
      c.catalogue,
      c.findName,
      c.inventoryNumber,
      c.objectRaw,
      c.datingRaw,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function main(): void {
  if (!fs.existsSync(EXCEL_PATH)) {
    fail(`Excel workbook not found at ${EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null });

  if (rows.length === 0) fail("Workbook contains no data rows");

  // Validate that all required columns exist before touching data.
  const header = new Set(Object.keys(rows[0]));
  const missing = Object.values(COL).filter((name) => !header.has(name));
  if (missing.length > 0) {
    fail(`Missing required columns:\n  - ${missing.join("\n  - ")}`);
  }

  const warnings: string[] = [];
  const coins: CoinRecord[] = [];

  for (const [index, row] of rows.entries()) {
    const rowLabel = `row ${index + 2}`;

    // Critical fields — fail the import if unusable.
    const numisId = asNumber(row[COL.numisId]);
    if (numisId === undefined) fail(`${rowLabel}: missing/invalid NUMIS nummer`);
    const rdX = asNumber(row[COL.rdX]);
    const rdY = asNumber(row[COL.rdY]);
    if (rdX === undefined || rdY === undefined) {
      fail(`${rowLabel} (NUMIS ${numisId}): missing RD coordinates`);
    }

    const wgs84 = rdToWgs84(rdX, rdY);
    const flags: DataQualityFlag[] = [];

    // Known anomaly: NUMIS 1163154 (Katwijk) has RD X = 8759, far from the
    // ~88,500–91,700 of the other Katwijk records. Flag, do not "fix".
    // Detection is municipality-relative and deliberately conservative: only
    // flag extreme deviations (a likely missing digit), not genuinely
    // dispersed findspots within a municipality.
    const sameMunicipality = rows
      .map((r) => ({ m: asString(r[COL.municipality]), x: asNumber(r[COL.rdX]), id: asNumber(r[COL.numisId]) }))
      .filter((r) => r.m === asString(row[COL.municipality]) && r.x !== undefined && r.id !== numisId);
    const xs = sameMunicipality.map((r) => r.x as number);
    const isOutlier =
      !isPlausibleDutchCoordinate(wgs84) ||
      (xs.length >= 2 && (rdX < Math.min(...xs) - 30000 || rdX > Math.max(...xs) + 30000));
    if (isOutlier) {
      flags.push("coordinate-outlier");
      warnings.push(`coordinate outlier: NUMIS ${numisId} (RD ${rdX}, ${rdY})`);
    }

    const massGram = asNumber(row[COL.massGram]);
    // A denarius never weighs 0 g; treat <= 0 as unknown, keep raw value.
    const hasKnownMass = massGram !== undefined && massGram > 0;
    if (massGram !== undefined && massGram <= 0) flags.push("unknown-mass");

    const datingRaw = asString(row[COL.datingRaw]) ?? "";
    const dating = parseDating(datingRaw);
    if (dating.uncertain) flags.push("uncertain-date");

    const authorityRaw = asString(row[COL.authorityRaw]) ?? "";
    if (authorityIsUncertain(authorityRaw)) flags.push("uncertain-authority");
    if (mintIsUncertain(asString(row[COL.mintRaw]))) flags.push("uncertain-mint");

    const base: Omit<CoinRecord, "searchText"> = {
      numisId,
      panId: asString(row[COL.panId]),
      diameterMm: asNumber(row[COL.diameterMm]),
      province: asString(row[COL.province]) ?? "Onbekend",
      municipality: asString(row[COL.municipality]) ?? "Onbekend",
      findDateRaw: asString(row[COL.findDateRaw]),
      findName: asString(row[COL.findName]),
      catalogue: asString(row[COL.catalogue]),
      findCharacter: asString(row[COL.findCharacter]),
      findNumber: asString(row[COL.findNumber]),
      politicalState: asString(row[COL.politicalState]),
      authorityRaw,
      statusRaw: asString(row[COL.statusRaw]) ?? "",
      objectRaw: asString(row[COL.objectRaw]) ?? "",
      materialRaw: asString(row[COL.materialRaw]) ?? "",
      mintRaw: asString(row[COL.mintRaw]),
      datingRaw,
      massGram,
      excavationContext: asString(row[COL.excavationContext]),
      notes: asString(row[COL.notes]),
      rdX,
      rdY,
      treatment: asString(row[COL.treatment]),
      inventoryNumber: asString(row[COL.inventoryNumber]),
      terrainRaw: asString(row[COL.terrainRaw]),
      metalDetectorRaw: asString(row[COL.metalDetectorRaw]),
      longitude: wgs84.longitude,
      latitude: wgs84.latitude,
      dateStart: dating.dateStart,
      dateEnd: dating.dateEnd,
      dateUncertain: dating.uncertain,
      authorityNormalized: normalizeAuthority(authorityRaw),
      mintNormalized: normalizeMint(asString(row[COL.mintRaw])),
      statusNormalized: normalizeStatus(asString(row[COL.statusRaw])),
      materialNormalized: normalizeMaterial(asString(row[COL.materialRaw])),
      terrainNormalized: normalizeTerrain(asString(row[COL.terrainRaw])),
      detectorUsed: normalizeDetector(asString(row[COL.metalDetectorRaw])),
      locationKey: locationKey(rdX, rdY),
      hasKnownMass,
      dataQualityFlags: flags,
    };

    coins.push({ ...base, searchText: buildSearchText(base) });
  }

  // Duplicate NUMIS IDs would break selection state — hard fail.
  const ids = new Set<number>();
  for (const coin of coins) {
    if (ids.has(coin.numisId)) fail(`Duplicate NUMIS id: ${coin.numisId}`);
    ids.add(coin.numisId);
  }

  const uniqueLocations = new Set(coins.map((c) => c.locationKey));
  const dates = coins.flatMap((c) =>
    c.dateStart !== undefined ? [c.dateStart, c.dateEnd ?? c.dateStart] : [],
  );

  const summary: DatasetSummary = {
    recordCount: coins.length,
    uniqueLocationCount: uniqueLocations.size,
    provinceCount: new Set(coins.map((c) => c.province)).size,
    municipalityCount: new Set(coins.map((c) => c.municipality)).size,
    missingPanCount: coins.filter((c) => !c.panId).length,
    recordsWithCatalogue: coins.filter((c) => c.catalogue).length,
    recordsWithMass: coins.filter((c) => c.hasKnownMass).length,
    recordsWithDiameter: coins.filter((c) => c.diameterMm !== undefined).length,
    recordsWithDetectorInfo: coins.filter((c) => c.detectorUsed !== undefined).length,
    looseFindCount: coins.filter((c) => c.findCharacter?.toLowerCase().includes("los")).length,
    hoardFindCount: coins.filter((c) => c.findCharacter?.toLowerCase().includes("schat")).length,
    unknownFindCharacterCount: coins.filter((c) => !c.findCharacter).length,
    dateMin: dates.length ? Math.min(...dates) : undefined,
    dateMax: dates.length ? Math.max(...dates) : undefined,
    authorities: [...new Set(coins.flatMap((c) => c.authorityNormalized))].sort(),
    provinces: [...new Set(coins.map((c) => c.province))].sort(),
    municipalities: [...new Set(coins.map((c) => c.municipality))].sort(),
    mints: [...new Set(coins.map((c) => c.mintNormalized).filter((v): v is string => !!v))].sort(),
    statuses: [...new Set(coins.map((c) => c.statusNormalized).filter((v): v is string => !!v))].sort(),
    materials: [
      ...new Set(coins.map((c) => c.materialNormalized).filter((v): v is string => !!v)),
    ].sort(),
    terrains: [...new Set(coins.map((c) => c.terrainNormalized).filter((v): v is string => !!v))].sort(),
    warnings,
    generatedAt: new Date().toISOString().slice(0, 10),
  };

  // GeoJSON for MapLibre. Coordinates must be [longitude, latitude].
  const geojson = {
    type: "FeatureCollection" as const,
    features: coins.map((c) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [c.longitude, c.latitude] },
      properties: {
        numisId: c.numisId,
        locationKey: c.locationKey,
        authority: c.authorityNormalized[0] ?? c.authorityRaw,
        dateStart: c.dateStart,
        dateEnd: c.dateEnd,
      },
    })),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "coins.json"), JSON.stringify(coins, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "coins.geojson"), JSON.stringify(geojson));
  fs.writeFileSync(path.join(OUT_DIR, "dataset-summary.json"), JSON.stringify(summary, null, 2));

  console.log("\nLimesFalsum dataset imported\n");
  console.log(`Records:                 ${summary.recordCount}`);
  console.log(`Unique locations:        ${summary.uniqueLocationCount}`);
  console.log(`Provinces:               ${summary.provinceCount}`);
  console.log(`Municipalities:          ${summary.municipalityCount}`);
  console.log(`Missing PAN IDs:         ${summary.missingPanCount}`);
  console.log(`Records with coordinates:${summary.recordCount}`);
  console.log(`Dating range:            ${summary.dateMin}–${summary.dateMax}`);
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`- ${w}`);
  }
  console.log(`\nOutput written to ${path.relative(process.cwd(), OUT_DIR)}/`);
}

main();
