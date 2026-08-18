/**
 * Normalization helpers.
 * Raw NUMIS values are always preserved on the record; these functions only
 * produce the derived "application layer" values used for facets/filters.
 */

/** Collapse whitespace and line endings without touching meaning. */
export function cleanText(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned === "" ? undefined : cleaned;
}

/** Lowercase + fold diacritics, for search indexing. */
export function foldSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingQuestionMark(value: string): { text: string; uncertain: boolean } {
  const uncertain = /\?\s*$/.test(value);
  return { text: value.replace(/\?\s*$/, "").trim(), uncertain };
}

const MINT_EQUIVALENTS: [RegExp, string][] = [
  [/^rome(\s*\(roma\))?$/i, "Rome"],
  [/^roma(\s*\(rome\))?$/i, "Rome"],
];

/** "Rome (Roma)", "Roma (Rome)" → "Rome"; trailing "?" stays visible. */
export function normalizeMint(raw: string | undefined): string | undefined {
  const cleaned = cleanText(raw);
  if (!cleaned) return undefined;
  const { text } = stripTrailingQuestionMark(cleaned);
  for (const [pattern, normalized] of MINT_EQUIVALENTS) {
    if (pattern.test(text)) return normalized;
  }
  return text;
}

export function mintIsUncertain(raw: string | undefined): boolean {
  const cleaned = cleanText(raw);
  return cleaned !== undefined && /\?\s*$/.test(cleaned);
}

/** Capitalize-first normalization: "akker"/"Akker" → "Akker". */
export function normalizeTerrain(raw: string | undefined): string | undefined {
  const cleaned = cleanText(raw);
  if (!cleaned) return undefined;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

/** detector/ja → true, "geen detector" → false, empty → undefined */
export function normalizeDetector(raw: string | undefined): boolean | undefined {
  const cleaned = cleanText(raw);
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (lower === "geen detector" || lower === "nee" || lower === "geen") return false;
  if (lower === "detector" || lower === "ja" || lower.includes("detector")) return true;
  return undefined;
}

/**
 * Status normalization — broad categories for filtering.
 * Source values are compounds like "imitatie contemporain (?); geplateerd",
 * so precedence matters: the archaeological nature (imitation, hybrid,
 * forgery) outranks the plating observation.
 */
export function normalizeStatus(raw: string | undefined): string | undefined {
  const cleaned = cleanText(raw);
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  const uncertain = lower.includes("?");
  if (lower.includes("hybride")) return uncertain ? "hybride onzeker" : "hybride";
  if (lower.includes("imitatie") || lower.includes("contemporain") || lower.includes("vervalsing")) {
    return uncertain ? "imitatie / contemporain onzeker" : "imitatie / contemporain";
  }
  if (lower.includes("geplateerd")) {
    return uncertain || lower.includes("onzeker") || lower.includes("vermoedelijk")
      ? "geplateerd onzeker"
      : "geplateerd";
  }
  return cleaned;
}

/**
 * Broad material categories; raw description stays on the record.
 * Plated denarii are typically a base-metal core with a silver surface, so
 * "koper, zilver geplateerd" is categorized by its core material.
 */
export function normalizeMaterial(raw: string | undefined): string | undefined {
  const cleaned = cleanText(raw);
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (lower.includes("ijzer")) return "ijzer";
  if (lower.includes("koper") || lower.includes("brons")) return "koperlegering";
  if (lower.includes("zilver")) return "zilver";
  if (lower.includes("goud")) return "goud";
  if (lower.includes("geplateerd")) return "geplateerd (onbekend metaal)";
  return cleaned;
}

/**
 * Split a compound authority string into individual persons.
 * "Antoninus Pius (138-161), Diva Faustina I († 141)"
 *   → ["Antoninus Pius", "Diva Faustina I"]
 * Reign dates and death markers are stripped for the facet value only.
 */
export function normalizeAuthority(raw: string | undefined): string[] {
  const cleaned = cleanText(raw);
  if (!cleaned) return [];
  return cleaned
    .split(/[,;]|\ben\b(?=\s+[A-Z])/)
    .map((part) =>
      part
        .replace(/\([^)]*\)/g, "") // "(138-161)", "(† 141)"
        .replace(/†.*$/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((part) => part.length > 1);
}

export function authorityIsUncertain(raw: string | undefined): boolean {
  const cleaned = cleanText(raw);
  return cleaned !== undefined && cleaned.includes("?");
}
