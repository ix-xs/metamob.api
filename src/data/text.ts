// Built from code points so the pattern survives any editor or encoding.
const APOSTROPHES = new RegExp(`[${String.fromCharCode(0x2018, 0x2019, 0x60, 0xb4)}]`, "g");

// A few names of the game are written with a long dash, which nobody types.
const DASHES = new RegExp(`[${String.fromCharCode(0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2212)}]`, "g");

/**
 * The form names are compared in: no accents, lower case, one kind of
 * apostrophe, one kind of dash, single spaces. `"  Tofu MALÉFIQUE "` and
 * `"tofu malefique"` give the same result.
 */
export function normalizeName(value: string): string {
  // Most names are typed without accents or capitals; the common case is cheap.
  return value.normalize("NFD").replace(/\p{M}+/gu, "").replace(APOSTROPHES, "'").replace(DASHES, "-").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Edit distance between two strings, giving up once it exceeds `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
      current.push(value);
      if (value < best) best = value;
    }
    if (best > max) return max + 1;
    previous = current;
  }
  return previous[b.length]!;
}

/**
 * The names closest to `input`, best first: the ones that start with it, the
 * ones that contain it, then the ones a typo away.
 *
 * @param names - A normalized name, the name as written, the record it
 * belongs to and the rank of the language (0 for French). A record is
 * suggested once, under its closest name; when two languages are about as
 * close, the first one wins.
 */
export function closest(input: string, names: Iterable<readonly [normalized: string, written: string, record: number, rank: number]>, limit = 3): string[] {
  const query = normalizeName(input);
  if (!query) return [];
  const tolerance = Math.max(1, Math.min(3, Math.floor(query.length / 4)));
  const best = new Map<number, { name: string; score: number }>();
  for (const [normalized, written, record, rank] of names) {
    let score: number;
    if (normalized.startsWith(query)) score = 0;
    else if (normalized.includes(query)) score = 1;
    else {
      const edits = distance(query, normalized, tolerance);
      if (edits > tolerance) continue;
      score = 1 + edits;
    }
    // Among equals, the shorter name is the closer one.
    score += normalized.length / 1000 + rank * 0.6;
    const known = best.get(record);
    if (!known || score < known.score) best.set(record, { name: written, score });
  }
  return [...best.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((entry) => entry.name);
}
