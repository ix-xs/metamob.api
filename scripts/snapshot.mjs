// Reading and writing `scripts/data/snapshot.json`, the pinned copy of the
// reference data of the API (monsters, zones, servers...). The file is written
// one record per line, so a game update shows up as a readable diff.

import { readFile, writeFile } from "node:fs/promises";

export const SNAPSHOT_URL = new URL("./data/snapshot.json", import.meta.url);

/** The collections of a snapshot, in the order they are written. */
export const COLLECTIONS = ["gameVersions", "monsterTypes", "questTypes", "servers", "questTemplates", "zones", "subzones", "monsters"];

// A few names of the game hold a long dash and a non-breaking space. They are
// kept as the API gives them, written as escapes: the files stay plain to read and to diff, and the
// repository's own rule against long dashes in prose keeps a single meaning.
const LONG_DASHES = new RegExp(`[${String.fromCharCode(0xa0, 0x2013, 0x2014)}]`, "g");
const BACKSLASH = String.fromCharCode(92);

/** JSON or source text with its long dashes and non-breaking spaces written as unicode escapes. */
export function escapeDashes(text) {
  return text.replace(LONG_DASHES, (dash) => `${BACKSLASH}u${dash.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

/** @returns {Promise<Record<string, any>>} */
export async function loadSnapshot() {
  return JSON.parse(await readFile(SNAPSHOT_URL, "utf8"));
}

/** Records sorted by id, so the order the API lists them in never shows up as a change. */
export function normalize(snapshot) {
  const out = { fetchedAt: snapshot.fetchedAt };
  for (const name of COLLECTIONS) out[name] = [...(snapshot[name] ?? [])].sort((a, b) => a.id - b.id);
  for (const subzone of out.subzones) subzone.monsters = [...new Set(subzone.monsters)].sort((a, b) => a - b);
  return out;
}

export function serialize(snapshot) {
  const data = normalize(snapshot);
  const lines = ["{", `  "fetchedAt": ${JSON.stringify(data.fetchedAt)},`];
  COLLECTIONS.forEach((name, index) => {
    lines.push(`  ${JSON.stringify(name)}: [`);
    data[name].forEach((record, position) => lines.push(`    ${JSON.stringify(record)}${position < data[name].length - 1 ? "," : ""}`));
    lines.push(`  ]${index < COLLECTIONS.length - 1 ? "," : ""}`);
  });
  lines.push("}", "");
  return escapeDashes(lines.join("\n"));
}

export async function saveSnapshot(snapshot) {
  await writeFile(SNAPSHOT_URL, serialize(snapshot));
}

/** What differs between two snapshots, as lines a person can read. `fetchedAt` is ignored. */
export function diff(before, after) {
  const lines = [];
  const label = (record) => (typeof record.name === "string" ? record.name : (record.name?.fr ?? `#${record.id}`));
  for (const name of COLLECTIONS) {
    const old = new Map((before[name] ?? []).map((record) => [record.id, record]));
    const now = new Map((after[name] ?? []).map((record) => [record.id, record]));
    for (const [id, record] of now) {
      const previous = old.get(id);
      if (!previous) lines.push(`+ ${name} #${id} ${label(record)}`);
      else if (JSON.stringify(previous) !== JSON.stringify(record)) lines.push(`~ ${name} #${id} ${label(record)}`);
    }
    for (const [id, record] of old) if (!now.has(id)) lines.push(`- ${name} #${id} ${label(record)}`);
  }
  return lines;
}
