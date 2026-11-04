// Built from code points so the pattern survives any editor or encoding.
const APOSTROPHES = new RegExp(`[${String.fromCharCode(0x2018, 0x2019, 0x60, 0xb4)}]`, "g");

const DASHES = new RegExp(`[${String.fromCharCode(0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2212)}]`, "g");

/**
 * The form names are compared in: no accents, lower case, one kind of
 * apostrophe and of dash, single spaces. `"  Tofu MALÉFIQUE "` gives `"tofu malefique"`.
 */
export function normalizeName(value: string): string {
  return value.normalize("NFD").replace(/\p{M}+/gu, "").replace(APOSTROPHES, "'").replace(DASHES, "-").toLowerCase().replace(/\s+/g, " ").trim();
}

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
    score += normalized.length / 1000 + rank * 0.6;
    const known = best.get(record);
    if (!known || score < known.score) best.set(record, { name: written, score });
  }
  return [...best.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((entry) => entry.name);
}
