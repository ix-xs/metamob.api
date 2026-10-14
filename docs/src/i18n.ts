// The words of the site's own interface (header, search, landing page), in
// each language. Starlight translates its own; page content is translated in
// `src/content/docs/<language>/`.
import { ROOT_LANGUAGE, withBase, withLocale } from "../plugins/base-links.mjs";

const en = {
  // Header
  "nav.sections": "Sections",
  "nav.docs": "Docs",
  "nav.recipes": "Recipes",
  "nav.reference": "Reference",
  "nav.github": "GitHub repository",
  "nav.theme": "Switch between dark and light",
  "nav.language": "Language",

  // Names of the parts of the documentation, as the sidebar writes them
  "area.start": "Start",
  "area.basics": "Basics",
  "area.resources": "Resources",
  "area.recipes": "Recipes",
  "area.reference": "Reference",

  // Search
  "search.recent": "Recently opened",
  "search.clear": "Clear",
  "search.start": "Start here",
  "search.try": "Try a search",
  "search.queries": "setMonster|rate limit|withKey|archmonster|UNKNOWN_NAME",
  "search.move": "move",
  "search.open": "open",
  "search.close": "close",

  // Landing page
  "hero.eyebrow": "A Metamob API client for JavaScript and TypeScript",
  "hero.copy": "Copy the install command",
  "hero.facts": "Open source, MIT|No dependency|Node, Bun, Deno, browsers, edge",

  // The playground of the landing page
  "finder.trials": "Trials",
  "finder.tab.name": "A name",
  "finder.tab.search": "Autocomplete",
  "finder.tab.where": "Where it lives",
  "finder.tab.quest": "A quest",
  "finder.about.name": "Type a monster the way a player would in a chat command. This is what metamob.monsters.get() makes of it.",
  "finder.about.search": "What a Discord autocomplete needs on every keystroke: the monsters whose name contains a text, in any of the three languages, best match first.",
  "finder.about.where": "From a monster to the places it lives in, its archmonster and the quests that ask for it. These links ship with the package.",
  "finder.about.quest": "What a quest asks for at each step, in each version of the game. Drag the step.",
  "finder.label.name": "A monster, the way you would type it",
  "finder.label.search": "A few letters",
  "finder.label.where": "A monster",
  "finder.kind": "Kind",
  "finder.anyKind": "all",
  "finder.template": "Quest",
  "finder.stepLabel": "Step",
  "finder.found": "Found: {count}. Here are the first {shown}.",
  "finder.foundAll": "Found: {count}.",
  "finder.nothing": "No monster has this in its name.",
  "finder.level": "lvl",
  "finder.livesIn": "Lives in",
  "finder.nowhere": "The data lists no place for it.",
  "finder.rare": "Its archmonster",
  "finder.rareOf": "Archmonster of",
  "finder.askedBy": "Asked by",
  "finder.step": "step",
  "finder.atStep": "Step {step} of {steps}: {count} to find.",
  "finder.more": "and {count} more",
  "finder.time": "answered in {time} ms",
  "finder.try": "Try",
  "finder.write": "You write",
  "finder.writeLabel": "The call you write",
  "finder.read": "You get",
  "finder.readLabel": "What the call returns",
  "finder.byId": "Found by its id.",
  "finder.fr": "Matched on the French name",
  "finder.en": "Matched on the English name",
  "finder.es": "Matched on the Spanish name",
  "finder.exact": "written exactly.",
  "finder.loose": "accents and case set aside.",
  "finder.ambiguous": "Two monsters have this name, one per version of the game. Writing to a quest picks the one of that quest. Anywhere else, say which version you mean.",
  "finder.unknown": "No monster has this name, so the call fails before it can touch a quest:",
  "finder.meant": "Closest names",
  "finder.contains": "Names that contain it",
  "finder.empty": "Type a name or an id, or pick one of the examples.",
  "finder.noId": "No monster of the package has this id. The API is asked, and answers that it does not exist.",
  "finder.throws": "throws, with error.code",
  "finder.foot": "Answered in this page by the data that ships with the package: <strong>{count} monsters</strong>, no request.",
} as const;

export type UiKey = keyof typeof en;

const fr: Record<UiKey, string> = {
  "nav.sections": "Rubriques",
  "nav.docs": "Docs",
  "nav.recipes": "Recettes",
  "nav.reference": "Référence",
  "nav.github": "Dépôt GitHub",
  "nav.theme": "Basculer entre sombre et clair",
  "nav.language": "Langue",

  "area.start": "Démarrer",
  "area.basics": "Bases",
  "area.resources": "Ressources",
  "area.recipes": "Recettes",
  "area.reference": "Référence",

  "search.recent": "Ouvertes récemment",
  "search.clear": "Effacer",
  "search.start": "Pour commencer",
  "search.try": "Essayer une recherche",
  "search.queries": "setMonster|limite de requêtes|withKey|archimonstre|UNKNOWN_NAME",
  "search.move": "naviguer",
  "search.open": "ouvrir",
  "search.close": "fermer",

  "hero.eyebrow": "Un client de l'API Metamob pour JavaScript et TypeScript",
  "hero.copy": "Copier la commande d'installation",
  "hero.facts": "Open source, MIT|Aucune dépendance|Node, Bun, Deno, navigateurs, edge",

  "finder.trials": "Essais",
  "finder.tab.name": "Un nom",
  "finder.tab.search": "Autocomplétion",
  "finder.tab.where": "Où il vit",
  "finder.tab.quest": "Une quête",
  "finder.about.name": "Tapez un monstre comme un joueur le ferait dans une commande. Voici ce que metamob.monsters.get() en comprend.",
  "finder.about.search": "Ce qu'il faut à une autocomplétion Discord à chaque frappe : les monstres dont le nom contient un texte, dans l'une des trois langues, le plus pertinent en premier.",
  "finder.about.where": "D'un monstre aux lieux où il vit, à son archimonstre et aux quêtes qui le demandent. Ces liens sont livrés avec le paquet.",
  "finder.about.quest": "Ce qu'une quête demande à chaque étape, dans chaque version du jeu. Faites glisser l'étape.",
  "finder.label.name": "Un monstre, comme vous le taperiez",
  "finder.label.search": "Quelques lettres",
  "finder.label.where": "Un monstre",
  "finder.kind": "Type",
  "finder.anyKind": "tous",
  "finder.template": "Quête",
  "finder.stepLabel": "Étape",
  "finder.found": "Trouvés : {count}. Voici les {shown} premiers.",
  "finder.foundAll": "Trouvés : {count}.",
  "finder.nothing": "Aucun nom de monstre ne contient ce texte.",
  "finder.level": "niv.",
  "finder.livesIn": "Vit dans",
  "finder.nowhere": "Les données ne lui connaissent aucun lieu.",
  "finder.rare": "Son archimonstre",
  "finder.rareOf": "Archimonstre de",
  "finder.askedBy": "Demandé par",
  "finder.step": "étape",
  "finder.atStep": "Étape {step} sur {steps} : {count} à trouver.",
  "finder.more": "et {count} autres",
  "finder.time": "répondu en {time} ms",
  "finder.try": "Essayer",
  "finder.write": "Vous écrivez",
  "finder.writeLabel": "L'appel que vous écrivez",
  "finder.read": "Vous obtenez",
  "finder.readLabel": "Ce que l'appel renvoie",
  "finder.byId": "Trouvé par son identifiant.",
  "finder.fr": "Reconnu par son nom français",
  "finder.en": "Reconnu par son nom anglais",
  "finder.es": "Reconnu par son nom espagnol",
  "finder.exact": "écrit tel quel.",
  "finder.loose": "sans tenir compte des accents ni de la casse.",
  "finder.ambiguous": "Deux monstres portent ce nom, un par version du jeu. Écrire dans une quête choisit celui de cette quête. Ailleurs, précisez la version voulue.",
  "finder.unknown": "Aucun monstre ne porte ce nom : l'appel échoue avant de pouvoir toucher à une quête.",
  "finder.meant": "Noms les plus proches",
  "finder.contains": "Noms qui le contiennent",
  "finder.empty": "Tapez un nom ou un identifiant, ou choisissez un exemple.",
  "finder.noId": "Aucun monstre du paquet n'a cet identifiant. L'API est interrogée, et répond qu'il n'existe pas.",
  "finder.throws": "lève une erreur, avec error.code",
  "finder.foot": "Répondu dans cette page par les données livrées avec le paquet : <strong>{count} monstres</strong>, sans aucune requête.",
};

const es: Record<UiKey, string> = {
  "nav.sections": "Secciones",
  "nav.docs": "Docs",
  "nav.recipes": "Recetas",
  "nav.reference": "Referencia",
  "nav.github": "Repositorio de GitHub",
  "nav.theme": "Cambiar entre oscuro y claro",
  "nav.language": "Idioma",

  "area.start": "Empezar",
  "area.basics": "Bases",
  "area.resources": "Recursos",
  "area.recipes": "Recetas",
  "area.reference": "Referencia",

  "search.recent": "Abiertas recientemente",
  "search.clear": "Borrar",
  "search.start": "Para empezar",
  "search.try": "Prueba una búsqueda",
  "search.queries": "setMonster|límite de solicitudes|withKey|archimonstruo|UNKNOWN_NAME",
  "search.move": "moverse",
  "search.open": "abrir",
  "search.close": "cerrar",

  "hero.eyebrow": "Un cliente de la API de Metamob para JavaScript y TypeScript",
  "hero.copy": "Copiar el comando de instalación",
  "hero.facts": "Código abierto, MIT|Sin dependencias|Node, Bun, Deno, navegadores, edge",

  "finder.trials": "Pruebas",
  "finder.tab.name": "Un nombre",
  "finder.tab.search": "Autocompletado",
  "finder.tab.where": "Dónde vive",
  "finder.tab.quest": "Una misión",
  "finder.about.name": "Escribe un monstruo como lo haría un jugador en un comando. Esto es lo que metamob.monsters.get() entiende.",
  "finder.about.search": "Lo que necesita un autocompletado de Discord en cada pulsación: los monstruos cuyo nombre contiene un texto, en cualquiera de los tres idiomas, el más pertinente primero.",
  "finder.about.where": "De un monstruo a los lugares donde vive, a su archimonstruo y a las misiones que lo piden. Estos enlaces vienen con el paquete.",
  "finder.about.quest": "Lo que pide una misión en cada etapa, en cada versión del juego. Arrastra la etapa.",
  "finder.label.name": "Un monstruo, tal como lo escribirías",
  "finder.label.search": "Unas letras",
  "finder.label.where": "Un monstruo",
  "finder.kind": "Tipo",
  "finder.anyKind": "todos",
  "finder.template": "Misión",
  "finder.stepLabel": "Etapa",
  "finder.found": "Encontrados: {count}. Estos son los {shown} primeros.",
  "finder.foundAll": "Encontrados: {count}.",
  "finder.nothing": "Ningún nombre de monstruo contiene este texto.",
  "finder.level": "niv.",
  "finder.livesIn": "Vive en",
  "finder.nowhere": "Los datos no le conocen ningún lugar.",
  "finder.rare": "Su archimonstruo",
  "finder.rareOf": "Archimonstruo de",
  "finder.askedBy": "Pedido por",
  "finder.step": "etapa",
  "finder.atStep": "Etapa {step} de {steps}: {count} por encontrar.",
  "finder.more": "y {count} más",
  "finder.time": "respondido en {time} ms",
  "finder.try": "Prueba",
  "finder.write": "Escribes",
  "finder.writeLabel": "La llamada que escribes",
  "finder.read": "Obtienes",
  "finder.readLabel": "Lo que devuelve la llamada",
  "finder.byId": "Encontrado por su identificador.",
  "finder.fr": "Reconocido por su nombre en francés",
  "finder.en": "Reconocido por su nombre en inglés",
  "finder.es": "Reconocido por su nombre en español",
  "finder.exact": "escrito tal cual.",
  "finder.loose": "sin tener en cuenta acentos ni mayúsculas.",
  "finder.ambiguous": "Dos monstruos llevan este nombre, uno por versión del juego. Escribir en una misión elige el de esa misión. En otro lugar, indica la versión que quieres.",
  "finder.unknown": "Ningún monstruo lleva este nombre: la llamada falla antes de poder tocar una misión.",
  "finder.meant": "Nombres más parecidos",
  "finder.contains": "Nombres que lo contienen",
  "finder.empty": "Escribe un nombre o un identificador, o elige un ejemplo.",
  "finder.noId": "Ningún monstruo del paquete tiene este identificador. Se pregunta a la API, que responde que no existe.",
  "finder.throws": "lanza un error, con error.code",
  "finder.foot": "Respondido en esta página con los datos que vienen con el paquete: <strong>{count} monstruos</strong>, sin ninguna solicitud.",
};

const DICTIONARIES: Record<string, Record<UiKey, string>> = { en, fr, es };

/** The languages of the site, in the order the switch lists them. `locale` is the folder and URL prefix. */
export const LANGUAGES = [
  { locale: undefined, code: "fr", label: "Français" },
  { locale: "en", code: "en", label: "English" },
  { locale: "es", code: "es", label: "Español" },
] as const;

/**
 * The translator for a page: `t("search.clear")`. `locale` is Starlight's
 * (`undefined` for French, the language at the root).
 */
export function useT(locale: string | undefined) {
  const dictionary = DICTIONARIES[locale ?? ROOT_LANGUAGE] ?? en;
  return (key: UiKey, values: Record<string, string> = {}): string =>
    (dictionary[key] ?? en[key]).replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/** A link written without a language ("/start/quick-start/"), for a page in `locale` and the site's base path. */
export function href(path: string, locale: string | undefined): string {
  return withBase(withLocale(path, locale), import.meta.env.BASE_URL);
}
