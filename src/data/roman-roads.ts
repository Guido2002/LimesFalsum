/**
 * Schematic Roman road network for the Lower Rhine / Low Countries,
 * digitised from a stylised Peutinger-style map (the PNG the user supplied).
 *
 * CRITICAL CAVEATS — read before trusting this layer:
 * 1. The source map is schematic, not to scale. Road segments here are
 *    straight lines between stations; real Roman road courses are only
 *    partially known from archaeology.
 * 2. Major sites use the accepted coordinates of their modern counterparts
 *    (Noviomagus = Nijmegen, Traiectum = Utrecht, etc.). Minor way-stations
 *    marked `approx` have NO securely identified modern location — their
 *    coordinates are interpolations along the route order shown on the map.
 * 3. This layer is an educational reconstruction, not archaeological
 *    evidence. It intentionally looks hand-drawn (dashed, low opacity).
 */

type LngLat = [number, number];

interface Site {
  name: string;
  coord: LngLat;
  /** true = securely identified with a modern place; false = interpolated */
  secure: boolean;
}

const SITES: Record<string, Site> = {
  // --- Securely identified (west → east along the limes) ---
  "forum-hadriani": { name: "Forum Hadriani", coord: [4.3597, 52.0672], secure: true }, // Voorburg
  lugdunum: { name: "Lugdunum Batavorum", coord: [4.4183, 52.2048], secure: true }, // Katwijk
  praetorium: { name: "Praetorium Agrippinae", coord: [4.4317, 52.1793], secure: true }, // Valkenburg ZH
  matilo: { name: "Matilo", coord: [4.4936, 52.1589], secure: true }, // Leiden
  albaniana: { name: "Albaniana", coord: [4.6556, 52.1289], secure: true }, // Alphen a/d Rijn
  "nigrum-pullum": { name: "Nigrum Pullum", coord: [4.7333, 52.1053], secure: true }, // Zwammerdam
  laurium: { name: "Laurium", coord: [4.8833, 52.085], secure: true }, // Woerden
  fletio: { name: "Fletio", coord: [5.0167, 52.1], secure: true }, // Vleuten-De Meern
  traiectum: { name: "Traiectum", coord: [5.1214, 52.0907], secure: true }, // Utrecht
  fectio: { name: "Fectio", coord: [5.1667, 51.9833], secure: true }, // Vechten
  levefanum: { name: "Levefanum", coord: [5.3417, 51.9747], secure: true }, // Wijk bij Duurstede
  mannaricium: { name: "Mannaricium", coord: [5.4247, 51.9611], secure: true }, // Maurik
  carvo: { name: "Carvo", coord: [5.5667, 51.9333], secure: true }, // Kesteren
  "castra-herculis": { name: "Castra Herculis", coord: [5.8989, 51.985], secure: true }, // Arnhem-Meinerswijk
  carvium: { name: "Carvium", coord: [6.0953, 51.8808], secure: true }, // Herwen/Bijland
  noviomagus: { name: "Noviomagus Batavorum", coord: [5.8708, 51.8469], secure: true }, // Nijmegen
  grinnes: { name: "Grinnes", coord: [5.33, 51.8], secure: true }, // Rossum
  ceuclum: { name: "Ceuclum", coord: [5.8794, 51.7297], secure: true }, // Cuijk
  blariacum: { name: "Blariacum", coord: [6.155, 51.372], secure: true }, // Blerick
  burginatium: { name: "Burginatium", coord: [6.29, 51.7333], secure: true }, // Alt-Kalkar
  "colonia-ulpia": { name: "Colonia Ulpia Traiana", coord: [6.4531, 51.6619], secure: true }, // Xanten
  vetera: { name: "Vetera", coord: [6.434, 51.64], secure: true }, // Birten
  asciburgium: { name: "Asciburgium", coord: [6.66, 51.43], secure: true }, // Moers-Asberg
  gelduba: { name: "Gelduba", coord: [6.7, 51.336], secure: true }, // Krefeld-Gellep
  novaesium: { name: "Novaesium", coord: [6.6936, 51.1986], secure: true }, // Neuss
  durnomagus: { name: "Durnomagus", coord: [6.8333, 51.095], secure: true }, // Dormagen
  "colonia-agrippina": { name: "Colonia Agrippina", coord: [6.9583, 50.9375], secure: true }, // Köln
  bonna: { name: "Bonna", coord: [7.1, 50.7333], secure: true }, // Bonn
  rigomagus: { name: "Rigomagus", coord: [7.2272, 50.5786], secure: true }, // Remagen
  confluentes: { name: "Confluentes", coord: [7.6, 50.36], secure: true }, // Koblenz
  "augusta-treverorum": { name: "Augusta Treverorum", coord: [6.644, 49.7499], secure: true }, // Trier
  beda: { name: "Beda", coord: [6.525, 49.975], secure: true }, // Bitburg
  tolbiacum: { name: "Tolbiacum", coord: [6.65, 50.69], secure: true }, // Zülpich
  iuliacum: { name: "Iuliacum", coord: [6.36, 50.92], secure: true }, // Jülich
  "aquae-granni": { name: "Aquae Granni", coord: [6.0836, 50.7753], secure: true }, // Aachen
  coriovallum: { name: "Coriovallum", coord: [5.9806, 50.8878], secure: true }, // Heerlen
  "traiectum-mosam": { name: "Traiectum ad Mosam", coord: [5.6909, 50.8514], secure: true }, // Maastricht
  atuatuca: { name: "Atuatuca", coord: [5.4642, 50.7806], secure: true }, // Tongeren
  bagacum: { name: "Bagacum Nerviorum", coord: [3.787, 50.108], secure: true }, // Bavay

  // --- Approximate: no securely identified modern location. Coordinates
  // interpolated along the route order shown on the source map. ---
  flenium: { name: "Flenium", coord: [4.29, 52.09], secure: false },
  tablis: { name: "Tablis", coord: [4.6, 52.03], secure: false },
  caspingium: { name: "Caspingium", coord: [5.55, 51.88], secure: false },
  arenatium: { name: "Arenatium", coord: [6.03, 51.99], secure: false },
  mediolanum: { name: "Mediolanum", coord: [6.05, 51.55], secure: false },
  sablones: { name: "Sablones", coord: [6.1, 51.28], secure: false },
  mederiacum: { name: "Mederiacum", coord: [6.05, 51.15], secure: false },
  teudurum: { name: "Teudurum", coord: [6.02, 51.05], secure: false },
  feresne: { name: "Feresne", coord: [5.99, 50.96], secure: false },
  catualium: { name: "Catualium", coord: [5.85, 51.1], secure: false },
  tiberiacum: { name: "Tiberiacum", coord: [6.2, 50.95], secure: false },
  burungum: { name: "Burungum", coord: [6.76, 51.14], secure: false },
  icorrigium: { name: "Icorigium", coord: [6.85, 50.6], secure: false },
  perniciacum: { name: "Perniciacum", coord: [4.9, 50.6], secure: false },
  geminiacum: { name: "Geminacum", coord: [4.55, 50.45], secure: false },
  vogdorviacum: { name: "Vogdorviacum", coord: [4.15, 50.3], secure: false },
};

/**
 * Road topology as drawn on the source map: each entry is one continuous
 * route, expressed as an ordered chain of site keys.
 */
const ROADS: string[][] = [
  // Limes road along the Rhine, Katwijk → Arnhem
  ["lugdunum", "praetorium", "matilo", "albaniana", "nigrum-pullum", "laurium", "fletio", "traiectum", "fectio", "levefanum", "mannaricium", "carvo", "castra-herculis"],
  ["forum-hadriani", "lugdunum"],
  ["forum-hadriani", "flenium"],
  // South of the Rhine: Tablis / Caspingium connectors to Noviomagus
  ["albaniana", "tablis", "caspingium", "noviomagus"],
  ["laurium", "caspingium"],
  // Noviomagus hub: Waal crossing and eastern route to the Rhineland
  ["noviomagus", "grinnes"],
  ["noviomagus", "carvium", "arenatium", "burginatium", "colonia-ulpia"],
  // Noviomagus → Cuijk → Blerick (Meuse corridor)
  ["noviomagus", "ceuclum", "mediolanum", "blariacum"],
  // Lower Rhine west bank: Xanten → Köln → Koblenz
  ["colonia-ulpia", "vetera", "asciburgium", "gelduba", "novaesium", "burungum", "durnomagus", "colonia-agrippina", "bonna", "rigomagus", "confluentes"],
  // Cologne hinterland: Zülpich, Jülich, Aachen, Heerlen
  ["colonia-agrippina", "tolbiacum", "iuliacum", "tiberiacum", "coriovallum"],
  ["iuliacum", "aquae-granni"],
  ["aquae-granni", "traiectum-mosam"],
  ["coriovallum", "traiectum-mosam"],
  // Blerick → Heerlen inland chain
  ["blariacum", "sablones", "mederiacum", "teudurum", "feresne", "coriovallum"],
  ["catualium", "teudurum"],
  // Tongeren → Bavay (Gallic trunk road)
  ["traiectum-mosam", "atuatuca", "perniciacum", "geminiacum", "vogdorviacum", "bagacum"],
  // Bonn → Trier via the Eifel
  ["bonna", "icorrigium", "beda", "augusta-treverorum"],
];

export const ROMAN_ROADS_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: ROADS.map((route) => ({
    type: "Feature" as const,
    properties: { approximate: route.some((k) => !SITES[k].secure) },
    geometry: {
      type: "LineString" as const,
      coordinates: route.map((k) => SITES[k].coord),
    },
  })),
};

export const ROMAN_SITES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: Object.values(SITES).map((s) => ({
    type: "Feature" as const,
    properties: { name: s.name, secure: s.secure ? 1 : 0 },
    geometry: { type: "Point" as const, coordinates: s.coord },
  })),
};
