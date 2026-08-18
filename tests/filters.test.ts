import { describe, expect, it } from "vitest";
import type { CoinRecord } from "../src/domain/coin";
import { EMPTY_FILTERS } from "../src/domain/filters";
import { groupByLocation } from "../src/lib/grouping";
import { filterCoins } from "../src/lib/search";

function coin(overrides: Partial<CoinRecord>): CoinRecord {
  return {
    numisId: 1,
    province: "Utrecht",
    municipality: "Bunnik",
    authorityRaw: "Hadrianus (117-138)",
    statusRaw: "geplateerd",
    objectRaw: "denarius",
    materialRaw: "zilver",
    datingRaw: "(117-138)",
    rdX: 139000,
    rdY: 452000,
    longitude: 5.17,
    latitude: 52.06,
    dateStart: 117,
    dateEnd: 138,
    dateUncertain: false,
    authorityNormalized: ["Hadrianus"],
    statusNormalized: "geplateerd",
    locationKey: "139000:452000",
    hasKnownMass: false,
    searchText: "hadrianus bunnik utrecht 1",
    dataQualityFlags: [],
    ...overrides,
  };
}

const coins: CoinRecord[] = [
  coin({ numisId: 1 }),
  coin({
    numisId: 2,
    province: "Gelderland",
    municipality: "Nijmegen",
    authorityNormalized: ["Trajanus"],
    authorityRaw: "Trajanus (98-117)",
    dateStart: 98,
    dateEnd: 117,
    rdX: 187000,
    rdY: 426000,
    locationKey: "187000:426000",
    searchText: "trajanus nijmegen gelderland 2",
  }),
  coin({
    numisId: 3,
    findCharacter: "schatvondst",
    detectorUsed: true,
    hasKnownMass: true,
    massGram: 2.4,
    panId: "PAN-00012345",
    searchText: "hadrianus bunnik utrecht 3 pan-00012345",
  }),
  coin({ numisId: 4, findCharacter: "losse vondst", detectorUsed: false }),
];

describe("filterCoins", () => {
  it("filters by province", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, provinces: ["Utrecht"] });
    expect(result.map((c) => c.numisId)).toEqual([1, 3, 4]);
  });

  it("filters by normalized authority", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, authorities: ["Trajanus"] });
    expect(result.map((c) => c.numisId)).toEqual([2]);
  });

  it("applies date-range intersection", () => {
    // 100–110 overlaps Trajanus (98–117) but not Hadrianus (117–138)
    const result = filterCoins(coins, { ...EMPTY_FILTERS, dateFrom: 100, dateTo: 110 });
    expect(result.map((c) => c.numisId)).toEqual([2]);
  });

  it("boundary years count as overlap", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, dateFrom: 117, dateTo: 117 });
    expect(result.map((c) => c.numisId)).toEqual([1, 2, 3, 4]);
  });

  it("filters by find character", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, findCharacters: ["schatvondst"] });
    expect(result.map((c) => c.numisId)).toEqual([3]);
  });

  it("filters by detector", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, detectors: ["met"] });
    expect(result.map((c) => c.numisId)).toEqual([3]);
  });

  it("PAN toggle only keeps records with a PAN id", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, onlyWithPan: true });
    expect(result.map((c) => c.numisId)).toEqual([3]);
  });

  it("mass filter ignores zero/unknown mass records", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, massMin: 0, massMax: 5 });
    expect(result.map((c) => c.numisId)).toEqual([3]);
  });

  it("global search matches folded text", () => {
    const result = filterCoins(coins, { ...EMPTY_FILTERS, search: "PAN-00012345" });
    expect(result.map((c) => c.numisId)).toEqual([3]);
  });
});

describe("groupByLocation", () => {
  it("groups coins sharing identical RD coordinates into one location", () => {
    const groups = groupByLocation(coins);
    expect(groups).toHaveLength(2);
    const bunnik = groups.find((g) => g.locationKey === "139000:452000");
    expect(bunnik?.coins.map((c) => c.numisId)).toEqual([1, 3, 4]);
  });
});
