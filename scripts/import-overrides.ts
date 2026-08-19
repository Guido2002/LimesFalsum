/**
 * Import the user's own coordinate spreadsheets, which OVERRIDE the DARE data
 * for the Dutch limes forts and add the farmstead (boerderijen) layer:
 *
 *   - "Coordinaten forten-2.xlsx" → generated/fort-overrides.json
 *     The 14 authoritative Dutch fort positions (Amersfoort / RD New,
 *     EPSG:28992), with use periods in three "Vanaf/Tot" column pairs
 *     (contiguous phases). Matching to DARE forts happens in
 *     src/data/roman-roads.ts by name + proximity.
 *
 *   - "Coordinaten vici.xlsx" → generated/farms.json
 *     The user's own vici/stad points, rendered with the farmstead icon.
 *
 * Run with: npm run data:overrides
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import proj4 from "proj4";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src", "data", "generated");

// Amersfoort / RD New — identical definition to src/lib/coordinates.ts.
proj4.defs(
  "EPSG:28992",
  "+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,1.9342,-1.6677,9.1019,4.0725 +units=m +no_defs +type=crs",
);

function rdToWgs84(rdX: number, rdY: number): [number, number] {
  const [lon, lat] = proj4("EPSG:28992", "EPSG:4326", [rdX, rdY]);
  return [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5];
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Forten — one row each; use periods are the non-empty "Vanaf/Tot" pairs.
// Notes in brackets (e.g. "(locatie niet geheel duidelijk)") are kept as the
// popup note, and make the point insecure.
// ---------------------------------------------------------------------------

interface FortOverride {
  key: string;
  name: string;
  coord: [number, number];
  /** false when the source flags the location as not entirely clear. */
  secure: boolean;
  note: string;
  startYear: number;
  endYear: number;
}

function importFortOverrides(): FortOverride[] {
  const wb = XLSX.readFile(join(ROOT, "Coordinaten forten-2.xlsx"));
  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });

  const out: FortOverride[] = [];
  for (const row of rows.slice(1)) {
    const rawName = String(row[0] ?? "").trim();
    const rdX = Number(row[1]);
    const rdY = Number(row[2]);
    if (!rawName || !rdX || !rdY) continue;

    // Split "Levefanum (locatie niet geheel duidelijk)" → name + note.
    const noteMatch = rawName.match(/\(([^)]+)\)\s*$/);
    const note = noteMatch ? noteMatch[1].trim() : "";
    const name = rawName.replace(/\s*\([^)]+\)\s*$/, "").trim();

    // Periods: columns 3/4, 5/6, 7/8 (each pair Vanaf/Tot).
    const periods: [number, number][] = [];
    for (let c = 3; c <= 7; c += 2) {
      const from = Number(row[c]);
      const to = Number(row[c + 1]);
      if (from && to) periods.push([from, to]);
    }
    const startYear = periods.length ? Math.min(...periods.map((p) => p[0])) : 0;
    const endYear = periods.length ? Math.max(...periods.map((p) => p[1])) : 0;

    out.push({
      key: slugify(name),
      name,
      coord: rdToWgs84(rdX, rdY),
      secure: note === "",
      note,
      startYear,
      endYear,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Vici / stad → boerderijen. The sheet has a "Vicus" block and, after empty
// rows, a "Stad" block. Single "Vanaf" without "Tot" = only the start is
// known; we treat those as running to the end of the Roman period (400).
// ---------------------------------------------------------------------------

interface Farm {
  key: string;
  name: string;
  coord: [number, number];
  secure: boolean;
  kind: "vicus" | "stad";
  startYear: number;
  endYear: number;
}

function importFarms(): Farm[] {
  const wb = XLSX.readFile(join(ROOT, "Coordinaten vici.xlsx"));
  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });

  const out: Farm[] = [];
  let kind: "vicus" | "stad" = "vicus";
  for (const row of rows.slice(1)) {
    const c0 = String(row[0] ?? "").trim();
    if (!c0) continue;
    if (c0.toLowerCase() === "stad") {
      kind = "stad";
      continue;
    }
    const rdX = Number(row[1]);
    const rdY = Number(row[2]);
    if (!rdX || !rdY) continue;

    const from = Number(row[3]) || 0;
    const to = Number(row[4]) || 0;
    out.push({
      key: slugify(c0),
      name: c0,
      coord: rdToWgs84(rdX, rdY),
      secure: true,
      kind,
      startYear: from,
      // No end recorded → in use until the end of Roman rule here (~400).
      endYear: to || (from ? 400 : 0),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const forts = importFortOverrides();
  const farms = importFarms();
  writeFileSync(join(OUT_DIR, "fort-overrides.json"), JSON.stringify(forts, null, 2));
  writeFileSync(join(OUT_DIR, "farms.json"), JSON.stringify(farms, null, 2));
  console.log(`fort-overrides.json: ${forts.length} forten`);
  console.log(`farms.json: ${farms.length} boerderijen/vici/steden`);
  for (const f of forts) console.log(`  fort: ${f.name} ${f.startYear}-${f.endYear}${f.secure ? "" : ` (${f.note})`}`);
  for (const f of farms) console.log(`  ${f.kind}: ${f.name} ${f.startYear || "?"}-${f.endYear || "?"}`);
}

main();
