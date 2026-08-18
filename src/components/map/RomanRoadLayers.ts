import type maplibre from "maplibre-gl";
import { ROMAN_ROADS_GEOJSON, ROMAN_SITES_GEOJSON } from "../../data/roman-roads";

export const ROMAN_ROADS_SOURCE_ID = "roman-roads";
export const ROMAN_SITES_SOURCE_ID = "roman-sites";
export const ROMAN_ROAD_LAYER_ID = "roman-road-lines";
export const ROMAN_SITE_LAYER_ID = "roman-site-points";
export const ROMAN_SITE_LABEL_LAYER_ID = "roman-site-labels";

const ROMAN_LAYER_IDS = [ROMAN_ROAD_LAYER_ID, ROMAN_SITE_LAYER_ID, ROMAN_SITE_LABEL_LAYER_ID];

/**
 * Schematic Roman road overlay. Add BEFORE the coin layers so the coin
 * markers always sit on top. Styled deliberately hand-drawn (dashed, muted)
 * to signal that this is a reconstruction, not measured geography.
 */
export function addRomanRoadLayers(map: maplibre.Map): void {
  map.addSource(ROMAN_ROADS_SOURCE_ID, { type: "geojson", data: ROMAN_ROADS_GEOJSON });
  map.addSource(ROMAN_SITES_SOURCE_ID, { type: "geojson", data: ROMAN_SITES_GEOJSON });

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
      // Routes containing interpolated stations render fainter.
      "line-opacity": ["case", ["get", "approximate"], 0.22, 0.42],
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.8, 12, 1.8],
      "line-dasharray": [1.6, 1.8],
    },
  });

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
      "text-offset": [0, 0.95],
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

export function setRomanRoadsVisible(map: maplibre.Map, visible: boolean): void {
  for (const id of [`${ROMAN_ROAD_LAYER_ID}-casing`, ...ROMAN_LAYER_IDS]) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    }
  }
}
