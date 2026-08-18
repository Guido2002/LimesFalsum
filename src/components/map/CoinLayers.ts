import maplibre from "maplibre-gl";

export const COIN_SOURCE_ID = "coins";
export const LOCATION_LAYER_ID = "coin-locations";
export const CLUSTER_LAYER_ID = "coin-clusters";
export const CLUSTER_COUNT_LAYER_ID = "coin-cluster-counts";
export const LOCATION_COUNT_LAYER_ID = "coin-location-counts";
export const SELECTED_LAYER_ID = "coin-selected";

/**
 * Layers (bottom → top):
 * 1. geographic clusters (MapLibre cluster) with count labels
 * 2. exact-location points — bronze ring + deep-red denarius face
 * 3. exact-location count badges ("18 munten op deze locatie")
 * 4. selected highlight ring
 *
 * Everything is a GeoJSON source + style layers: no DOM markers, so the
 * architecture scales to tens of thousands of records.
 */
export function addCoinLayers(map: maplibre.Map): void {
  map.addSource(COIN_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterMaxZoom: 12,
    clusterRadius: 44,
    // Cluster sum of exact-location counts so cluster labels reflect the
    // number of *records*, not just locations.
    clusterProperties: { records: ["+", ["get", "count"]] },
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: "circle",
    source: COIN_SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#8A2E25",
      "circle-radius": ["step", ["get", "records"], 22, 10, 28, 30, 36],
      "circle-stroke-width": 3,
      "circle-stroke-color": "#C39A56",
      "circle-opacity": 0.95,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: "symbol",
    source: COIN_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "records"],
      "text-size": 14,
      // The OpenFreeMap glyph set only ships Regular/Italic; Bold 404s.
      "text-font": ["Noto Sans Regular"],
    },
    paint: {
      "text-color": "#FAF7F0",
      "text-halo-color": "#5D211C",
      "text-halo-width": 1.5,
    },
  });

  // Selection ring sits under the point layers.
  map.addLayer({
    id: SELECTED_LAYER_ID,
    type: "circle",
    source: COIN_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "selected"], 1]],
    paint: {
      "circle-color": "rgba(195,154,86,0.28)",
      "circle-radius": 24,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#C39A56",
    },
  });

  // Bronze outer ring of the denarius marker.
  map.addLayer({
    id: LOCATION_LAYER_ID,
    type: "circle",
    source: COIN_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#8A2E25",
      "circle-radius": ["case", ["==", ["get", "selected"], 1], 13, 10],
      "circle-stroke-width": 3,
      "circle-stroke-color": "#A27A44",
      "circle-opacity": 0.96,
    },
  });

  // Small gold inner dot — the "denarius face" highlight.
  map.addLayer({
    id: "coin-locations-inner",
    type: "circle",
    source: COIN_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#C39A56",
      "circle-radius": ["case", ["==", ["get", "selected"], 1], 4.5, 3.5],
      "circle-opacity": 0.9,
    },
  });

  // Exact-location badge — only when several records share one RD coordinate.
  map.addLayer({
    id: LOCATION_COUNT_LAYER_ID,
    type: "symbol",
    source: COIN_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], [">", ["get", "count"], 1]],
    layout: {
      "text-field": ["get", "count"],
      "text-size": 13,
      "text-font": ["Noto Sans Regular"],
      "text-offset": [1.2, -1.2],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#24201D",
      "text-halo-color": "#FAF7F0",
      "text-halo-width": 3,
    },
  });
}

/**
 * Click behaviour:
 * - cluster → zoom into it;
 * - location with several coins → open the location drawer (never zoom
 *   endlessly into stacked points);
 * - single-coin location → open that coin directly.
 */
export function onMapClick(
  map: maplibre.Map,
  handler: (locationKey?: string, numisId?: number) => void,
): void {
  map.on("click", CLUSTER_LAYER_ID, (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const clusterId = feature.properties?.cluster_id as number;
    const source = map.getSource(COIN_SOURCE_ID) as maplibre.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId).then((zoom) => {
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [lng, lat], zoom, duration: 450 });
    });
  });

  map.on("click", LOCATION_LAYER_ID, (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const props = feature.properties ?? {};
    if (typeof props.numisId === "number") handler(undefined, props.numisId);
    else handler(props.locationKey as string, undefined);
  });

  for (const layer of [CLUSTER_LAYER_ID, LOCATION_LAYER_ID]) {
    map.on("mouseenter", layer, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layer, () => {
      map.getCanvas().style.cursor = "";
    });
  }
}
