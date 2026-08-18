import { describe, expect, it } from "vitest";
import { parseDating } from "../src/lib/dates";

describe("parseDating", () => {
  it("parses a simple range", () => {
    expect(parseDating("(193-211)")).toEqual({ dateStart: 193, dateEnd: 211, uncertain: false });
  });

  it("parses a single year", () => {
    expect(parseDating("(193)")).toEqual({ dateStart: 193, dateEnd: 193, uncertain: false });
  });

  it("parses an uncertain range", () => {
    expect(parseDating("(98-117) (?)")).toEqual({ dateStart: 98, dateEnd: 117, uncertain: true });
  });

  it("parses a collapsed range", () => {
    expect(parseDating("(222-222)")).toEqual({ dateStart: 222, dateEnd: 222, uncertain: false });
  });

  it("parses an open-ended 'na' dating as lower bound only", () => {
    expect(parseDating("(na 161)")).toEqual({ dateStart: 161, dateEnd: undefined, uncertain: true });
  });

  it("parses 'of later' as uncertain", () => {
    expect(parseDating("(128-137 of later)")).toEqual({
      dateStart: 128,
      dateEnd: 137,
      uncertain: true,
    });
  });

  it("handles missing values", () => {
    expect(parseDating(undefined)).toEqual({ uncertain: false });
    expect(parseDating("")).toEqual({ uncertain: false });
  });
});
