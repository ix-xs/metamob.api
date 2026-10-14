// What the playground of the landing page shows: for each of its four trials,
// the call you would write and what the library answers. Shared by the page
// (first render) and the browser (every change), so the two cannot disagree.
//
// Everything comes from the library's own data set and its own name matching:
// the playground says what the library does.

import type { Dataset, Monster, QuestTemplate } from "../../../src/index.js";
import { normalizeName } from "../../../src/data/text.js";

/** The words of the playground, in the language of the page. */
export interface FinderLabels {
  /** The language names are shown in: the one of the page. */
  language: "fr" | "en" | "es";
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
  /** "{count} monsters match, here are the first {shown}." */
  found: string;
  foundAll: string;
  nothing: string;
  level: string;
  livesIn: string;
  nowhere: string;
  rare: string;
  rareOf: string;
  askedBy: string;
  step: string;
  /** "{count} monsters at step {step} of {steps}." */
  atStep: string;
  more: string;
}

export interface FinderView {
  /** The call, as highlighted HTML. */
  code: string;
  /** What comes back, as HTML. */
  result: string;
}

/** The kinds of monsters the search can be narrowed to. Empty for all of them. */
export type FinderKind = "" | "monstre" | "boss" | "archimonstre";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (text: string) => text.replace(/[&<>"']/g, (character) => ESCAPES[character]!);
const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (whole, name: string) => String(values[name] ?? whole));

const k = (text: string) => `<span class="nf-k">${text}</span>`;
const s = (text: string) => `<span class="nf-s">${escape(JSON.stringify(text))}</span>`;
const n = (text: string | number) => `<span class="nf-n">${text}</span>`;
const p = (text: string) => `<span class="nf-p">${text}</span>`;
const c = (text: string) => `<span class="nf-c">${escape(text)}</span>`;

const row = (path: string, value: string) => `<li class="nf-row"><code>${path}</code><span class="nf-v">${value}</span></li>`;
const line = (name: string, value: string) => `<li class="nf-row"><span class="nf-name">${escape(name)}</span><span class="nf-v">${escape(value)}</span></li>`;
const pick = (text: string) => `<button type="button" class="nf-pick at-press" data-nf-fill="${escape(text)}">${escape(text)}</button>`;
const how = (text: string) => `<p class="nf-how">${escape(text)}</p>`;
const note = (text: string) => `<p class="nf-note">${escape(text)}</p>`;
const label = (text: string) => `<p class="nf-label">${escape(text)}</p>`;
const rows = (items: string[]) => `<ul class="nf-rows">${items.join("")}</ul>`;

/** A monster in a list: what kind it is and its levels. */
const facts = (monster: Monster, labels: FinderLabels) => `${monster.type?.name[labels.language] ?? ""}, ${labels.level} ${monster.level_min === monster.level_max ? monster.level_min : `${monster.level_min}-${monster.level_max}`}`;

/** The versions of the game a monster exists in, from the quests that ask for it. */
function versions(data: Dataset, monster: Monster): string[] {
  return [...new Set(data.templatesOf(monster.id).map((template) => template.game_version?.name ?? ""))].filter(Boolean);
}

/** A call written one argument per line, as a formatter writes a long one: the pane keeps its shape whatever is typed. */
function call(head: string, args: string[], after = ""): string {
  const lines = [`${head}${p("(")}`, ...args.map((argument) => `  ${argument}${p(",")}`), p(");")];
  if (after) lines.push("", c(`// ${after}`));
  return lines.join("\n");
}
const get = `${k("const")} monster ${p("=")} ${k("await")} metamob${p(".")}monsters${p(".")}get`;
const member = (name: string) => `data${p(".")}${name}`;

/** What to show for a name nobody has: the error the library throws, and what could have been meant. */
function unknown(text: string, data: Dataset, labels: FinderLabels): string {
  const close = data.suggest("monster", text, 3);
  const containing = data.searchMonsters(text, { limit: 6 }).map((monster) => monster.name.fr).filter((name) => !close.includes(name));
  const hint = close.length ? ` Did you mean ${close.map((name) => `"${name}"`).join(", ")}?` : "";
  let result = `${how(labels.unknown)}<p class="nf-error">Unknown monster "${escape(text)}".${escape(hint)}</p>`;
  if (close.length) result += `${label(labels.meant)}<div class="nf-picks">${close.map(pick).join("")}</div>`;
  if (containing.length) result += `${label(labels.contains)}<div class="nf-picks">${containing.map(pick).join("")}</div>`;
  return result;
}

function card(data: Dataset, monster: Monster, matched: string): string {
  const zones = data.zonesOf(monster.id).map((zone) => zone.name.fr);
  const rare = data.archmonstersOf(monster.id).map((arch) => arch.name.fr);
  return (
    how(matched) +
    rows([
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
    ])
  );
}

/** How a name led to a monster: which language, and whether it was written exactly. */
function matched(monster: Monster, text: string, labels: FinderLabels): string {
  const wanted = text.trim();
  const language = (["fr", "en", "es"] as const).find((code) => normalizeName(monster.name[code]) === normalizeName(wanted)) ?? "fr";
  return `${labels[language]}, ${monster.name[language] === wanted ? labels.exact : labels.loose}`;
}

/** Trial 1: a monster from whatever was typed, the way `metamob.monsters.get()` reads it. */
export function view(input: string, data: Dataset, labels: FinderLabels): FinderView {
  const text = input.trim();
  if (!text) return { code: call(get, [p('""')]), result: note(labels.empty) };

  if (/^\d+$/.test(text)) {
    const monster = data.monster(Number(text));
    if (!monster) return { code: call(get, [n(text)], `${labels.throws} "NOT_FOUND"`), result: note(labels.noId) };
    return { code: call(get, [n(text)]), result: card(data, monster, labels.id) };
  }

  const found = data.monstersNamed(text);
  if (found.length === 1) return { code: call(get, [s(text)]), result: card(data, found[0]!, matched(found[0]!, text, labels)) };

  if (found.length > 1) {
    const first = versions(data, found[0]!)[0];
    return {
      code: call(get, first ? [s(text), `${p("{")} gameVersion${p(":")} ${s(first)} ${p("}")}`] : [s(text)]),
      result: how(labels.ambiguous) + rows(found.map((monster) => row(`#${monster.id}`, escape(versions(data, monster).join(", "))))),
    };
  }
  return { code: call(get, [s(text)], `${labels.throws} "UNKNOWN_NAME"`), result: unknown(text, data, labels) };
}

/** Trial 2: what an autocomplete would offer, with `data.searchMonsters()`. */
export function searchView(input: string, kind: FinderKind, data: Dataset, labels: FinderLabels): FinderView {
  const text = input.trim();
  const SHOWN = 8;
  const options = kind ? `${p("{")} type${p(":")} ${s(kind)}${p(",")} limit${p(":")} ${n(SHOWN)} ${p("}")}` : `${p("{")} limit${p(":")} ${n(SHOWN)} ${p("}")}`;
  const code = call(`${k("const")} found ${p("=")} ${member("searchMonsters")}`, [s(text), options]);
  if (!text) return { code, result: note(labels.empty) };

  const all = data.searchMonsters(text, kind ? { type: kind, limit: 1000 } : { limit: 1000 });
  if (!all.length) {
    const close = data.suggest("monster", text, 3);
    return { code, result: how(labels.nothing) + (close.length ? `${label(labels.meant)}<div class="nf-picks">${close.map(pick).join("")}</div>` : "") };
  }
  const summary = all.length > SHOWN ? fill(labels.found, { count: all.length, shown: SHOWN }) : fill(labels.foundAll, { count: all.length });
  return { code, result: how(summary) + rows(all.slice(0, SHOWN).map((monster) => line(monster.name[labels.language], facts(monster, labels)))) };
}

/** Trial 3: where a monster lives and which quests ask for it, from the links of the data set. */
export function whereView(input: string, data: Dataset, labels: FinderLabels): FinderView {
  const text = input.trim();
  const code = [`${k("const")} monster ${p("=")} ${member("monster")}${p("(")}${text ? s(text) : p('""')}${p(");")}`, "", `${member("subzonesOf")}${p("(")}monster${p(");")}`, `${member("archmonstersOf")}${p("(")}monster${p(");")}`, `${member("templatesOf")}${p("(")}monster${p(");")}`].join("\n");
  if (!text) return { code, result: note(labels.empty) };

  const monster = /^\d+$/.test(text) ? data.monster(Number(text)) : data.monster(text);
  if (!monster) return { code, result: /^\d+$/.test(text) ? note(labels.noId) : unknown(text, data, labels) };

  const name = monster.name[labels.language];
  let result = how(`${name}, ${facts(monster, labels)}`);
  const subzones = data.subzonesOf(monster.id);
  result += label(labels.livesIn);
  result += subzones.length ? rows(subzones.map((subzone) => line(subzone.zone.name[labels.language], subzone.name[labels.language]))) : note(labels.nowhere);

  const rare = data.archmonstersOf(monster.id);
  if (rare.length) result += label(labels.rare) + rows(rare.map((arch) => line(arch.name[labels.language], facts(arch, labels))));
  if (monster.reference) result += label(labels.rareOf) + rows([line(monster.reference.name[labels.language], "")]);

  const templates = data.templatesOf(monster.id);
  if (templates.length) {
    result += label(labels.askedBy);
    result += rows(templates.map((template) => line(`${template.quest_type?.name[labels.language] ?? ""}, ${template.game_version?.name ?? ""}`, `${labels.step} ${data.stepOf(monster.id, template.id) ?? "?"}`)));
  }
  return { code, result };
}

/** Trial 4: what a step of a quest asks for, with `data.templateMonsters()`. */
export function questView(template: QuestTemplate | undefined, step: number, data: Dataset, labels: FinderLabels): FinderView {
  const SHOWN = 8;
  if (!template) return { code: "", result: note(labels.empty) };
  // The quest is written on lines of its own: with its version of the game it would not fit on one.
  const reference = [p("{"), `    questType${p(":")} ${s(template.quest_type?.slug ?? "")}${p(",")}`, `    gameVersion${p(":")} ${s(template.game_version?.name ?? "")}${p(",")}`, `  ${p("}")}`].join("\n");
  const code = call(`${k("const")} monsters ${p("=")} ${member("templateMonsters")}`, [reference, `${p("{")} step${p(":")} ${n(step)} ${p("}")}`]);
  const monsters = data.templateMonsters(template.id, { step });
  let result = how(fill(labels.atStep, { count: monsters.length, step, steps: template.step_count }));
  result += rows(monsters.slice(0, SHOWN).map((monster) => line(monster.name[labels.language], facts(monster, labels))));
  if (monsters.length > SHOWN) result += note(fill(labels.more, { count: monsters.length - SHOWN }));
  return { code, result };
}
