// Writes the "Every method" page of the documentation, in each language, from
// the description of the endpoints in `scripts/api.config.mjs`.
//
//   node scripts/reference.mjs            write the pages
//   node scripts/reference.mjs --check    fail when a page is out of date
//
// Summaries are written in English in the config and translated in
// `scripts/reference.fr.json` and `scripts/reference.es.json`, keyed by the
// English sentence. Missing or unused translations stop the script.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { methods } from "../../scripts/api.config.mjs";
import { LOCALES, ROOT_LANGUAGE, SOURCE } from "../plugins/base-links.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const content = path.resolve(here, "..", "src", "content", "docs");
const check = process.argv.includes("--check");

const LANGUAGES = [SOURCE, ...[ROOT_LANGUAGE, ...LOCALES].filter((language) => language !== SOURCE)];
const folder = (language) => path.join(content, language === ROOT_LANGUAGE ? "" : language);

const sentences = {};
for (const language of LANGUAGES) {
  if (language !== SOURCE) sentences[language] = JSON.parse(await readFile(path.join(here, `reference.${language}.json`), "utf8"));
}

const GROUPS = [
  { en: "Account", fr: "Compte", es: "Cuenta", pt: "Conta", de: "Konto", prefixes: ["me."] },
  { en: "Your quests", fr: "Vos quêtes", es: "Tus misiones", pt: "Suas missões", de: "Ihre Quests", prefixes: ["quests."] },
  { en: "Monsters", fr: "Monstres", es: "Monstruos", pt: "Monstros", de: "Monster", prefixes: ["monsters."] },
  { en: "Zones", fr: "Zones", es: "Zonas", pt: "Zonas", de: "Zonen", prefixes: ["zones."] },
  { en: "Other players", fr: "Autres joueurs", es: "Otros jugadores", pt: "Outros jogadores", de: "Andere Spieler", prefixes: ["users."] },
  { en: "Conversations", fr: "Conversations", es: "Conversaciones", pt: "Conversas", de: "Unterhaltungen", prefixes: ["conversations."] },
  { en: "Trade proposals", fr: "Propositions d'échange", es: "Propuestas de intercambio", pt: "Propostas de troca", de: "Tauschvorschläge", prefixes: ["tradeProposals."] },
  { en: "Kralamoure events", fr: "Événements Kralamoure", es: "Eventos Kralamar", pt: "Eventos do Kralamor", de: "Krakamor-Events", prefixes: ["kralove."] },
  { en: "Reference data", fr: "Données de référence", es: "Datos de referencia", pt: "Dados de referência", de: "Referenzdaten", prefixes: ["gameVersions.", "servers.", "monsterTypes.", "questTypes.", "questTemplates."] },
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
  },
  es: {
    title: "Todos los métodos",
    description: `Los ${methods.length} endpoints de la API de Metamob, con el método que llama a cada uno y la página que lo explica.`,
    intro: [
      "Cada línea es un endpoint de la API: la llamada, luego el nombre que la biblioteca le da allí donde se nombra un método (ajustes de la caché, eventos, errores), y a la derecha lo que hace y la solicitud que envía.",
      "Los métodos marcados *lista* devuelven una solicitud que puedes esperar para una página o recorrer para todas, ver [Listas](/basics/lists/). El número es la página más grande que acepta la API: es el tamaño usado cuando recorres.",
      "Los métodos marcados *compartido* responden lo mismo sea cual sea la clave: su resultado se guarda en caché y se comparte entre las claves. Los demás dependen de la cuenta y solo se guardan en caché si lo pides, ver [Caché](/basics/caching/).",
    ],
    columns: ["Método", "Lo que hace"],
    list: (max, cursor) => (cursor ? `*lista*, ${max} por página, por cursor` : `*lista*, ${max} por página`),
    shared: "*compartido*",
    write: "*escritura*",
    more: "Ver",
    also: "Más allá de los endpoints",
    alsoIntro: "Algunos métodos no envían ninguna solicitud propia:",
    extras: [
      ["`metamob.monsters.search(query, { type })`", "`monsters.list` con una búsqueda, escrito de forma más corta."],
      ["`metamob.questTemplates.get(template)`", "Una plantilla de misión, tomada de `questTemplates.list`: la API no tiene un endpoint para ello."],
      ["`metamob.quests.resetTrade(slug, monster)`", "`quests.setTrade` con los dos valores devueltos al cálculo automático."],
      ["`metamob.withKey(apiKey)`", "Un cliente para otra clave, que comparte la caché, los oyentes y los ajustes de este."],
      ["`data.monster(name)` y el resto de `data`", "Los datos de referencia que vienen con el paquete, leídos en memoria."],
    ],
  },
  pt: {
    title: "Todos os métodos",
    description: `Os ${methods.length} endpoints da API do Metamob, com o método que chama cada um e a página que o explica.`,
    intro: [
      "Cada linha é um endpoint da API: a chamada, depois o nome que a biblioteca lhe dá onde quer que um método seja nomeado (ajustes do cache, eventos, erros), e à direita o que ele faz e a requisição que envia.",
      "Os métodos marcados *lista* devolvem uma requisição que você pode aguardar para uma página ou percorrer para todas, veja [Listas](/basics/lists/). O número é a maior página que a API aceita: é o tamanho usado quando você percorre.",
      "Os métodos marcados *compartilhado* respondem o mesmo seja qual for a chave: o resultado vai para o cache e é compartilhado entre as chaves. Os outros dependem da conta e só vão para o cache se você pedir, veja [Cache](/basics/caching/).",
    ],
    columns: ["Método", "O que faz"],
    list: (max, cursor) => (cursor ? `*lista*, ${max} por página, por cursor` : `*lista*, ${max} por página`),
    shared: "*compartilhado*",
    write: "*escrita*",
    more: "Veja",
    also: "Além dos endpoints",
    alsoIntro: "Alguns métodos não enviam nenhuma requisição própria:",
    extras: [
      ["`metamob.monsters.search(query, { type })`", "`monsters.list` com uma busca, escrito de forma mais curta."],
      ["`metamob.questTemplates.get(template)`", "Um modelo de missão, tirado de `questTemplates.list`: a API não tem endpoint para isso."],
      ["`metamob.quests.resetTrade(slug, monster)`", "`quests.setTrade` com os dois valores devolvidos ao cálculo automático."],
      ["`metamob.withKey(apiKey)`", "Um cliente para outra chave, que compartilha o cache, os ouvintes e os ajustes deste."],
      ["`data.monster(name)` e o resto de `data`", "Os dados de referência que vêm com o pacote, lidos na memória."],
    ],
  },
  de: {
    title: "Alle Methoden",
    description: `Die ${methods.length} Endpunkte der Metamob-API, mit der Methode, die jeden aufruft, und der Seite, die ihn erklärt.`,
    intro: [
      "Jede Zeile ist ein Endpunkt der API: der Aufruf, dann der Name, den die Bibliothek ihm überall dort gibt, wo eine Methode genannt wird (Cache-Einstellungen, Ereignisse, Fehler), und rechts, was er tut und welche Anfrage er sendet.",
      "Mit *Liste* markierte Methoden geben eine Anfrage zurück, die Sie für eine Seite abwarten oder für alle durchlaufen können, siehe [Listen](/basics/lists/). Die Zahl ist die größte Seite, die die API annimmt: Diese Größe wird beim Durchlaufen verwendet.",
      "Mit *geteilt* markierte Methoden antworten unabhängig vom Schlüssel gleich: Ihr Ergebnis wird zwischengespeichert und zwischen den Schlüsseln geteilt. Die anderen hängen vom Konto ab und werden nur auf Wunsch zwischengespeichert, siehe [Cache](/basics/caching/).",
    ],
    columns: ["Methode", "Was sie tut"],
    list: (max, cursor) => (cursor ? `*Liste*, ${max} pro Seite, per Cursor` : `*Liste*, ${max} pro Seite`),
    shared: "*geteilt*",
    write: "*schreibend*",
    more: "Siehe",
    also: "Über die Endpunkte hinaus",
    alsoIntro: "Einige Methoden senden keine eigene Anfrage:",
    extras: [
      ["`metamob.monsters.search(query, { type })`", "`monsters.list` mit einer Suche, kürzer geschrieben."],
      ["`metamob.questTemplates.get(template)`", "Eine Quest-Vorlage aus `questTemplates.list`: Die API hat dafür keinen Endpunkt."],
      ["`metamob.quests.resetTrade(slug, monster)`", "`quests.setTrade`, wobei beide Werte an die automatische Berechnung zurückgehen."],
      ["`metamob.withKey(apiKey)`", "Ein Client für einen anderen Schlüssel, der Cache, Listener und Einstellungen mit diesem teilt."],
      ["`data.monster(name)` und der Rest von `data`", "Die Referenzdaten, die mit dem Paket kommen, aus dem Speicher gelesen."],
    ],
  },
};

async function titleOf(guide, language) {
  const slug = guide.replace(/^\/|\/$/g, "");
  // An untranslated page falls back on its original.
  const source = [language, SOURCE].map((candidate) => path.join(folder(candidate), `${slug}.md`)).find((file) => existsSync(file));
  if (!source) throw new Error(`${guide}: the guide of a method has no page (${slug}.md)`);
  const match = /^title:\s*"?(.+?)"?\s*$/m.exec(await readFile(source, "utf8"));
  if (!match) throw new Error(`${slug}.md has no title`);
  return match[1];
}

let incomplete = false;
for (const [language, table] of Object.entries(sentences)) {
  const untranslated = methods.map((method) => method.summary).filter((summary) => !table[summary]);
  const unused = Object.keys(table).filter((sentence) => !methods.some((method) => method.summary === sentence));
  if (untranslated.length) console.error(`Left to translate in scripts/reference.${language}.json:\n${untranslated.map((sentence) => `  ${JSON.stringify(sentence)}`).join("\n")}`);
  if (unused.length) console.error(`Translate nothing any more, remove from scripts/reference.${language}.json:\n${unused.map((sentence) => `  ${JSON.stringify(sentence)}`).join("\n")}`);
  incomplete ||= untranslated.length > 0 || unused.length > 0;
}
if (incomplete) process.exit(1);

const cell = (text) => text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");

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
      const summary = language === SOURCE ? method.summary : sentences[language][method.summary];
      out.push(`| \`${cell(method.call)}\`<br />\`${method.id}\` | ${cell(summary)}<br />${[`\`${method.verb} ${method.path}\``, ...marks].join(", ")} |`);
    }
    out.push("");
  }
  const missing = methods.filter((method) => !listed.has(method.id));
  if (missing.length) throw new Error(`No group for: ${missing.map((method) => method.id).join(", ")}`);
  out.push(`## ${words.also}`, "", words.alsoIntro, "", "| | |", "| --- | --- |", ...words.extras.map(([name, text]) => `| ${cell(name)} | ${text} |`), "");
  return out.join("\n");
}

let stale = 0;
for (const language of LANGUAGES) {
  const file = path.join(folder(language), "resources", "methods.md");
  const next = await page(language);
  const current = existsSync(file) ? (await readFile(file, "utf8")).replace(/\r\n/g, "\n") : "";
  if (current === next) continue;
  const shown = path.relative(path.resolve(here, ".."), file).replace(/\\/g, "/");
  if (check) {
    stale++;
    console.error(`${shown} is out of date. Run "npm run reference".`);
  } else {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, next);
    console.log(`wrote ${shown}`);
  }
}
if (stale) process.exit(1);
if (check) console.log("The generated pages are up to date.");
