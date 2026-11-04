import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { normalizeBase, remarkBaseLinks, withBase } from "./plugins/base-links.mjs";
import { rehypeSharedHeadingIds } from "./plugins/heading-ids.mjs";
import { rehypeWrapTables } from "./plugins/wrap-tables.mjs";
import { atelierDark, atelierLight } from "./src/styles/code-themes.mjs";

const site = process.env.DOCS_SITE || "https://ix-xs.github.io";
const base = normalizeBase(process.env.DOCS_BASE || "/metamob.api");

const draft = Boolean(process.env.DOCS_DRAFT);
const exists = (slug) => ["md", "mdx"].some((extension) => existsSync(new URL(`./src/content/docs/${slug}.${extension}`, import.meta.url)));
const pages = (...slugs) => slugs.filter((slug) => !draft || exists(slug)).map((slug) => ({ slug }));

const section = (fr, en, es, directory) => ({ label: fr, translations: { en, es }, items: [{ autogenerate: { directory } }] });

export default defineConfig({
  site,
  base: base || "/",
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkBaseLinks, { base }]],
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
      sidebar: [
        { label: "Introduction", translations: { en: "Introduction", es: "Introducción" }, link: "/" },
        {
          label: "Démarrer",
          translations: { en: "Getting started", es: "Empezar" },
          items: pages("start/quick-start", "start/api-key", "start/playground", "start/migrating-from-v4"),
        },
        section("Les bases", "Basics", "Lo básico", "basics"),
        section("L'API", "The API", "La API", "resources"),
        section("Exemples", "Examples", "Ejemplos", "recipes"),
        {
          label: "Référence",
          translations: { en: "Reference", es: "Referencia" },
          items: pages("reference/methods", "reference/errors", "reference/exports", "reference/runtimes", "help/troubleshooting", "help/faq"),
        },
      ],
    }),
  ],
});
