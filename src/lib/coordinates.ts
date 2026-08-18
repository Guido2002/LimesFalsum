import proj4 from "proj4";

// Amersfoort / RD New — official Dutch national grid.
proj4.defs(
  "EPSG:28992",
  "+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,1.9342,-1.6677,9.1019,4.0725 +units=m +no_defs +type=crs",
);

export interface Wgs84 {
  longitude: number;
  latitude: number;
}

/**
 * Transform Dutch RD New coordinates (EPSG:28992) to WGS84 (EPSG:4326).
 * Never interpret RD values directly as lat/lon.
 */
export function rdToWgs84(rdX: number, rdY: number): Wgs84 {
  const [longitude, latitude] = proj4("EPSG:28992", "EPSG:4326", [rdX, rdY]);
  return { longitude, latitude };
}

/** Plausibility check: is this WGS84 point inside (roughly) the Netherlands? */
export function isPlausibleDutchCoordinate(w: Wgs84): boolean {
  return w.longitude > 3 && w.longitude < 7.5 && w.latitude > 50.5 && w.latitude < 54;
}
