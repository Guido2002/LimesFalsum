# LimesFalsum

Interactive archaeological explorer for plated Roman denarii found in the
Netherlands, based on the NUMIS dataset (Nationaal Numismatisch Archief).

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · MapLibre GL JS with
OpenFreeMap (no paid map APIs) · proj4 (EPSG:28992 → EPSG:4326) · Lucide icons

## Getting started

```bash
npm install
npm run dev
```

## Data pipeline

The Excel workbook is parsed **once at build time**, never in the browser:

```bash
npm run data:build   # reads data.xlsx → src/data/generated/*
```

Outputs `coins.json`, `coins.geojson` and `dataset-summary.json`, with a CLI
summary and data-quality warnings (e.g. the known Katwijk coordinate outlier
NUMIS 1163154 — flagged, never silently corrected).

## Other commands

```bash
npm test          # vitest: dating parser, RD→WGS84, normalization, filtering, grouping
npm run build     # type-check + production build → dist/
```

## Notes on data integrity

- All 26 original NUMIS fields are preserved per record; normalized values are
  an additional layer, visible next to the raw values via "Bekijk originele
  NUMIS-gegevens" in each coin's detail view.
- Mass values of 0 g in the source are treated as *unknown* everywhere in the
  UI (a denarius never weighs nothing).
- Multiple coins sharing one exact RD coordinate are grouped into a single
  findspot (e.g. 18 coins at Vechten/Bunnik) — nothing overlaps invisibly.
- Filter state lives in the URL (`?authority=Hadrianus&province=Utrecht&from=117&to=138`,
  `?coin=1030928`), so views are shareable and back/forward works.
