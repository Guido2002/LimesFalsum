import { describe, expect, it } from "vitest";
import {
  mintIsUncertain,
  normalizeAuthority,
  normalizeDetector,
  normalizeMint,
  normalizeTerrain,
} from "../src/lib/normalize";

describe("normalizeTerrain", () => {
  it("normalizes casing variants", () => {
    expect(normalizeTerrain("akker")).toBe("Akker");
    expect(normalizeTerrain("Akker")).toBe("Akker");
    expect(normalizeTerrain("boomgaard")).toBe("Boomgaard");
    expect(normalizeTerrain("Boomgaard")).toBe("Boomgaard");
  });
});

describe("normalizeDetector", () => {
  it("maps detector / ja to true", () => {
    expect(normalizeDetector("detector")).toBe(true);
    expect(normalizeDetector("ja")).toBe(true);
  });
  it("maps 'geen detector' to false", () => {
    expect(normalizeDetector("geen detector")).toBe(false);
  });
  it("maps empty to undefined", () => {
    expect(normalizeDetector(undefined)).toBeUndefined();
    expect(normalizeDetector("  ")).toBeUndefined();
  });
});

describe("normalizeMint", () => {
  it("normalizes Rome variants", () => {
    expect(normalizeMint("Rome (Roma)")).toBe("Rome");
    expect(normalizeMint("Roma (Rome)")).toBe("Rome");
    expect(normalizeMint("Rome")).toBe("Rome");
    expect(normalizeMint("Rome (Roma) ")).toBe("Rome");
  });
  it("keeps uncertainty detectable", () => {
    expect(mintIsUncertain("Rome?")).toBe(true);
    expect(mintIsUncertain("Rome (Roma)?")).toBe(true);
    expect(mintIsUncertain("Rome (Roma) ?")).toBe(true);
    expect(mintIsUncertain("Rome")).toBe(false);
  });
});

describe("normalizeAuthority", () => {
  it("splits compound authorities so either person matches a filter", () => {
    expect(normalizeAuthority("Antoninus Pius (138-161), Diva Faustina I († 141)")).toEqual([
      "Antoninus Pius",
      "Diva Faustina I",
    ]);
  });
  it("keeps single authorities intact minus the reign dates", () => {
    expect(normalizeAuthority("Septimius Severus (193-211)")).toEqual(["Septimius Severus"]);
  });
});
