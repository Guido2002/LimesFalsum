import { describe, expect, it } from "vitest";
import { isPlausibleDutchCoordinate, rdToWgs84 } from "../src/lib/coordinates";

describe("rdToWgs84", () => {
  it("transforms the RD origin (Amersfoort) to ~52.16N, 5.39E", () => {
    const w = rdToWgs84(155000, 463000);
    expect(w.latitude).toBeCloseTo(52.156, 2);
    expect(w.longitude).toBeCloseTo(5.388, 2);
  });

  it("transforms the Vechten/Bunnik hoard coordinate into the Netherlands", () => {
    const w = rdToWgs84(139000, 452000);
    expect(isPlausibleDutchCoordinate(w)).toBe(true);
    // Vechten lies near 52.06N, 5.17E
    expect(w.latitude).toBeGreaterThan(51.9);
    expect(w.latitude).toBeLessThan(52.2);
    expect(w.longitude).toBeGreaterThan(5.0);
    expect(w.longitude).toBeLessThan(5.4);
  });

  it("flags coordinates that land outside the Netherlands", () => {
    // Far into the North Sea — west of any Dutch findspot.
    expect(isPlausibleDutchCoordinate(rdToWgs84(-100000, 463000))).toBe(false);
  });
});
