// The words of the site's own interface (header, search, landing page), in
// each language. Starlight translates its own; page content is translated in
// `src/content/docs/<language>/`.
import { withBase, withLocale } from "../plugins/base-links.mjs";

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
  "finder.label": "A monster, the way you would type it",
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

  "finder.label": "Un monstre, comme vous le taperiez",
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

const DICTIONARIES: Record<string, Record<UiKey, string>> = { en, fr };

/** The languages of the site, in the order the switch lists them. `locale` is the folder and URL prefix. */
export const LANGUAGES = [
  { locale: undefined, code: "en", label: "English" },
  { locale: "fr", code: "fr", label: "Français" },
] as const;

/**
 * The translator for a page: `t("search.clear")`. `locale` is Starlight's
 * (`undefined` for English).
 */
export function useT(locale: string | undefined) {
  const dictionary = DICTIONARIES[locale ?? "en"] ?? en;
  return (key: UiKey, values: Record<string, string> = {}): string =>
    (dictionary[key] ?? en[key]).replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/** A link written as in English ("/start/quick-start/"), for a page in `locale` and the site's base path. */
export function href(path: string, locale: string | undefined): string {
  return withBase(withLocale(path, locale), import.meta.env.BASE_URL);
}
