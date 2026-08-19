import maplibregl from "maplibre-gl";
import {
  ROMAN_BUILDINGS_GEOJSON,
  ROMAN_FARMS_GEOJSON,
  ROMAN_ROADS_GEOJSON,
  ROMAN_SITES_GEOJSON,
  BUILDING_POINTS,
  FARM_POINTS,
  SITE_POINTS,
} from "../../data/roman-roads";

export const ROMAN_ROADS_SOURCE_ID = "roman-roads";
export const ROMAN_SITES_SOURCE_ID = "roman-sites";
export const ROMAN_BUILDINGS_SOURCE_ID = "roman-buildings";
export const ROMAN_FARMS_SOURCE_ID = "roman-farms";
export const ROMAN_ROAD_LAYER_ID = "roman-road-lines";
export const ROMAN_SITE_LAYER_ID = "roman-site-points";
export const ROMAN_SITE_LABEL_LAYER_ID = "roman-site-labels";
export const ROMAN_BUILDING_LAYER_ID = "roman-building-points";
export const ROMAN_BUILDING_LABEL_LAYER_ID = "roman-building-labels";
export const ROMAN_FARM_LAYER_ID = "roman-farm-points";
export const ROMAN_FARM_LABEL_LAYER_ID = "roman-farm-labels";

const ROMAN_LAYER_IDS = [
  ROMAN_ROAD_LAYER_ID,
  ROMAN_SITE_LAYER_ID,
  ROMAN_SITE_LABEL_LAYER_ID,
  ROMAN_BUILDING_LAYER_ID,
  ROMAN_BUILDING_LABEL_LAYER_ID,
  ROMAN_FARM_LAYER_ID,
  ROMAN_FARM_LABEL_LAYER_ID,
];

/** Sprite id for the hand-drawn fort PNG (served from /public). */
const FORT_ICON_ID = "fort-icon";
/** Sprite id for the hand-drawn farmstead PNG. */
const FARM_ICON_ID = "farm-icon";

/**
 * Roman roads and forts overlay (DARE data, see src/data/roman-roads.ts).
 * Add BEFORE the coin layers so the coin markers always sit on top. Roads
 * with `approximate` = 1 (course not certainly known) render fainter; main
 * and named routes (`major` = 1) get a slightly heavier stroke.
 *
 * Async because the fort icon PNG has to be fetched before the site layer
 * can reference it — callers must await this to keep the draw order stable.
 */
export async function addRomanRoadLayers(map: maplibregl.Map): Promise<void> {
  map.addSource(ROMAN_ROADS_SOURCE_ID, { type: "geojson", data: ROMAN_ROADS_GEOJSON });
  map.addSource(ROMAN_SITES_SOURCE_ID, { type: "geojson", data: ROMAN_SITES_GEOJSON });
  map.addSource(ROMAN_BUILDINGS_SOURCE_ID, { type: "geojson", data: ROMAN_BUILDINGS_GEOJSON });
  map.addSource(ROMAN_FARMS_SOURCE_ID, { type: "geojson", data: ROMAN_FARMS_GEOJSON });

  // Hairline casing first (light), then the dashed road itself on top —
  // this makes the road read as a drawn path, not a floating dashed stroke.
  map.addLayer({
    id: `${ROMAN_ROAD_LAYER_ID}-casing`,
    type: "line",
    source: ROMAN_ROADS_SOURCE_ID,
    paint: {
      "line-color": "#FAF7F0",
      "line-opacity": 0.5,
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2.2, 12, 4],
    },
  });

  map.addLayer({
    id: ROMAN_ROAD_LAYER_ID,
    type: "line",
    source: ROMAN_ROADS_SOURCE_ID,
    paint: {
      "line-color": "#8A2E25",
      // Roads whose course is not certainly known render fainter.
      "line-opacity": ["case", ["==", ["get", "approximate"], 1], 0.22, 0.42],
      // Main and named routes get a slightly heavier stroke.
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        6,
        ["case", ["==", ["get", "major"], 1], 1.1, 0.7],
        12,
        ["case", ["==", ["get", "major"], 1], 2.2, 1.5],
      ],
      "line-dasharray": [1.6, 1.8],
    },
  });

  // Farmsteads (user's own vici/stad list) get the hand-drawn farm icon.
  // Few points, so they may be visible from overview zoom — like the forts.
  const farmIconReady = await loadSprite(map, FARM_ICON_ID, "farm-icon.png");
  if (farmIconReady) {
    map.addLayer({
      id: ROMAN_FARM_LAYER_ID,
      type: "symbol",
      source: ROMAN_FARMS_SOURCE_ID,
      layout: {
        "icon-image": FARM_ICON_ID,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.06, 12, 0.13, 16, 0.2],
        "icon-allow-overlap": true,
      },
      paint: {
        "icon-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.4, 9, 0.9],
      },
    });
  } else {
    map.addLayer({
      id: ROMAN_FARM_LAYER_ID,
      type: "circle",
      source: ROMAN_FARMS_SOURCE_ID,
      paint: {
        "circle-color": "#6B4E24",
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 1.6, 12, 3],
        "circle-opacity": 0.75,
        "circle-stroke-color": "#FAF7F0",
        "circle-stroke-width": 1.2,
      },
    });
  }

  map.addLayer({
    id: ROMAN_FARM_LABEL_LAYER_ID,
    type: "symbol",
    source: ROMAN_FARMS_SOURCE_ID,
    minzoom: 10,
    layout: {
      "text-field": ["get", "name"],
      "text-size": 10.5,
      "text-font": ["Noto Sans Italic"],
      "text-offset": [0, 1.0],
      "text-anchor": "top",
      "text-optional": true,
      "text-padding": 5,
    },
    paint: {
      "text-color": "#6B4E24",
      "text-halo-color": "#FAF7F0",
      "text-halo-width": 2,
      "text-halo-blur": 0.5,
    },
  });

  // Civilian buildings (villa's, tempels, bruggen, mijlpalen, …): smaller,
  // lighter diamond markers that only appear when zoomed in — there are ~380
  // of them, so at overview zoom they would drown out the forts and coins.
  map.addLayer({
    id: ROMAN_BUILDING_LAYER_ID,
    type: "circle",
    source: ROMAN_BUILDINGS_SOURCE_ID,
    minzoom: 8.5,
    paint: {
      "circle-color": "#8C7A5B",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 8.5, 1.6, 13, 3.4],
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8.5,
        ["case", ["==", ["get", "secure"], 1], 0.45, 0.25],
        11,
        ["case", ["==", ["get", "secure"], 1], 0.8, 0.45],
      ],
      "circle-stroke-color": "#FAF7F0",
      "circle-stroke-width": 1,
    },
  });

  map.addLayer({
    id: ROMAN_BUILDING_LABEL_LAYER_ID,
    type: "symbol",
    source: ROMAN_BUILDINGS_SOURCE_ID,
    minzoom: 11,
    layout: {
      "text-field": ["get", "name"],
      "text-size": 10.5,
      "text-font": ["Noto Sans Italic"],
      "text-offset": [0, 0.9],
      "text-anchor": "top",
      "text-optional": true,
      "text-padding": 5,
    },
    paint: {
      "text-color": "#8C7A5B",
      "text-halo-color": "#FAF7F0",
      "text-halo-width": 1.8,
      "text-halo-blur": 0.5,
    },
  });

  // Forts get the hand-drawn fort PNG as their icon. If the sprite can't be
  // fetched (offline, bad deploy), fall back to the previous bronze dots so
  // the sites never disappear silently.
  const fortIconReady = await loadFortIcon(map);
  if (fortIconReady) {
    map.addLayer({
      id: ROMAN_SITE_LAYER_ID,
      type: "symbol",
      source: ROMAN_SITES_SOURCE_ID,
      layout: {
        "icon-image": FORT_ICON_ID,
        // The sprite is 288×152, so these sizes land at roughly
        // 18px wide (zoom 6) → 40px wide (zoom 12); growth flattens after
        // that so icons don't dominate when fully zoomed in.
        "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.062, 12, 0.14, 16, 0.22],
        "icon-allow-overlap": true,
      },
      paint: {
        // Faint at overview zoom so the icon row doesn't read as noise along
        // the road; fully present once zoomed in. Interpolated stations
        // render fainter, like the roads.
        "icon-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          ["case", ["==", ["get", "secure"], 1], 0.4, 0.25],
          9,
          ["case", ["==", ["get", "secure"], 1], 0.95, 0.55],
        ],
      },
    });
  } else {
    map.addLayer({
      id: ROMAN_SITE_LAYER_ID,
      type: "circle",
      source: ROMAN_SITES_SOURCE_ID,
      paint: {
        "circle-color": "#A27A44",
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 1.4, 12, 2.6],
        "circle-opacity": 0.7,
        "circle-stroke-color": "#FAF7F0",
        "circle-stroke-width": 1.2,
      },
    });
  }

  // Site names fade in only when zoomed in enough to stay readable. A larger
  // halo lifts them off the base map, and label collision (text-optional +
  // text-padding) keeps dense clusters from overlapping into a blur.
  map.addLayer({
    id: ROMAN_SITE_LABEL_LAYER_ID,
    type: "symbol",
    source: ROMAN_SITES_SOURCE_ID,
    minzoom: 9,
    layout: {
      "text-field": ["get", "name"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 9, 9.5, 14, 12],
      "text-font": ["Noto Sans Italic"],
      // Slightly lower than before so labels clear the taller fort icon.
      "text-offset": [0, 1.1],
      "text-anchor": "top",
      "text-optional": true,
      "text-padding": 6,
      // Let only one label per area survive at low zoom; both appear high.
      "text-radial-offset": 0.9,
    },
    paint: {
      "text-color": "#6B4E24",
      "text-halo-color": "#FAF7F0",
      "text-halo-width": 2.2,
      "text-halo-blur": 0.5,
      // Interpolated stations get fainter labels.
      "text-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        ["case", ["==", ["get", "secure"], 1], 0.8, 0.45],
        14,
        ["case", ["==", ["get", "secure"], 1], 0.95, 0.6],
      ],
    },
  });
}

export function setRomanRoadsVisible(map: maplibregl.Map, visible: boolean): void {
  for (const id of [`${ROMAN_ROAD_LAYER_ID}-casing`, ...ROMAN_LAYER_IDS]) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    }
  }
}

export interface FortFilterOptions {
  /** Date window from the coin filter. */
  dateFrom?: number;
  dateTo?: number;
  /** Free-text query — matched against fort name and modern name. */
  search?: string;
  /** Locations of the currently filtered coins — forts near one stay visible. */
  groups?: { longitude: number; latitude: number }[];
  /** True when a province/municipality filter is active (drives proximity). */
  geoFilterActive?: boolean;
  /** Hoards happen near fortifications; loose-only filters hide forts. */
  findCharacters?: string[];
}

/** Forts further than this from every filtered findspot are hidden. */
const NEAR_COIN_KM = 15;

function distanceKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const dx = (lon1 - lon2) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180)) * 111.32;
  const dy = (lat1 - lat2) * 110.95;
  return Math.hypot(dx, dy);
}

/**
 * Align the fort layer with the active coin filters. A fort stays visible
 * when every applicable rule passes; unknown data never hides a fort.
 */
export function setRomanSitesFilter(map: maplibregl.Map, opts: FortFilterOptions): void {
  const conditions: unknown[] = [true]; // no filter → match everything

  // 1. Date overlap; forts with unknown dates (0/0) always pass.
  if (opts.dateFrom !== undefined || opts.dateTo !== undefined) {
    const lo = opts.dateFrom ?? -9999;
    const hi = opts.dateTo ?? 9999;
    conditions.push([
      "any",
      ["all", ["==", ["get", "startYear"], 0], ["==", ["get", "endYear"], 0]],
      ["all", ["<=", ["get", "startYear"], hi], [">=", ["get", "endYear"], lo]],
    ]);
  }

  // 2. Free-text search: fort name or modern name contains the query.
  const q = opts.search?.trim().toLowerCase();
  if (q) {
    conditions.push([
      "any",
      [">=", ["index-of", q, ["downcase", ["get", "name"]]], 0],
      [">=", ["index-of", q, ["downcase", ["get", "modern"]]], 0],
    ]);
  }

  // 3. Province/municipality filter active → keep only sites near a
  //    remaining findspot (client-side: MapLibre has no point-distance expr).
  if (opts.geoFilterActive) {
    const near = new Set<string>();
    for (const s of [...SITE_POINTS, ...BUILDING_POINTS, ...FARM_POINTS]) {
      for (const g of opts.groups ?? []) {
        if (distanceKm(s.lon, s.lat, g.longitude, g.latitude) <= NEAR_COIN_KM) {
          near.add(s.key);
          break;
        }
      }
    }
    conditions.push(["in", ["get", "key"], ["literal", [...near]]]);
  }

  // 4. Hoards are found around fortifications; a loose-only filter implies
  //    no fort context — hide the forts. Mixed/empty selections keep them.
  const fc = opts.findCharacters ?? [];
  if (fc.length > 0 && !fc.includes("schatvondst") && fc.includes("losse vondst")) {
    conditions.push(false);
  }

  const filter = conditions.length === 1
    ? null
    : (["all", ...conditions] as maplibregl.FilterSpecification);

  for (const id of [
    ROMAN_SITE_LAYER_ID,
    ROMAN_SITE_LABEL_LAYER_ID,
    ROMAN_BUILDING_LAYER_ID,
    ROMAN_BUILDING_LABEL_LAYER_ID,
    ROMAN_FARM_LAYER_ID,
    ROMAN_FARM_LABEL_LAYER_ID,
  ]) {
    if (map.getLayer(id)) map.setFilter(id, filter);
  }
}

/** Fallback line for sites without a securely identified location. */
const UNCERTAIN_NOTE =
  "De exacte ligging van deze plek is onzeker of alleen vermoed; de markering is een benadering.";

interface DareLink {
  label: string;
  url: string;
}

/** Escape user-injected data before it lands in popup HTML. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Clicking/tapping a fort icon opens a small popup with the site name, the
 * modern location, the dataset note and the external references DARE lists
 * for the place. Call AFTER addRomanRoadLayers has resolved so the site
 * layer exists.
 */
export function onSiteClick(map: maplibregl.Map): void {
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: true,
    className: "limes-site-popup",
    maxWidth: "280px",
    offset: 20,
  });

  const handleSiteClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const props = feature.properties as {
      name?: string;
      modern?: string;
      secure?: number;
      description?: string;
      links?: string;
    };
    if (!props.name) return;
    const modernLine =
      props.modern && props.modern !== props.name
        ? `<p class="limes-site-popup__modern">${escapeHtml(props.modern)}</p>`
        : "";
    const body = props.description || (props.secure ? "" : UNCERTAIN_NOTE);
    let links: DareLink[] = [];
    try {
      links = JSON.parse(props.links ?? "[]") as DareLink[];
    } catch {
      links = [];
    }
    const linksLine = links.length
      ? `<p class="limes-site-popup__links">${links
          .map(
            (l) =>
              `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`,
          )
          .join(" · ")}</p>`
      : "";
    popup
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong class="limes-site-popup__name">${escapeHtml(props.name)}</strong>` +
          modernLine +
          (body ? `<p class="limes-site-popup__text">${escapeHtml(body)}</p>` : "") +
          linksLine,
      )
      .addTo(map);
  };

  const setPointer = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const clearPointer = () => {
    map.getCanvas().style.cursor = "";
  };

  map.on("click", ROMAN_SITE_LAYER_ID, handleSiteClick);
  map.on("click", ROMAN_BUILDING_LAYER_ID, handleSiteClick);
  map.on("click", ROMAN_FARM_LAYER_ID, handleSiteClick);

  map.on("mouseenter", ROMAN_SITE_LAYER_ID, setPointer);
  map.on("mouseenter", ROMAN_BUILDING_LAYER_ID, setPointer);
  map.on("mouseenter", ROMAN_FARM_LAYER_ID, setPointer);
  map.on("mouseleave", ROMAN_SITE_LAYER_ID, clearPointer);
  map.on("mouseleave", ROMAN_BUILDING_LAYER_ID, clearPointer);
  map.on("mouseleave", ROMAN_FARM_LAYER_ID, clearPointer);
}

/** Fetch a PNG sprite and register it. False = caller should use fallback. */
async function loadSprite(map: maplibregl.Map, id: string, file: string): Promise<boolean> {
  if (map.hasImage(id)) return true;
  try {
    const response = await map.loadImage(`${import.meta.env.BASE_URL}${file}`);
    map.addImage(id, response.data);
    return true;
  } catch {
    return false;
  }
}

/** Fetch the fort PNG and register it as a sprite. False = use fallback dots. */
async function loadFortIcon(map: maplibregl.Map): Promise<boolean> {
  return loadSprite(map, FORT_ICON_ID, "fort.png");
}
