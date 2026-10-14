import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { normalizeBase, remarkBaseLinks, withBase } from "./plugins/base-links.mjs";
import { rehypeSharedHeadingIds } from "./plugins/heading-ids.mjs";
import { rehypeWrapTables } from "./plugins/wrap-tables.mjs";
import { atelierDark, atelierLight } from "./src/styles/code-themes.mjs";

// Where the site is served from. Both are overridable from the environment, so
// hosting it elsewhere (a custom domain at the root, for instance) is a matter
// of setting DOCS_SITE and DOCS_BASE in the deploy workflow:
//
//   DOCS_SITE=https://docs.example.dev DOCS_BASE=/ npm run build
//
// Every internal link in the content is written root-relative and gets the base
// prepended by `remarkBaseLinks`, so nothing else needs to change.
//
// An unset or empty variable means "use the default", so the workflow can pass
// repository variables through unconditionally. Use DOCS_BASE=/ for the root.
const site = process.env.DOCS_SITE || "https://ix-xs.github.io";
const base = normalizeBase(process.env.DOCS_BASE || "/metamob.api");

// While pages are being written, DOCS_DRAFT=1 lets the site build without the
// ones that do not exist yet. A normal build fails on a missing page.
const draft = Boolean(process.env.DOCS_DRAFT);
const exists = (slug) => ["md", "mdx"].some((extension) => existsSync(new URL(`./src/content/docs/${slug}.${extension}`, import.meta.url)));
const pages = (...slugs) => slugs.filter((slug) => !draft || exists(slug)).map((slug) => ({ slug }));

/** One section of the sidebar, listing every page of a folder in its own order. */
const section = (fr, en, es, directory, collapsed = true) => ({ label: fr, translations: { en, es }, collapsed, items: [{ autogenerate: { directory } }] });

// https://starlight.astro.build/reference/configuration/
export default defineConfig({
  site,
  base: base || "/",
  markdown: {
    // The two plugins below are written for unified, not for Astro's default processor.
    processor: unified({
      remarkPlugins: [[remarkBaseLinks, { base }]],
      rehypePlugins: [rehypeSharedHeadingIds, rehypeWrapTables],
    }),
  },
  integrations: [
    starlight({
      title: "metamob.api",
      // French sits at the root: Dofus and Metamob are French, and so are
      // most readers. English, the language the pages are written in first,
      // and Spanish live under their language code. A page that is not
      // translated yet falls back to French, with a notice.
      defaultLocale: "root",
      locales: {
        root: { label: "Français", lang: "fr" },
        en: { label: "English", lang: "en" },
        es: { label: "Español", lang: "es" },
      },
      description:
        "Le client complet de l'API Metamob pour JavaScript et TypeScript : tous les points d'accès, typés, avec les monstres, les zones et les serveurs appelés par leur nom en français, en anglais ou en espagnol. Pagination paresseuse, limiteur de requêtes intégré, nouvelles tentatives et cache, sans aucune dépendance.",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/ix-xs/metamob.api" }],
      editLink: {
        baseUrl: "https://github.com/ix-xs/metamob.api/edit/main/docs/",
      },
      head: [
        // Lets the page paint under the notch; the header pads itself back out.
        { tag: "meta", attrs: { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" } },
        // The SVG icon comes from Starlight; these two are for the browsers that want a PNG.
        { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "32x32", href: withBase("/favicon-32.png", base) } },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png", base) } },
        // Kept in step with the theme by the theme toggle.
        { tag: "meta", attrs: { name: "theme-color", content: "#121211" } },
      ],
      customCss: [
        "@fontsource-variable/bricolage-grotesque/opsz.css",
        "@fontsource/fragment-mono/400.css",
        "@fontsource/fragment-mono/400-italic.css",
        "./src/styles/atelier.css",
        "./src/styles/playground.css",
      ],
      components: {
        Header: "./src/components/Header.astro",
        Footer: "./src/components/Footer.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        LanguageSelect: "./src/components/LanguageSelect.astro",
        PageTitle: "./src/components/PageTitle.astro",
        Hero: "./src/components/Hero.astro",
      },
      expressiveCode: {
        themes: [atelierDark, atelierLight],
        styleOverrides: {
          borderRadius: "6px",
          borderWidth: "1px",
          borderColor: "var(--at-line)",
          codeFontFamily: "var(--sl-font-mono)",
          codeFontSize: "0.84rem",
          codeLineHeight: "1.75",
          codePaddingBlock: "1.25rem",
          codePaddingInline: "1.25rem",
          uiFontFamily: "var(--sl-font-mono)",
          uiFontSize: "0.75rem",
          frames: {
            frameBoxShadowCssValue: "none",
            editorTabBarBackground: "var(--at-surface)",
            editorTabBarBorderBottomColor: "var(--at-line)",
            editorActiveTabBackground: "var(--at-surface)",
            editorActiveTabIndicatorTopColor: "transparent",
            editorActiveTabIndicatorBottomColor: "var(--at-accent)",
            terminalBackground: "var(--at-surface)",
            terminalTitlebarBackground: "var(--at-surface)",
            terminalTitlebarBorderBottomColor: "var(--at-line)",
            terminalTitlebarDotsOpacity: "0",
          },
        },
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      lastUpdated: false,
      // One page per topic, grouped by what you are trying to do.
      sidebar: [
        {
          label: "Démarrer",
          translations: { en: "Start", es: "Empezar" },
          // The landing page is not listed: the sidebar only holds pages of the documentation, and the brand in the header leads home.
          items: pages("start/quick-start", "start/api-key", "start/migrating-from-v4"),
        },
        section("Bases", "Basics", "Bases", "basics", false),
        section("Ressources", "Resources", "Recursos", "resources"),
        section("Recettes", "Recipes", "Recetas", "recipes"),
        {
          label: "Référence",
          translations: { en: "Reference", es: "Referencia" },
          collapsed: true,
          items: pages("reference/methods", "reference/errors", "reference/exports", "reference/runtimes", "help/troubleshooting", "help/faq"),
        },
      ],
    }),
  ],
});
