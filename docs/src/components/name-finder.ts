// What the playground of the landing page shows for a piece of text: the call
// you would write, and what the library makes of it. Shared by the page (first
// render) and the browser (every keystroke), so the two cannot disagree.
//
// Everything comes from the library's own data set and its own name matching:
// the playground says what `metamob.monsters.get()` does.

import type { Dataset, Monster } from "../../../src/index.js";
import { normalizeName } from "../../../src/data/text.js";

/** The words of the playground, in the language of the page. */
export interface FinderLabels {
  id: string;
  fr: string;
  en: string;
  es: string;
  loose: string;
  exact: string;
  ambiguous: string;
  unknown: string;
  meant: string;
  contains: string;
  empty: string;
  noId: string;
  throws: string;
}

export interface FinderView {
  /** The call, as highlighted HTML. */
  code: string;
  /** What comes back, as HTML. */
  result: string;
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (text: string) => text.replace(/[&<>"']/g, (character) => ESCAPES[character]!);

const k = (text: string) => `<span class="nf-k">${text}</span>`;
const s = (text: string) => `<span class="nf-s">${escape(JSON.stringify(text))}</span>`;
const n = (text: string | number) => `<span class="nf-n">${text}</span>`;
const p = (text: string) => `<span class="nf-p">${text}</span>`;
const c = (text: string) => `<span class="nf-c">${escape(text)}</span>`;

const row = (path: string, value: string) => `<li class="nf-row"><code>${path}</code><span class="nf-v">${value}</span></li>`;
const pick = (text: string) => `<button type="button" class="nf-pick at-press" data-nf-fill="${escape(text)}">${escape(text)}</button>`;

/** The versions of the game a monster exists in, from the quests that ask for it. */
function versions(data: Dataset, monster: Monster): string[] {
  return [...new Set(data.templatesOf(monster.id).map((template) => template.game_version?.name ?? ""))].filter(Boolean);
}

function call(argument: string, extra = "", note = ""): string {
  // One argument per line, as a formatter writes a long call: the pane keeps
  // its shape whatever the length of the name.
  const lines = [`${k("const")} monster ${p("=")} ${k("await")} metamob${p(".")}monsters${p(".")}get${p("(")}`, `  ${argument}${p(",")}`];
  if (extra) lines.push(`  ${p("{")} ${extra} ${p("},")}`);
  lines.push(p(");"));
  if (note) lines.push("", c(`// ${note}`));
  return lines.join("\n");
}

function card(data: Dataset, monster: Monster, how: string): string {
  const zones = data.zonesOf(monster.id).map((zone) => zone.name.fr);
  const rare = data.archmonstersOf(monster.id).map((arch) => arch.name.fr);
  const rows = [
    row("monster.id", n(monster.id)),
    row("monster.name.fr", s(monster.name.fr)),
    row("monster.name.en", s(monster.name.en)),
    row("monster.name.es", s(monster.name.es)),
    monster.type ? row("monster.type.name.fr", s(monster.type.name.fr)) : "",
    row("monster.level_min", n(monster.level_min)),
    row("monster.level_max", n(monster.level_max)),
    monster.reference ? row("monster.reference.name.fr", s(monster.reference.name.fr)) : "",
    zones.length ? row("data.zonesOf(monster)", escape(zones.join(", "))) : "",
    rare.length ? row("data.archmonstersOf(monster)", escape(rare.join(", "))) : "",
  ];
  return `<p class="nf-how">${escape(how)}</p><ul class="nf-rows">${rows.join("")}</ul>`;
}

/** How a name led to a monster: which language, and whether it was written exactly. */
function matched(data: Dataset, monster: Monster, text: string, labels: FinderLabels): string {
  const wanted = text.trim();
  const language = (["fr", "en", "es"] as const).find((code) => normalizeName(monster.name[code]) === normalizeName(wanted)) ?? "fr";
  const exact = monster.name[language] === wanted;
  return `${labels[language]}, ${exact ? labels.exact : labels.loose}`;
}

export function view(input: string, data: Dataset, labels: FinderLabels): FinderView {
  const text = input.trim();
  if (!text) return { code: call(p('""')), result: `<p class="nf-note">${escape(labels.empty)}</p>` };

  if (/^\d+$/.test(text)) {
    const monster = data.monster(Number(text));
    if (!monster) return { code: call(n(text), "", `${labels.throws} "NOT_FOUND"`), result: `<p class="nf-note">${escape(labels.noId)}</p>` };
    return { code: call(n(text)), result: card(data, monster, labels.id) };
  }

  const found = data.monstersNamed(text);
  if (found.length === 1) return { code: call(s(text)), result: card(data, found[0]!, matched(data, found[0]!, text, labels)) };

  if (found.length > 1) {
    const first = versions(data, found[0]!)[0];
    const list = found.map((monster) => row(`#${monster.id}`, escape(versions(data, monster).join(", ")))).join("");
    return {
      code: call(s(text), first ? `gameVersion${p(":")} ${s(first)}` : ""),
      result: `<p class="nf-how">${escape(labels.ambiguous)}</p><ul class="nf-rows">${list}</ul>`,
    };
  }

  const close = data.suggest("monster", text, 3);
  const containing = data.searchMonsters(text, { limit: 6 }).map((monster) => monster.name.fr).filter((name) => !close.includes(name));
  const hint = close.length ? ` Did you mean ${close.map((name) => `"${name}"`).join(", ")}?` : "";
  let result = `<p class="nf-how">${escape(labels.unknown)}</p><p class="nf-error">Unknown monster "${escape(text)}".${escape(hint)}</p>`;
  if (close.length) result += `<p class="nf-label">${escape(labels.meant)}</p><div class="nf-picks">${close.map(pick).join("")}</div>`;
  if (containing.length) result += `<p class="nf-label">${escape(labels.contains)}</p><div class="nf-picks">${containing.map(pick).join("")}</div>`;
  return { code: call(s(text), "", `${labels.throws} "UNKNOWN_NAME"`), result };
}
