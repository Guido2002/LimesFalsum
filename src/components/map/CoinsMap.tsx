import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { CoinRecord, LocationGroup } from "../../domain/coin";
import { addCoinLayers, COIN_SOURCE_ID, onMapClick } from "./CoinLayers";

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
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution:
          'Muntdata: <a href="https://www.nationaalnumismatischarchief.nl" target="_blank" rel="noreferrer">NUMIS</a>',
      }),
    );

    map.on("load", () => {
      addCoinLayers(map);
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
      map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 600 });
    };
    window.addEventListener("limes:fit-data", handler);
    return () => window.removeEventListener("limes:fit-data", handler);
  }, [groups]);

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

  return <div ref={containerRef} className="absolute inset-0" aria-label="Kaart van muntvondsten" />;
}

export type { CoinRecord };
