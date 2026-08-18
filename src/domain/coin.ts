/**
 * Domain model for a single NUMIS coin record.
 *
 * The interface deliberately keeps two layers:
 * - the raw source values from the Excel workbook (suffixed `Raw` where a
 *   normalized variant also exists);
 * - derived application values (coordinates in WGS84, parsed dating,
 *   normalized facets) that are generated at build time.
 *
 * Never discard raw values: historical research data must stay transparent.
 */

export type DataQualityFlag =
  | "coordinate-outlier"
  | "unknown-mass"
  | "uncertain-date"
  | "uncertain-mint"
  | "uncertain-authority";

export interface CoinRecord {
  // --- Original NUMIS fields (mapped from the 26 Excel columns) ---
  /** F 3007 NUMIS nummer */
  numisId: number;
  /** F 3012 PAN nummer */
  panId?: string;
  /** F 1401 diameter of horizontaal formaat (mm) */
  diameterMm?: number;
  /** F 3102 provincie */
  province: string;
  /** F 3103 gemeente */
  municipality: string;
  /** F 3001 datum vondst */
  findDateRaw?: string;
  /** F 3006 vondstnaam */
  findName?: string;
  /** F 1601 catalogi */
  catalogue?: string;
  /** F 3203 karakter vondst */
  findCharacter?: string;
  /** F 3005 nr in vondst */
  findNumber?: string;
  /** F 1004 politieke staat */
  politicalState?: string;
  /** F 1005 autoriteit of opdrachtgever */
  authorityRaw: string;
  /** F 1503 status of functie */
  statusRaw: string;
  /** F 1006 voorwerp */
  objectRaw: string;
  /** F 1406 materiaal */
  materialRaw: string;
  /** F 1204 productieplaats */
  mintRaw?: string;
  /** F 1101 datering */
  datingRaw: string;
  /** F 1404 massa (gram). May be 0 in the source — treat as unknown. */
  massGram?: number;
  /** F 3202 welk werk */
  excavationContext?: string;
  /** F 5001 opmerkingen */
  notes?: string;
  /** F 3110 horizontale coördinaat — RD New easting (EPSG:28992) */
  rdX: number;
  /** F 3111 verticale coördinaat — RD New northing (EPSG:28992) */
  rdY: number;
  /** F 1314 bewerking */
  treatment?: string;
  /** F 2003 inventarisnummer */
  inventoryNumber?: string;
  /** F 3201 soort terrein */
  terrainRaw?: string;
  /** F 3204 metaaldetector */
  metalDetectorRaw?: string;

  // --- Derived data (generated at import time) ---
  /** WGS84 longitude, transformed from EPSG:28992 */
  longitude: number;
  /** WGS84 latitude, transformed from EPSG:28992 */
  latitude: number;

  /** Parsed start of dating range (year AD) */
  dateStart?: number;
  /** Parsed end of dating range (year AD) */
  dateEnd?: number;
  /** True when the source dating is marked uncertain, e.g. "(98-117) (?)" */
  dateUncertain: boolean;

  /** One or more authorities/emperors mentioned in authorityRaw */
  authorityNormalized: string[];
  mintNormalized?: string;
  statusNormalized?: string;
  materialNormalized?: string;
  terrainNormalized?: string;

  /** true = detector used, false = explicitly no detector, undefined = unknown */
  detectorUsed?: boolean;

  /** `${rdX}:${rdY}` — groups coins recorded at the exact same coordinate */
  locationKey: string;

  /** Mass treated as unknown when <= 0; convenience for filters/stats */
  hasKnownMass: boolean;

  /** Precomputed lowercase, diacritic-folded search text */
  searchText: string;

  dataQualityFlags: DataQualityFlag[];
}

/** A group of coins that share the exact same RD coordinate. */
export interface LocationGroup {
  locationKey: string;
  rdX: number;
  rdY: number;
  longitude: number;
  latitude: number;
  province: string;
  municipality: string;
  coins: CoinRecord[];
}

export interface DatasetSummary {
  recordCount: number;
  uniqueLocationCount: number;
  provinceCount: number;
  municipalityCount: number;
  missingPanCount: number;
  recordsWithCatalogue: number;
  recordsWithMass: number;
  recordsWithDiameter: number;
  recordsWithDetectorInfo: number;
  looseFindCount: number;
  hoardFindCount: number;
  unknownFindCharacterCount: number;
  dateMin?: number;
  dateMax?: number;
  authorities: string[];
  provinces: string[];
  municipalities: string[];
  mints: string[];
  statuses: string[];
  materials: string[];
  terrains: string[];
  warnings: string[];
  generatedAt: string;
}
