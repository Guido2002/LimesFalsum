import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { CoinRecord, LocationGroup } from "../../domain/coin";
import { addCoinLayers, COIN_SOURCE_ID, onMapClick, SELECTED_LAYER_ID } from "./CoinLayers";
import { addRomanRoadLayers, onSiteClick, setRomanRoadsVisible } from "./RomanRoadLayers";

interface CoinsMapProps {
  /** One GeoJSON feature per exact location (already grouped) */
  groups: LocationGroup[];
  selectedCoinId?: number;
  selectedLocationKey?: string;
  onSelectLocation: (locationKey: string) => void;
  onSelectCoin: (numisId: number) => void;
}

/** Coin markers are styled circle layers — see CoinLayers. No sprite needed. */

/**
 * The map owns a MapLibre instance that lives for the whole session.
 * Filtered data is pushed into the GeoJSON source via setData — the map
 * itself is never recreated on filter changes.
 */
export function CoinsMap({
  groups,
  selectedCoinId,
  selectedLocationKey,
  onSelectLocation,
  onSelectCoin,
}: CoinsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const handlersRef = useRef({ onSelectLocation, onSelectCoin });
  handlersRef.current = { onSelectLocation, onSelectCoin };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [5.3, 52.15], // Central Netherlands / Roman Rhine limes
      zoom: 7.4,
      maxBounds: [
        [2.5, 50.0],
        [8.5, 54.5],
      ],
      // Compact attribution keeps the required tile/data credits on screen
      // without a permanent bar; expands on tap.
      attributionControl: { compact: true, customAttribution: "Muntdata: NUMIS" },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // Roads first: the coin markers must render on top of the overlay.
      // The fort icon PNG loads asynchronously, so wait for it before adding
      // the coin layers — otherwise the draw order becomes nondeterministic.
      void addRomanRoadLayers(map).then(() => {
        if (!mapRef.current) return; // Map torn down while the icon loaded.
        addCoinLayers(map);
        onSiteClick(map); // Fort icons open a popup with site background info.
        loadedRef.current = true;
        // Flush any data that arrived before the style finished loading.
        if (pendingDataRef.current) {
          const source = map.getSource(COIN_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
          source?.setData(pendingDataRef.current);
          pendingDataRef.current = null;
        }
        onMapClick(map, (locationKey, numisId) => {
          if (numisId !== undefined) handlersRef.current.onSelectCoin(numisId);
          else if (locationKey) handlersRef.current.onSelectLocation(locationKey);
        });
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // Push filtered location features into the source without touching the map.
  // If the style hasn't finished loading yet (first paint), stash the payload
  // and flush it from the load handler — otherwise the points never appear.
  const pendingDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const dataVersion = useRef(0);

  useEffect(() => {
    const features = groups.map((g) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [g.longitude, g.latitude] },
      properties: {
        locationKey: g.locationKey,
        count: g.coins.length,
        numisId: g.coins.length === 1 ? g.coins[0].numisId : null,
        selected: g.locationKey === selectedLocationKey ? 1 : 0,
        label: `${g.municipality}, ${g.province}`,
      },
    }));
    const data: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };
    pendingDataRef.current = data;
    dataVersion.current += 1;
    const version = dataVersion.current;

    const push = () => {
      const map = mapRef.current;
      if (!map || version !== dataVersion.current) return;
      if (loadedRef.current) {
        const source = map.getSource(COIN_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
        source?.setData(data);
        if (pendingDataRef.current === data) pendingDataRef.current = null;
      } else {
        // Style not ready — retry shortly. MapLibre 'load' also flushes.
        setTimeout(push, 60);
      }
    };
    push();
  }, [groups, selectedLocationKey]);

  // Imperative API for "fit to data" control.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => {
      if (groups.length === 0) return;
      const bounds = new maplibregl.LngLatBounds();
      for (const g of groups) bounds.extend([g.longitude, g.latitude]);
      // Extra bottom padding on small screens keeps markers clear of the
      // floating action bar.
      const bottomPad = window.innerWidth < 1024 ? 96 : 80;
      map.fitBounds(bounds, { padding: { top: 80, right: 80, bottom: bottomPad, left: 80 }, maxZoom: 11, duration: 600 });
    };
    window.addEventListener("limes:fit-data", handler);
    return () => window.removeEventListener("limes:fit-data", handler);
  }, [groups]);

  // Roman-roads overlay toggle, dispatched by MapControls. Default: visible.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: Event) => {
      const visible = (e as CustomEvent<boolean>).detail;
      setRomanRoadsVisible(map, visible);
    };
    window.addEventListener("limes:toggle-roads", handler);
    return () => window.removeEventListener("limes:toggle-roads", handler);
  }, []);

  // Gentle ripple on the selected-location halo. Driven by rAF against paint
  // properties (no DOM markers); skipped entirely under reduced motion.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedLocationKey === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % 1600) / 1600;
      const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2); // 0 → 1 → 0
      try {
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-radius", 22 + wave * 8);
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-opacity", 1 - wave * 0.55);
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-stroke-opacity", 1 - wave * 0.5);
      } catch {
        // Style/layer not ready yet — keep the loop alive until it is.
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      try {
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-radius", 24);
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-opacity", 1);
        map.setPaintProperty(SELECTED_LAYER_ID, "circle-stroke-opacity", 1);
      } catch {
        // Map already torn down.
      }
    };
  }, [selectedLocationKey]);

  // Centre on a coin opened via a shared ?coin= link.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedCoinId === undefined) return;
    const group = groups.find((g) => g.coins.some((c) => c.numisId === selectedCoinId));
    if (group) {
      map.easeTo({ center: [group.longitude, group.latitude], zoom: Math.max(map.getZoom(), 9) });
    }
    // Only when the selection itself changes.
  }, [selectedCoinId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly to a location when it becomes selected — confirms the click with a
  // macro camera move that keeps the user's geographic orientation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedLocationKey === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const group = groups.find((g) => g.locationKey === selectedLocationKey);
    if (group) {
      map.easeTo({
        center: [group.longitude, group.latitude],
        zoom: Math.max(map.getZoom(), 9),
        duration: 500,
      });
    }
    // Only when the selection itself changes.
  }, [selectedLocationKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="absolute inset-0" aria-label="Kaart van muntvondsten" />;
}

export type { CoinRecord };
