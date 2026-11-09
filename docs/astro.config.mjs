import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { LOCALES, normalizeBase, remarkBaseLinks, withBase } from "./plugins/base-links.mjs";
import { remarkApiLinks } from "./plugins/api-links.mjs";
import { rehypeSharedHeadingIds } from "./plugins/heading-ids.mjs";
import { rehypeWrapTables } from "./plugins/wrap-tables.mjs";
import { MOVED } from "./redirects.mjs";
import { atelierDark, atelierLight } from "./src/styles/code-themes.mjs";

const site = process.env.DOCS_SITE || "https://ix-xs.github.io";
const base = normalizeBase(process.env.DOCS_BASE || "/metamob.api");

/** One group of the sidebar, its pages in reading order. */
const group = ([fr, en, es], items, collapsed = true) => ({
  label: fr,
  translations: { en, es },
  collapsed,
  items: items.map((item) => (typeof item === "string" ? { slug: item } : item)),
});

export default defineConfig({
  site,
  base: base || "/",
  redirects: Object.fromEntries(
    Object.entries(MOVED).flatMap(([from, to]) => [
      [from, withBase(to, base)],
      ...LOCALES.map((code) => [`/${code}${from}`, withBase(`/${code}${to}`, base)]),
    ]),
  ),
  markdown: {
    processor: unified({
      remarkPlugins: [remarkApiLinks, [remarkBaseLinks, { base }]],
      rehypePlugins: [rehypeSharedHeadingIds, rehypeWrapTables],
    }),
  },
  integrations: [
    starlight({
      title: "metamob.api",
      defaultLocale: "root",
      locales: {
        root: { label: "Français", lang: "fr" },
        en: { label: "English", lang: "en" },
        es: { label: "Español", lang: "es" },
      },
      description: "Un client JavaScript et TypeScript pour l'API Metamob.",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/ix-xs/metamob.api" }],
      editLink: {
        baseUrl: "https://github.com/ix-xs/metamob.api/edit/main/docs/",
      },
      head: [
        { tag: "meta", attrs: { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" } },
        { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "32x32", href: withBase("/favicon-32.png", base) } },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png", base) } },
        { tag: "meta", attrs: { name: "theme-color", content: "#121211" } },
      ],
      customCss: [
        "@fontsource-variable/bricolage-grotesque/opsz.css",
        "@fontsource/fragment-mono/400.css",
        "@fontsource/fragment-mono/400-italic.css",
        "./src/styles/atelier.css",
        "./src/styles/playground.css",
        "./src/styles/reference.css",
      ],
      components: {
        Header: "./src/components/Header.astro",
        Footer: "./src/components/Footer.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        LanguageSelect: "./src/components/LanguageSelect.astro",
        PageTitle: "./src/components/PageTitle.astro",
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
      sidebar: [
        group(["Pour commencer", "Getting started", "Para empezar"], [
          { slug: "index", label: "Introduction", translations: { en: "Introduction", es: "Introducción" } },
          "start/installation",
          "start/api-key",
        ], false),
        group(["Votre premier script", "Your first script", "Tu primer script"], [
          "script/client",
          "script/quests",
          "script/missing",
          "script/recording",
          "script/trades",
          "script/errors",
        ], false),
        group(["Les bases", "Basics", "Lo básico"], [
          "basics/configuration",
          "basics/names-and-ids",
          "basics/lists",
          "basics/embedded-data",
          "basics/errors",
          "basics/rate-limit",
          "basics/caching",
          "basics/many-keys",
        ]),
        group(["L'API", "The API", "La API"], [
          "resources/methods",
          "resources/account",
          "resources/quests",
          "resources/trading",
          "resources/monsters",
          "resources/zones",
          "resources/users",
          "resources/conversations",
          "resources/trade-proposals",
          "resources/kralove",
          "resources/reference-data",
        ]),
        group(["Exemples complets", "Complete examples", "Ejemplos completos"], [
          "recipes/discord-command",
          "recipes/quest-progress",
          "recipes/trade-finder",
        ]),
        group(["Aide", "Help", "Ayuda"], [
          "help/troubleshooting",
          "help/faq",
          "help/error-codes",
          "help/runtimes",
          "help/playground",
          "help/migrating-from-v4",
        ]),
      ],
    }),
  ],
});
