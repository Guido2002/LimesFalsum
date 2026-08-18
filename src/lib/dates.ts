/**
 * Dating parser for NUMIS "datering" values such as:
 *   (193-211) → 193, 211, false
 *   (193)     → 193, 193, false
 *   (98-117) (?) → 98, 117, true
 *   (222-222) → 222, 222, false
 * The raw value is always kept on the record; this only derives filter values.
 */

export interface ParsedDating {
  dateStart?: number;
  dateEnd?: number;
  uncertain: boolean;
}

const YEAR = /\d{2,4}/g;

export function parseDating(raw: string | undefined | null): ParsedDating {
  if (!raw) return { uncertain: false };

  const uncertain = /\?/.test(raw) || /\bof later\b/i.test(raw);
  // Strip uncertainty markers before extracting years so "(98-117) (?)"
  // doesn't yield a phantom year.
  const cleaned = raw
    .replace(/\(\?\)/g, "")
    .replace(/\?/g, "")
    .replace(/\bof later\b/i, "");

  // "(na 161)" — only a lower bound is known.
  const naMatch = /\bna\s+(\d{2,4})/i.exec(cleaned);
  if (naMatch) {
    const year = parseInt(naMatch[1], 10);
    return { dateStart: year, dateEnd: undefined, uncertain: true };
  }

  const years = (cleaned.match(YEAR) ?? [])
    .map((y) => parseInt(y, 10))
    .filter((y) => y > 0 && y < 1000);

  if (years.length === 0) return { uncertain };
  if (years.length === 1) {
    return { dateStart: years[0], dateEnd: years[0], uncertain };
  }
  const dateStart = Math.min(years[0], years[1]);
  const dateEnd = Math.max(years[0], years[1]);
  return { dateStart, dateEnd, uncertain };
}

/** Format parsed dating for display, e.g. "132–134 n.Chr." */
export function formatDating(
  dateStart: number | undefined,
  dateEnd: number | undefined,
): string {
  if (dateStart === undefined) return "Onbekend";
  if (dateEnd === undefined || dateEnd === dateStart) return `${dateStart} n.Chr.`;
  return `${dateStart}–${dateEnd} n.Chr.`;
}
