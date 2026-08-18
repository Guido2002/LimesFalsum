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
  /** One-sentence background, shown in the map popup on click/tap. */
  description?: string;
}

const SITES: Record<string, Site> = {
  // --- Securely identified (west → east along the limes) ---
  "forum-hadriani": { name: "Forum Hadriani", coord: [4.3597, 52.0672], secure: true, description: "Vermoedelijke locatie van Forum Hadriani (huidige Voorburg), marktplaats en latere municipium van de Cananefaten aan het begin van de limesweg." }, // Voorburg
  lugdunum: { name: "Lugdunum Batavorum", coord: [4.4183, 52.2048], secure: true, description: "Romeinse nederzetting aan de Rijnmuide bij Katwijk; vaak verbonden aan de 'Brittenburg', maar de exacte identificatie is omstreden." }, // Katwijk
  praetorium: { name: "Praetorium Agrippinae", coord: [4.4317, 52.1793], secure: true, description: "Castellum bij Valkenburg (ZH), gebouwd rond 40 n.Chr. en genoemd op de Tabula Peutingeriana; verdedigde de Rijnoever met vier versterkingsfasen." }, // Valkenburg ZH
  matilo: { name: "Matilo", coord: [4.4936, 52.1589], secure: true, description: "Castellum bij Leiden (Roomburg), gelegen waar de (vaste) Oude Rijn de limesweg kruiste." }, // Leiden
  albaniana: { name: "Albaniana", coord: [4.6556, 52.1289], secure: true, description: "Castellum in het centrum van Alphen aan den Rijn, met een omtrek van ca. 160 × 240 meter langs de Rijn." }, // Alphen a/d Rijn
  "nigrum-pullum": { name: "Nigrum Pullum", coord: [4.7333, 52.1053], secure: true, description: "Castellum bij Zwammerdam; beroemd geworden door de zes Romeinse schepen die hier in de jaren zeventig werden opgegraven." }, // Zwammerdam
  laurium: { name: "Laurium", coord: [4.8833, 52.085], secure: true, description: "Castellum van Woerden aan de Oude Rijn, gebouwd rond 40 n.Chr.; de fundamenten liggen onder het stadscentrum." }, // Woerden
  fletio: { name: "Fletio", coord: [5.0167, 52.1], secure: true, description: "Fort en wachttoren bij Vleuten-De Meern; nabij werd het intacte Romeinse vrachtschip 'De Meern 1' gevonden." }, // Vleuten-De Meern
  traiectum: { name: "Traiectum", coord: [5.1214, 52.0907], secure: true, description: "Castellum op het Utrechtse Domplein (ca. 47 n.Chr.), gebouwd na de Bataafse opstand; de kern waaruit de stad Utrecht groeide." }, // Utrecht
  fectio: { name: "Fectio", coord: [5.1667, 51.9833], secure: true, description: "Een van de grootste forten langs de Nederlandse limes, bij Vechten (Bunnik); bewaakte de splitsing van Rijn en Vecht." }, // Vechten
  levefanum: { name: "Levefanum", coord: [5.3417, 51.9747], secure: true, description: "Castellum bij Wijk bij Duurstede; het fort is grotendeels weggeerodeerd door de Rijn en deels opgegraven." }, // Wijk bij Duurstede
  mannaricium: { name: "Mannaricium", coord: [5.4247, 51.9611], secure: true, description: "Castellum bij Maurik, genoemd op de Tabula Peutingeriana; resten liggen in de uiterwaard van de Rijn." }, // Maurik
  carvo: { name: "Carvo", coord: [5.5667, 51.9333], secure: true, description: "Castellum bij Kesteren, waar de limesweg de Nederrijn naderde; sporen van het fort en een vicus zijn aangetroffen." }, // Kesteren
  "castra-herculis": { name: "Castra Herculis", coord: [5.8989, 51.985], secure: true, description: "Castellum in Arnhem-Meinerswijk, westelijk van de splitsing van Rijn en IJssel; gesticht rond 10 v.Chr." }, // Arnhem-Meinerswijk
  carvium: { name: "Carvium", coord: [6.0953, 51.8808], secure: true, description: "Castellum bij Herwen/De Bijland, strategisch gelegen bij de splitsing van de Rijn in Waal en Nederrijn." }, // Herwen/Bijland
  noviomagus: { name: "Noviomagus Batavorum", coord: [5.8708, 51.8469], secure: true, description: "Nijmegen: legioenslegerkamp op de Hunerberg (Legio X Gemina) en daarna de Romeinse stad Ulpia Noviomagus, oudste stad van Nederland." }, // Nijmegen
  grinnes: { name: "Grinnes", coord: [5.33, 51.8], secure: true, description: "Castellum bij Rossum aan de Waal; genoemd op de Tabula Peutingeriana tussen de Maas- en Rijnoever." }, // Rossum
  ceuclum: { name: "Ceuclum", coord: [5.8794, 51.7297], secure: true, description: "Castellum bij Cuijk, waar een Romeinse brug de Maas overspande; het 4e-eeuwse fort is deels gereconstrueerd zichtbaar gemaakt." }, // Cuijk
  blariacum: { name: "Blariacum", coord: [6.155, 51.372], secure: true, description: "Fort bij Blerick (Venlo) aan de Maasoever, onderdeel van de verdediging van de Maasvallei." }, // Blerick
  burginatium: { name: "Burginatium", coord: [6.29, 51.7333], secure: true, description: "Hulptroepenfort bij Alt-Kalkar (Dld) op de Rijnhoogvlakte, met een omvangrijke vicus en grafvelden." }, // Alt-Kalkar
  "colonia-ulpia": { name: "Colonia Ulpia Traiana", coord: [6.4531, 51.6619], secure: true, description: "Romeinse colonia bij het huidige Xanten, rond 98 n.Chr. gesticht door Trajanus; de op een na grootste stad van Germania Inferior." }, // Xanten
  vetera: { name: "Vetera", coord: [6.434, 51.64], secure: true, description: "Legioensvesting bij Birten (Xanten), waar tot twee legioenen tegelijk gelegerd waren; verwoest tijdens de Bataafse opstand en herbouwd." }, // Birten
  asciburgium: { name: "Asciburgium", coord: [6.66, 51.43], secure: true, description: "Fort op de Rijnhoogvlakte bij Moers-Asberg (Dld), een van de oudste Romeinse versterkingen aan de Nederrijn." }, // Moers-Asberg
  gelduba: { name: "Gelduba", coord: [6.7, 51.336], secure: true, description: "Fort en vicus bij Krefeld-Gellep (Dld); in 69 n.Chr. toneel van hevige gevechten tijdens de Bataafse opstand." }, // Krefeld-Gellep
  novaesium: { name: "Novaesium", coord: [6.6936, 51.1986], secure: true, description: "Legioensvesting van Neuss (Dld), een van de oudste legioenskampen aan de Rijn; hier was later Legio VI Victrix gestationeerd." }, // Neuss
  durnomagus: { name: "Durnomagus", coord: [6.8333, 51.095], secure: true, description: "Fort en nederzetting bij Dormagen (Dld) aan de Rijnweg tussen Keulen en Neuss." }, // Dormagen
  "colonia-agrippina": { name: "Colonia Agrippina", coord: [6.9583, 50.9375], secure: true, description: "Het huidige Keulen: in 50 n.Chr. verheven tot colonia en hoofdstad van de provincie Germania Inferior." }, // Köln
  bonna: { name: "Bonna", coord: [7.1, 50.7333], secure: true, description: "Legioensvesting van Bonn (Dld), waar Legio I Minervia eeuwenlang gelegerd was aan de Rijn." }, // Bonn
  rigomagus: { name: "Rigomagus", coord: [7.2272, 50.5786], secure: true, description: "Fort en nederzetting bij Remagen (Dld), waar een Romeinse brug de Rijn overstak richting de Eifel." }, // Remagen
  confluentes: { name: "Confluentes", coord: [7.6, 50.36], secure: true, description: "Romeinse versterking bij Koblenz (Dld), op de plek waar Moezel en Rijn samenvloeien." }, // Koblenz
  "augusta-treverorum": { name: "Augusta Treverorum", coord: [6.644, 49.7499], secure: true, description: "Trier (Dld), hoofdstad van de Treveri en in de late oudheid zelfs keizerlijke residentiestad." }, // Trier
  beda: { name: "Beda", coord: [6.525, 49.975], secure: true, description: "Vicus bij Bitburg (Dld), een marktplaats en poststation aan de weg Keulen–Trier." }, // Bitburg
  tolbiacum: { name: "Tolbiacum", coord: [6.65, 50.69], secure: true, description: "Romeinse nederzetting bij Zülpich (Dld) aan de weg Keulen–Trier; in 496 toneel van de Slag bij Tolbiac." }, // Zülpich
  iuliacum: { name: "Iuliacum", coord: [6.36, 50.92], secure: true, description: "Nederzetting en fort bij Jülich (Dld) aan de Roer, waar de weg Keulen–Heerlen de rivier kruiste." }, // Jülich
  "aquae-granni": { name: "Aquae Granni", coord: [6.0836, 50.7753], secure: true, description: "Badplaats bij Aken (Dld), beroemd om haar warme bronnen die al in de 1e eeuw n.Chr. in gebruik waren." }, // Aachen
  coriovallum: { name: "Coriovallum", coord: [5.9806, 50.8878], secure: true, description: "Vicus op het kruispunt van de heirbanen bij Heerlen; de opgegraven Romeinse thermen vormen het Thermenmuseum." }, // Heerlen
  "traiectum-mosam": { name: "Traiectum ad Mosam", coord: [5.6909, 50.8514], secure: true, description: "Maastricht: nederzetting bij de Romeinse brug over de Maas aan de weg Bavay–Keulen." }, // Maastricht
  atuatuca: { name: "Atuatuca", coord: [5.4642, 50.7806], secure: true, description: "Tongeren (Atuatuca Tungrorum), bestuurlijk centrum van de Tungri en de oudste stad van België." }, // Tongeren
  bagacum: { name: "Bagacum Nerviorum", coord: [3.787, 50.108], secure: true, description: "Bavay (Frankrijk), hoofdplaats van de Nervi; knooppunt waar zeven Romeinse wegen samenkwamen." }, // Bavay

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
    properties: { name: s.name, secure: s.secure ? 1 : 0, description: s.description ?? "" },
    geometry: { type: "Point" as const, coordinates: s.coord },
  })),
};
