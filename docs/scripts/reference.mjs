// Writes the "Every method" page of the documentation, in each language, from
// the description of the endpoints in `scripts/api.config.mjs`.
//
//   node scripts/reference.mjs            write the pages
//   node scripts/reference.mjs --check    fail when a page is out of date
//
// The sentences that describe a method are written once, in English, in the
// config. Their French is in `scripts/reference.fr.json`, keyed by the English
// sentence: after adding or rewording one, this script stops and lists what
// is left to translate. An entry that translates nothing any more must go.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { methods } from "../../scripts/api.config.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const content = path.resolve(here, "..", "src", "content", "docs");
const check = process.argv.includes("--check");
const french = JSON.parse(await readFile(path.join(here, "reference.fr.json"), "utf8"));

/** The groups of the page, in order, with the methods whose id starts with each prefix. */
const GROUPS = [
  { en: "Account", fr: "Compte", prefixes: ["me."] },
  { en: "Your quests", fr: "Vos quêtes", prefixes: ["quests."] },
  { en: "Monsters", fr: "Monstres", prefixes: ["monsters."] },
  { en: "Zones", fr: "Zones", prefixes: ["zones."] },
  { en: "Other players", fr: "Autres joueurs", prefixes: ["users."] },
  { en: "Conversations", fr: "Conversations", prefixes: ["conversations."] },
  { en: "Kralamoure events", fr: "Événements Kralamoure", prefixes: ["kralove."] },
  { en: "Reference data", fr: "Données de référence", prefixes: ["gameVersions.", "servers.", "monsterTypes.", "questTypes.", "questTemplates."] },
];

const WORDS = {
  en: {
    title: "Every method",
    description: `The ${methods.length} endpoints of the Metamob API, with the method that calls each one and the page that explains it.`,
    intro: [
      "Each line is one endpoint of the API: the call, then the name the library gives it everywhere a method is named (cache settings, events, errors), and on the right what it does and the request it sends.",
      "Methods marked *list* return a request you can await for one page or iterate for all of them, see [Lists](/basics/lists/). The number is the largest page the API accepts, which is the size used when you iterate.",
      "Methods marked *shared* answer the same thing whatever the key, so their result is cached and shared between keys. The others depend on the account and are only cached when you ask, see [Caching](/basics/caching/).",
    ],
    columns: ["Method", "What it does"],
    list: (max, cursor) => (cursor ? `*list*, ${max} per page, by cursor` : `*list*, ${max} per page`),
    shared: "*shared*",
    write: "*write*",
    more: "Explained in",
    also: "Beyond the endpoints",
    alsoIntro: "A few methods send no request of their own:",
    extras: [
      ["`metamob.monsters.search(query, { type })`", "`monsters.list` with a search, written the short way."],
      ["`metamob.questTemplates.get(template)`", "One quest template, picked out of `questTemplates.list`: the API has no endpoint for it."],
      ["`metamob.quests.resetTrade(slug, monster)`", "`quests.setTrade` with both values handed back to the automatic calculation."],
      ["`metamob.withKey(apiKey)`", "A client for another key, sharing the cache, the listeners and the settings of this one."],
      ["`data.monster(name)` and the rest of `data`", "The reference data that ships with the package, answered from memory."],
    ],
    seeAlso: "See also",
    links: ["[All exports](/reference/exports/)", "[Error codes](/reference/errors/)", "[The data in the package](/basics/embedded-data/)"],
  },
  fr: {
    title: "Toutes les méthodes",
    description: `Les ${methods.length} points d'accès de l'API Metamob, avec la méthode qui appelle chacun et la page qui l'explique.`,
    intro: [
      "Chaque ligne est un point d'accès de l'API : l'appel, puis le nom que la bibliothèque lui donne partout où une méthode est nommée (réglages du cache, événements, erreurs), et à droite ce qu'elle fait et la requête qu'elle envoie.",
      "Les méthodes marquées *liste* renvoient une requête à attendre pour une page ou à parcourir pour toutes, voir [Listes](/basics/lists/). Le nombre est la plus grande page que l'API accepte : c'est la taille utilisée quand vous parcourez.",
      "Les méthodes marquées *partagée* répondent la même chose quelle que soit la clé : leur résultat est mis en cache et partagé entre les clés. Les autres dépendent du compte et ne sont mises en cache que sur demande, voir [Cache](/basics/caching/).",
    ],
    columns: ["Méthode", "Ce qu'elle fait"],
    list: (max, cursor) => (cursor ? `*liste*, ${max} par page, par curseur` : `*liste*, ${max} par page`),
    shared: "*partagée*",
    write: "*écriture*",
    more: "Voir",
    also: "Au-delà des points d'accès",
    alsoIntro: "Quelques méthodes n'envoient aucune requête qui leur soit propre :",
    extras: [
      ["`metamob.monsters.search(query, { type })`", "`monsters.list` avec une recherche, en plus court."],
      ["`metamob.questTemplates.get(template)`", "Un modèle de quête, pris dans `questTemplates.list` : l'API n'a pas de point d'accès pour cela."],
      ["`metamob.quests.resetTrade(slug, monster)`", "`quests.setTrade` avec les deux valeurs rendues au calcul automatique."],
      ["`metamob.withKey(apiKey)`", "Un client pour une autre clé, qui partage le cache, les écouteurs et les réglages de celui-ci."],
      ["`data.monster(name)` et le reste de `data`", "Les données de référence livrées avec le paquet, lues en mémoire."],
    ],
    seeAlso: "Voir aussi",
    links: ["[Tous les exports](/reference/exports/)", "[Codes d'erreur](/reference/errors/)", "[Les données du paquet](/basics/embedded-data/)"],
  },
};

/** The title of a docs page, in a language, to name the guide of a method. */
async function titleOf(guide, language) {
  const slug = guide.replace(/^\/|\/$/g, "");
  const file = path.join(content, language === "en" ? "" : language, `${slug}.md`);
  const fallback = path.join(content, `${slug}.md`);
  const source = existsSync(file) ? file : existsSync(fallback) ? fallback : undefined;
  if (!source) throw new Error(`${guide}: the guide of a method has no page (${slug}.md)`);
  const match = /^title:\s*"?(.+?)"?\s*$/m.exec(await readFile(source, "utf8"));
  if (!match) throw new Error(`${slug}.md has no title`);
  return match[1];
}

const untranslated = methods.map((method) => method.summary).filter((summary) => !french[summary]);
const unused = Object.keys(french).filter((sentence) => !methods.some((method) => method.summary === sentence));
if (untranslated.length || unused.length) {
  if (untranslated.length) console.error(`Left to translate in scripts/reference.fr.json:\n${untranslated.map((sentence) => `  ${JSON.stringify(sentence)}`).join("\n")}`);
  if (unused.length) console.error(`Translate nothing any more, remove from scripts/reference.fr.json:\n${unused.map((sentence) => `  ${JSON.stringify(sentence)}`).join("\n")}`);
  process.exit(1);
}

const cell = (text) => text.replace(/\|/g, "\\|");

async function page(language) {
  const words = WORDS[language];
  const out = ["---", `title: ${words.title}`, `description: ${words.description}`, "---", "", `<!-- Generated by docs/scripts/reference.mjs. Do not edit: change scripts/api.config.mjs and run "npm run reference". -->`, "", ...words.intro.flatMap((line) => [line, ""])];
  const listed = new Set();
  for (const group of GROUPS) {
    const members = methods.filter((method) => group.prefixes.some((prefix) => method.id.startsWith(prefix)));
    if (!members.length) continue;
    const guides = [...new Set(members.map((method) => method.guide))];
    const named = await Promise.all(guides.map(async (guide) => `[${await titleOf(guide, language)}](${guide})`));
    out.push(`## ${group[language]}`, "", `${words.more} ${named.join(", ")}.`, "", `| ${words.columns.join(" | ")} |`, "| --- | --- |");
    for (const method of members) {
      listed.add(method.id);
      const marks = [method.verb === "PATCH" ? words.write : "", method.paged ? words.list(method.paged.max, method.paged.cursor) : "", method.scope === "public" ? words.shared : ""].filter(Boolean);
      const summary = language === "en" ? method.summary : french[method.summary];
      out.push(`| \`${cell(method.call)}\`<br />\`${method.id}\` | ${cell(summary)}<br />${[`\`${method.verb} ${method.path}\``, ...marks].join(", ")} |`);
    }
    out.push("");
  }
  const missing = methods.filter((method) => !listed.has(method.id));
  if (missing.length) throw new Error(`No group for: ${missing.map((method) => method.id).join(", ")}`);
  out.push(`## ${words.also}`, "", words.alsoIntro, "", "| | |", "| --- | --- |", ...words.extras.map(([name, text]) => `| ${cell(name)} | ${text} |`), "");
  out.push(`## ${words.seeAlso}`, "", ...words.links.map((link) => `- ${link}`), "");
  return out.join("\n");
}

let stale = 0;
for (const language of ["en", "fr"]) {
  const file = path.join(content, language === "en" ? "" : language, "reference", "methods.md");
  const next = await page(language);
  const current = existsSync(file) ? (await readFile(file, "utf8")).replace(/\r\n/g, "\n") : "";
  if (current === next) continue;
  if (check) {
    stale++;
    console.error(`${path.relative(path.resolve(here, ".."), file).replace(/\\/g, "/")} is out of date. Run "npm run reference".`);
  } else {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, next);
    console.log(`wrote ${path.relative(path.resolve(here, ".."), file).replace(/\\/g, "/")}`);
  }
}
if (stale) process.exit(1);
if (check) console.log("The generated pages are up to date.");
