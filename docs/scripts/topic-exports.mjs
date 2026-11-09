// Writes, at the end of each topic page of the guide, the list of the exports
// it explains: a link to the page of each in the reference, and the first
// sentence of its description, in the language of the page.
//
//   node scripts/topic-exports.mjs            write the lists
//   node scripts/topic-exports.mjs --check    fail when a list is out of date
//
// The list sits between `<!-- exports:start -->` and `<!-- exports:end -->`.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "../plugins/base-links.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..", "src", "content", "docs");
const data = path.resolve(here, "..", "src", "data");
const check = process.argv.includes("--check");

const model = JSON.parse(readFileSync(path.join(data, "api.json"), "utf8"));
const tables = { fr: JSON.parse(readFileSync(path.join(data, "api.fr.json"), "utf8")), es: JSON.parse(readFileSync(path.join(data, "api.es.json"), "utf8")) };

const KIND_ORDER = ["class", "function", "variable", "interface", "type", "enum"];
const WORDS = {
  fr: { heading: "## Référence", intro: "Chaque export a sa page dans la [référence](/reference/) :", columns: "| Export | À quoi il sert |", names: "Les noms connus du paquet, un type par langue : monstres, zones, sous-zones, types de monstre et de quête, serveurs, versions du jeu." },
  en: { heading: "## Reference", intro: "Each export has its page in the [reference](/reference/):", columns: "| Export | What it is for |", names: "The names the package knows, one type per language: monsters, zones, subzones, kinds of monster and of quest, servers, game versions." },
  es: { heading: "## Referencia", intro: "Cada export tiene su página en la [referencia](/reference/):", columns: "| Export | Para qué sirve |", names: "Los nombres que conoce el paquete, un tipo por idioma: monstruos, zonas, subzonas, tipos de monstruo y de misión, servidores, versiones del juego." },
};

/** The first sentence of a description, on one line. */
function firstSentence(text = "") {
  const paragraph = text.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  const stop = /[.!?](?=\s+[A-ZÀ-Ý`*[]|$)/g;
  for (let match; (match = stop.exec(paragraph)); ) {
    if (/\b(e\.g|i\.e|p\. ex|p\. ej)$/.test(paragraph.slice(0, match.index))) continue;
    return paragraph.slice(0, match.index + 1);
  }
  return paragraph;
}

const translate = (symbol, language) => {
  if (language === "en") return symbol.text;
  const entry = tables[language][symbol.name];
  return entry && entry.en === symbol.text && entry[language] ? entry[language] : symbol.text;
};

/** `[label](ref:Name)` becomes a link to the page of Name, and table cells keep their pipes escaped. */
const cell = (text) => text.replace(/\]\(ref:([\w$]+)\)/g, (_, name) => `](/reference/${model.symbols.find((s) => s.name === name)?.slug ?? name.toLowerCase()}/)`).replace(/\|/g, "\\|");

function list(topic, language) {
  const words = WORDS[language];
  const symbols = model.symbols
    .filter((symbol) => symbol.guide === topic)
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name, "en"));
  const names = symbols.filter((symbol) => symbol.file.endsWith("generated/names.ts"));
  const rows = symbols
    .filter((symbol) => !names.includes(symbol))
    .map((symbol) => `| [\`${symbol.name}\`](/reference/${symbol.slug}/) | ${cell(firstSentence(translate(symbol, language)))} |`);
  if (names.length > 0) rows.push(`| ${names.map((symbol) => `[\`${symbol.name}\`](/reference/${symbol.slug}/)`).join(", ")} | ${words.names} |`);
  return ["<!-- exports:start -->", words.heading, "", words.intro, "", words.columns, "| --- | --- |", ...rows, "<!-- exports:end -->"].join("\n");
}

// The page of the endpoints is written whole by scripts/reference.mjs.
const topics = [...new Set(model.symbols.map((symbol) => symbol.guide))].filter((topic) => topic !== "/resources/methods/");
const stale = [];
for (const topic of topics) {
  for (const language of ["fr", ...LOCALES]) {
    const file = path.join(docs, language === "fr" ? "" : language, `${topic.replace(/^\/|\/$/g, "")}.md`);
    if (!existsSync(file)) throw new Error(`no page for ${topic} in ${language}: ${file}`);
    const source = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    const block = list(topic, language);
    let next;
    if (source.includes("<!-- exports:start -->")) next = source.replace(/<!-- exports:start -->[\s\S]*?<!-- exports:end -->/, block);
    else {
      // First run: the hand-written reference section is replaced, up to the next section or the end.
      const at = source.indexOf(`\n${WORDS[language].heading}\n`);
      if (at === -1) next = `${source.trimEnd()}\n\n${block}\n`;
      else {
        const after = source.indexOf("\n## ", at + 1);
        next = `${source.slice(0, at + 1)}${block}\n${after === -1 ? "" : source.slice(after)}`;
      }
    }
    next = `${next.trimEnd()}\n`;
    if (next !== source) {
      if (check) stale.push(path.relative(docs, file));
      else writeFileSync(file, next);
    }
  }
}
if (check && stale.length > 0) {
  console.error(`✗ out of date, run node scripts/topic-exports.mjs:\n  ${stale.join("\n  ")}`);
  process.exit(1);
}
console.log(check ? "✓ the export lists of the topic pages are up to date" : `✓ export lists written on ${topics.length} topic pages`);
