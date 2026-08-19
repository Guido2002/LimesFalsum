/**
 * Import the user's Excel of Roman forts (romeinse_forten_nederland.xlsx) into
 * the generated sites dataset used by the Roman-roads overlay.
 *
 * This REPLACES the hand-maintained SITES table: the spreadsheet is richer and
 * more authoritative (WGS84, accuracy class, archaeological status, notes).
 *
 * Output: src/data/generated/roman-sites.json (imported by roman-roads.ts).
 *
 * Run with: npm run data:forts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const XLSX_PATH = join(ROOT, "romeinse_forten_nederland.xlsx");
const OUT_DIR = join(ROOT, "src", "data", "generated");
const OUT_PATH = join(OUT_DIR, "roman-sites.json");

// Columns in the Forten_Nederland sheet (header row is index 2).
const COL = {
  id: 0,
  modern: 2,
  name: 3,
  lat: 7,
  lon: 8,
  accuracy: 10,
  status: 11,
  notes: 15,
} as const;

/** A coordinate the source flags as unreliable gets `secure: 0`. */
function isSecure(accuracy: string, status: string): boolean {
  const a = accuracy.toLowerCase();
  const s = status.toLowerCase();
  if (a.includes("unknown") || a.includes("uncertain") || a.includes("coarse")) return false;
  if (s.includes("lost") || s.includes("presumed") || s.includes("disputed") || s.includes("hypothesis"))
    return false;
  return true;
}

interface Site {
  key: string;
  name: string;
  modern: string;
  coord: [number, number]; // [lon, lat]
  secure: boolean;
  description: string;
}

/**
 * The spreadsheet notes are in English; the app is Dutch. Translate the known
 * notes to Dutch. Notes are matched exactly (trimmed) — anything unmapped is
 * kept as-is so nothing is silently dropped, and logged for review.
 */
const NOTE_NL: Record<string, string> = {
  "Position remains disputed; no definitive archaeological fort position.":
    "De ligging blijft betwist; er is geen definitief archeologisch vastgestelde fortpositie.",
  "Component point is not automatically the fort centroid.":
    "Het componentpunt is niet automatisch het middelpunt van het opgegraven fort.",
  "Additional military site beyond the older 28-site reference list.":
    "Aanvullende militaire vindplaats, buiten de oudere referentielijst van 28 forten.",
  "Park Matilo reference point.": "Referentiepunt in Park Matilo.",
  "Province explicitly says exact location is unknown; no point invented.":
    "De provincie vermeldt dat de exacte ligging onbekend is; er is bewust geen punt aangemaakt.",
  "Province explicitly says exact location is unknown; added beyond older reference list.":
    "De provincie vermeldt dat de exacte ligging onbekend is; toegevoegd buiten de oudere referentielijst.",
  "Fletio identification is not definitive.":
    "De identificatie als Fletio is niet definitief.",
  "Traditional Levefanum identification; newer interpretations also place Levefanum at Meinerswijk.":
    "Traditionele identificatie als Levefanum; nieuwere interpretaties plaatsen Levefanum ook bij Meinerswijk.",
  "No concrete castellum remains found; traditional Carvo identification is debated.":
    "Geen concrete castellumresten gevonden; de traditionele identificatie als Carvo is omstreden.",
  "No archaeological proof at this point; recent work shifts the 'Randwijk' hypothesis toward Heteren-Steenoord.":
    "Geen archeologisch bewijs op dit punt; recent werk verschuift de 'Randwijk'-hypothese richting Heteren-Steenoord.",
  "Ancient-name identification is debated.":
    "De identificatie van de antieke naam wordt betwist.",
  "Fort area was destroyed/washed away by the Rhine.":
    "Het fortgebied is door de Rijn verwoest of weggespoeld.",
  "Do not use this coordinate as an excavation centroid.":
    "Gebruik deze coördinaat niet als opgravings-centroid.",
  "Early and late Roman fort phases.":
    "Vroege en late Romeinse fortfasen.",
  "Older fort lists use Trajanusplein; current UNESCO terminology is Valkhof area.":
    "Oudere fortlijsten gebruiken Trajanusplein; de huidige UNESCO-terminologie is Valkhof-gebied.",
  "Roman finds fit Grinnes, but no castellum has been archaeologically demonstrated.":
    "Romeinse vondsten passen bij Grinnes, maar een castellum is archeologisch niet aangetoond.",
  "The presumed site lies in today's Brielsc Meer; exact position remains uncertain.":
    "De vermoedelijke locatie ligt in het huidige Brielse Meer; de exacte positie blijft onzeker.",
  "The presumed site lies in today's Brielse Meer; exact position remains uncertain.":
    "De vermoedelijke locatie ligt in het huidige Brielse Meer; de exacte positie blijft onzeker.",
  "Historical ruins were observed offshore; no defensible exact point inserted.":
    "Historische ruïnes zijn in zee waargenomen; er is bewust geen verdedigbaar exact punt ingevoerd.",
  "Older lists call this Walcheren-De Roompot; published reconstruction places it off Schouwen-Duiveland.":
    "Oudere lijsten noemen dit Walcheren-De Roompot; een gepubliceerde reconstructie plaatst het voor Schouwen-Duiveland.",
  "Interpretation debated: castellum versus fortified town.":
    "Interpretatie omstreden: castellum of versterkte stad.",
  "Large Augustan camp and later legionary fortress.":
    "Groot Augusteïsch kamp en later legioensfort.",
  "Separated from Hunerberg although older lists group them.":
    "Gescheiden van de Hunerberg, hoewel oudere lijsten ze samenvoegen.",
  "Confirmed marching camp, not a permanent limes castellum.":
    "Bevestigd marskamp, geen permanent limes-castellum.",
  "Added beyond older reference list; broad coordinate, not excavation centroid.":
    "Toegevoegd buiten de oudere referentielijst; ruwe coördinaat, geen opgravings-centroid.",
  "Classis Germanica presence is strongly indicated; exact base position remains unknown.":
    "De aanwezigheid van de Classis Germanica wordt sterk vermoed; de exacte ligging van de basis is onbekend.",
};

function toDutchNote(note: string, id: string): string {
  if (!note) return "";
  const nl = NOTE_NL[note];
  if (!nl) console.warn(`[import-forts] untranslated note on ${id}: ${note}`);
  return nl ?? note;
}

function slugify(text: string, fallback: string): string {
  const s = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || fallback;
}

const wb = XLSX.readFile(XLSX_PATH);
const ws = wb.Sheets["Forten_Nederland"];
const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });

const sites: Site[] = [];
const seenKeys = new Set<string>();
let skippedNoCoord = 0;

for (const r of rows.slice(3)) {
  const id = String(r[COL.id] ?? "").trim();
  if (!id) continue;
  const lat = Number(r[COL.lat]);
  const lon = Number(r[COL.lon]);
  const modern = String(r[COL.modern] ?? "").trim();
  const rawName = String(r[COL.name] ?? "").trim();
  const accuracy = String(r[COL.accuracy] ?? "").trim();
  const status = String(r[COL.status] ?? "").trim();
  const notes = String(r[COL.notes] ?? "").trim();

  // Skip rows without a defensible coordinate — never invent precision.
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) {
    skippedNoCoord++;
    continue;
  }

  // Display name: the Latin/Roman name when present (strip a trailing "(?)"),
  // else the modern Dutch place name as fallback.
  const name = rawName ? rawName.replace(/\s*\(\?\)\s*$/, "") : modern;
  // Dedupe keys when several records share a modern place (e.g. Nijmegen).
  let key = slugify(rawName || modern, id.toLowerCase());
  if (seenKeys.has(key)) key = `${key}-${id.toLowerCase().replace(/^nl-rf-/, "")}`;
  seenKeys.add(key);

  sites.push({
    key,
    name,
    modern,
    coord: [lon, lat],
    secure: isSecure(accuracy, status),
    description: toDutchNote(notes, id),
  });
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(sites, null, 2) + "\n", "utf8");

console.log(`✔ Wrote ${sites.length} sites to ${OUT_PATH}`);
console.log(`  Skipped ${skippedNoCoord} records without a defensible coordinate.`);
console.log(`  Secure: ${sites.filter((s) => s.secure).length}, uncertain: ${sites.filter((s) => !s.secure).length}`);
