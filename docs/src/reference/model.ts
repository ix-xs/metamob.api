// The API reference: one page per export of the package, built from
// `src/data/api.json` (written by `scripts/api-model.mjs` from the source).
import api from "../data/api.json";

/** A piece of code: plain text, or text linked to a page. */
export type Token = [string] | [string, { ref?: string; href?: string; external?: string }];

export interface Doc {
  text?: string;
  examples?: string[];
  deprecated?: string | true;
  default?: string;
  see?: string[];
}

export interface Param extends Doc {
  name: string;
  type: Token[];
  optional?: boolean;
  rest?: boolean;
  default?: string;
  doc?: string;
  fields?: Property[];
}

export interface Signature {
  params: Param[];
  returns: { type: Token[]; doc?: string };
  typeParams?: TypeParam[];
  doc?: Doc;
  code: Token[];
}

export interface TypeParam {
  name: string;
  constraint?: Token[];
  default?: Token[];
}

export interface Property extends Doc {
  name: string;
  type: Token[];
  optional?: boolean;
  readonly?: boolean;
  static?: boolean;
  inheritedFrom?: string;
}

export interface Method extends Doc {
  name: string;
  overloads: Signature[];
  optional?: boolean;
  static?: boolean;
  details?: string;
  inheritedFrom?: string;
}

export type Kind = "function" | "class" | "interface" | "type" | "variable" | "enum";

export interface ApiSymbol extends Doc {
  name: string;
  kind: Kind;
  module: string;
  source: string;
  file: string;
  guide?: string;
  code?: Token[];
  overloads?: Signature[];
  ctor?: Signature;
  properties?: Property[];
  methods?: Method[];
  values?: (string | number)[];
  typeParams?: TypeParam[];
  usedBy?: string[];
  slug: string;
}

export const model = api as unknown as {
  modules: { name: string; intro: Record<string, string> }[];
  symbols: ApiSymbol[];
};

export const symbols = model.symbols;
const byName = new Map(symbols.map((s) => [s.name, s]));
export const find = (name: string) => byName.get(name);

export const slugOf = (name: string) => byName.get(name)?.slug ?? name.toLowerCase();
export const pathOf = (name: string) => `/reference/${slugOf(name)}/`;

export const KIND_ORDER: Kind[] = ["class", "function", "variable", "interface", "type", "enum"];
export function kindOf(symbol: ApiSymbol): Kind | "constant" {
  if (symbol.kind === "variable" && !symbol.properties?.length && !symbol.methods?.length) return "constant";
  return symbol.kind;
}

/** The pages of the guide that explain exports, in the order of the guide. */
export const TOPICS = [
  "/basics/configuration/",
  "/basics/lists/",
  "/basics/names-and-ids/",
  "/basics/embedded-data/",
  "/basics/caching/",
  "/basics/rate-limit/",
  "/basics/errors/",
  "/resources/methods/",
  "/resources/account/",
  "/resources/quests/",
  "/resources/trading/",
  "/resources/monsters/",
  "/resources/zones/",
  "/resources/users/",
  "/resources/conversations/",
  "/resources/trade-proposals/",
  "/resources/kralove/",
  "/resources/reference-data/",
] as const;
export type Topic = (typeof TOPICS)[number];
export const topicOf = (symbol: ApiSymbol): Topic => (symbol.guide as Topic) ?? TOPICS[0];
/** The anchor of a topic on the front page of the reference. */
export const topicId = (topic: Topic) => topic.split("/").filter(Boolean).pop()!;

/** The exports of each topic: what you call first, then what you read. */
export function grouped(): { topic: Topic; symbols: ApiSymbol[] }[] {
  return TOPICS.map((topic) => ({
    topic,
    symbols: symbols
      .filter((s) => topicOf(s) === topic)
      .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name, "en")),
  })).filter((group) => group.symbols.length > 0);
}

/* Translation */

type Language = "fr" | "en" | "es";
type Table = Record<string, { en: string; fr?: string; es?: string }>;
const files = import.meta.glob<{ default: Table }>("../data/api.*.json", { eager: true });
const tableOf = (language: string): Table => files[`../data/api.${language}.json`]?.default ?? {};
const TABLES: Record<"fr" | "es", Table> = { fr: tableOf("fr"), es: tableOf("es") };

/** The language of a page: French at the root. */
export const languageOf = (locale: string | undefined): Language => (locale === "en" || locale === "es" ? locale : "fr");

/**
 * A sentence of the reference in a language. English is the source: a
 * translation is used only while the sentence it was made from is still the
 * one in the code, so a doc comment that changes falls back to English until
 * it is translated again.
 */
export function translate(key: string, english: string | undefined, locale: string | undefined): string | undefined {
  const language = languageOf(locale);
  if (!english || language === "en") return english;
  const entry = TABLES[language][key];
  return entry && entry.en === english && entry[language] ? entry[language] : english;
}

/** Whether a sentence still waits for its translation. */
export function untranslated(key: string, english: string | undefined, locale: string | undefined): boolean {
  const language = languageOf(locale);
  if (!english || language === "en") return false;
  const entry = TABLES[language][key];
  return !(entry && entry.en === english && entry[language]);
}

/* Words */

const en = {
  title: "API reference",
  lead: "Every class, function, object and type the package exports, each on a page of its own: what it is for, what it takes, what it gives back.",
  sidebarAll: "Overview",
  kinds: {
    function: "Function",
    variable: "Object",
    constant: "Constant",
    class: "Class",
    interface: "Interface",
    type: "Type",
    enum: "Enum",
  },
  kindHelp: {
    class: "A kind of object with its own methods. `new Metamob()` creates one, and its resources (`metamob.quests`, `metamob.monsters`...) are others.",
    function: "Something you call: it takes values and gives one back.",
    variable: "A ready-made value that groups related functions or data, such as `data` or `urls`.",
    interface: "The shape of an object: what it holds. You read it (a quest is an `OwnQuest`) or fill it in (the options of `new Metamob()` are `MetamobOptions`).",
    type: "A name given to a set of possible values, such as a monster name. It exists for your editor only.",
  },
  howToRead: "How to read this reference",
  howToReadText: "Each page answers three questions: what the thing is for, what it takes, and what it gives back. The coloured letter before a name tells what kind of thing it is:",
  topics: {
    "/basics/configuration/": "The client",
    "/basics/lists/": "Lists",
    "/basics/names-and-ids/": "Names and ids",
    "/basics/embedded-data/": "Embedded data",
    "/basics/caching/": "Caching",
    "/basics/rate-limit/": "Rate limit",
    "/basics/errors/": "Errors",
    "/resources/methods/": "Endpoints",
    "/resources/account/": "Account",
    "/resources/quests/": "Quests",
    "/resources/trading/": "Trading",
    "/resources/monsters/": "Monsters",
    "/resources/zones/": "Zones",
    "/resources/users/": "Players",
    "/resources/conversations/": "Conversations",
    "/resources/trade-proposals/": "Trade proposals",
    "/resources/kralove/": "Kralamoure events",
    "/resources/reference-data/": "Reference data",
  } satisfies Record<Topic, string>,
  modules: "Entry point",
  import: "Import",
  parameters: "Parameters",
  returns: "Returns",
  example: "Example",
  examples: "Examples",
  properties: "Properties",
  methods: "Methods",
  values: "Possible values",
  valuesCount: (count: number) => `${count} values`,
  constructor: "Constructor",
  usedBy: "Used by",
  usedByText: "The other exports that mention this one.",
  guide: "Explained in the guide",
  source: "Source",
  optional: "optional",
  readonly: "read-only",
  static: "static",
  deprecated: "Deprecated",
  default: "Default:",
  inherited: "From",
  accepts: "What it accepts",
  form: "Form",
};

type Words = typeof en;

const frWords: Words = {
  title: "Référence de l'API",
  lead: "Chaque classe, fonction, objet et type exporté par le paquet, chacun sur sa propre page : à quoi il sert, ce qu'il prend, ce qu'il renvoie.",
  sidebarAll: "Vue d'ensemble",
  kinds: {
    function: "Fonction",
    variable: "Objet",
    constant: "Constante",
    class: "Classe",
    interface: "Interface",
    type: "Type",
    enum: "Énumération",
  },
  kindHelp: {
    class: "Un genre d'objet avec ses propres méthodes. `new Metamob()` en crée un, et ses ressources (`metamob.quests`, `metamob.monsters`...) en sont d'autres.",
    function: "Quelque chose que vous appelez : elle prend des valeurs et en renvoie une.",
    variable: "Une valeur toute prête qui regroupe des fonctions ou des données, comme `data` ou `urls`.",
    interface: "La forme d'un objet : ce qu'il contient. Vous la lisez (une quête est une `OwnQuest`) ou vous la remplissez (les options de `new Metamob()` sont des `MetamobOptions`).",
    type: "Un nom donné à un ensemble de valeurs possibles, comme un nom de monstre. Il n'existe que pour votre éditeur.",
  },
  howToRead: "Comment lire cette référence",
  howToReadText: "Chaque page répond à trois questions : à quoi sert la chose, ce qu'elle prend, et ce qu'elle renvoie. La lettre de couleur devant un nom indique de quel genre de chose il s'agit :",
  topics: {
    "/basics/configuration/": "Le client",
    "/basics/lists/": "Listes",
    "/basics/names-and-ids/": "Noms et identifiants",
    "/basics/embedded-data/": "Données embarquées",
    "/basics/caching/": "Cache",
    "/basics/rate-limit/": "Limite de requêtes",
    "/basics/errors/": "Erreurs",
    "/resources/methods/": "Points d'accès",
    "/resources/account/": "Compte",
    "/resources/quests/": "Quêtes",
    "/resources/trading/": "Échanges",
    "/resources/monsters/": "Monstres",
    "/resources/zones/": "Zones",
    "/resources/users/": "Joueurs",
    "/resources/conversations/": "Conversations",
    "/resources/trade-proposals/": "Propositions d'échange",
    "/resources/kralove/": "Événements Kralamoure",
    "/resources/reference-data/": "Données de référence",
  },
  modules: "Point d'entrée",
  import: "Import",
  parameters: "Paramètres",
  returns: "Renvoie",
  example: "Exemple",
  examples: "Exemples",
  properties: "Propriétés",
  methods: "Méthodes",
  values: "Valeurs possibles",
  valuesCount: (count: number) => `${count} valeurs`,
  constructor: "Constructeur",
  usedBy: "Utilisé par",
  usedByText: "Les autres exports qui mentionnent celui-ci.",
  guide: "Expliqué dans le guide",
  source: "Source",
  optional: "facultatif",
  readonly: "lecture seule",
  static: "statique",
  deprecated: "Obsolète",
  default: "Par défaut :",
  inherited: "Vient de",
  accepts: "Ce qu'il accepte",
  form: "Forme",
};

const esWords: Words = {
  title: "Referencia de la API",
  lead: "Cada clase, función, objeto y tipo que exporta el paquete, cada uno en su propia página: para qué sirve, qué recibe, qué devuelve.",
  sidebarAll: "Vista general",
  kinds: {
    function: "Función",
    variable: "Objeto",
    constant: "Constante",
    class: "Clase",
    interface: "Interfaz",
    type: "Tipo",
    enum: "Enumeración",
  },
  kindHelp: {
    class: "Un tipo de objeto con sus propios métodos. `new Metamob()` crea uno, y sus recursos (`metamob.quests`, `metamob.monsters`...) son otros.",
    function: "Algo que llamas: recibe valores y devuelve uno.",
    variable: "Un valor ya listo que agrupa funciones o datos, como `data` o `urls`.",
    interface: "La forma de un objeto: lo que contiene. La lees (una misión es un `OwnQuest`) o la rellenas (las opciones de `new Metamob()` son `MetamobOptions`).",
    type: "Un nombre dado a un conjunto de valores posibles, como un nombre de monstruo. Solo existe para tu editor.",
  },
  howToRead: "Cómo leer esta referencia",
  howToReadText: "Cada página responde a tres preguntas: para qué sirve, qué recibe y qué devuelve. La letra de color delante de un nombre indica qué tipo de cosa es:",
  topics: {
    "/basics/configuration/": "El cliente",
    "/basics/lists/": "Listas",
    "/basics/names-and-ids/": "Nombres e identificadores",
    "/basics/embedded-data/": "Datos incluidos",
    "/basics/caching/": "Caché",
    "/basics/rate-limit/": "Límite de solicitudes",
    "/basics/errors/": "Errores",
    "/resources/methods/": "Puntos de acceso",
    "/resources/account/": "Cuenta",
    "/resources/quests/": "Misiones",
    "/resources/trading/": "Intercambios",
    "/resources/monsters/": "Monstruos",
    "/resources/zones/": "Zonas",
    "/resources/users/": "Jugadores",
    "/resources/conversations/": "Conversaciones",
    "/resources/trade-proposals/": "Propuestas de intercambio",
    "/resources/kralove/": "Eventos Kralamar",
    "/resources/reference-data/": "Datos de referencia",
  },
  modules: "Punto de entrada",
  import: "Importar",
  parameters: "Parámetros",
  returns: "Devuelve",
  example: "Ejemplo",
  examples: "Ejemplos",
  properties: "Propiedades",
  methods: "Métodos",
  values: "Valores posibles",
  valuesCount: (count: number) => `${count} valores`,
  constructor: "Constructor",
  usedBy: "Usado por",
  usedByText: "Los otros exports que mencionan este.",
  guide: "Explicado en la guía",
  source: "Código",
  optional: "opcional",
  readonly: "solo lectura",
  static: "estático",
  deprecated: "Obsoleto",
  default: "Por defecto:",
  inherited: "Viene de",
  accepts: "Lo que acepta",
  form: "Forma",
};

export function words(locale: string | undefined): Words {
  const language = languageOf(locale);
  return language === "en" ? en : language === "es" ? esWords : frWords;
}

/** The sidebar of the reference: one group per topic, one link per export. */
export function sidebar(locale: string | undefined) {
  const w = words(locale);
  return [
    { label: w.sidebarAll, link: "/reference/" },
    ...grouped().map(({ topic, symbols: list }) => ({
      label: w.topics[topic],
      collapsed: true,
      items: list.map((symbol) => ({
        label: symbol.name,
        link: pathOf(symbol.name),
        attrs: { "data-kind": kindOf(symbol), translate: "no" },
      })),
    })),
  ];
}
