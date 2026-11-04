// Internal links are written root-relative ("/api/store/"). This remark plugin
// prepends the language of the page and the configured base path at build time.

export function normalizeBase(base) {
  const trimmed = String(base ?? "").replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

export function withBase(url, base) {
  const prefix = normalizeBase(base);
  if (typeof url !== "string" || !prefix) return url;
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  if (url === prefix || url.startsWith(`${prefix}/`)) return url;
  return prefix + url;
}

// Languages in a folder of their own. French sits at the root.
export const LOCALES = ["en", "es"];

export const ROOT_LANGUAGE = "fr";

// The language the others are translated from.
export const SOURCE = "en";

export function localeOfFile(file) {
  const match = /[\\/]content[\\/]docs[\\/]([a-z]{2}(?:-[a-z]{2})?)[\\/]/i.exec(String(file ?? ""));
  return match && LOCALES.includes(match[1].toLowerCase()) ? match[1].toLowerCase() : undefined;
}

export function localeOfPath(pathname) {
  const first = String(pathname ?? "").split("/").filter(Boolean)[0];
  return LOCALES.includes(first) ? first : undefined;
}

// "/data/store/" on an English page becomes "/en/data/store/". Files are left alone.
export function withLocale(url, locale) {
  if (!locale || typeof url !== "string") return url;
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  if (localeOfPath(url)) return url;
  if (/\.[a-z0-9]+(?:[?#].*)?$/i.test(url)) return url;
  return `/${locale}${url}`;
}

export function switchLocale(pathname, locale) {
  const current = localeOfPath(pathname);
  const bare = current ? pathname.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/" : pathname;
  return locale ? `/${locale}${bare}` : bare;
}

// "docs/basics/lists.md" and "docs/es/basics/lists.md" both translate "docs/en/basics/lists.md".
export function originalOf(file) {
  const text = String(file ?? "");
  const locale = localeOfFile(text);
  if (locale === SOURCE) return undefined;
  const docs = /^(.*[\\/]content[\\/]docs)([\\/])(.*)$/i.exec(text);
  if (!docs) return undefined;
  const [, folder, separator, rest] = docs;
  const relative = locale ? rest.slice(locale.length + 1) : rest;
  return `${folder}${separator}${SOURCE}${separator}${relative}`;
}

const LINK_ATTRIBUTES = new Set(["href", "link"]);

function visit(node, fn) {
  fn(node);
  if (Array.isArray(node.children)) for (const child of node.children) visit(child, fn);
}

export function remarkBaseLinks(options = {}) {
  const { base } = options;
  return (tree, file) => {
    const locale = localeOfFile(file?.path ?? file?.history?.[0]);
    const resolve = (url) => withBase(withLocale(url, locale), base);
    visit(tree, (node) => {
      // [text](/path) and [ref]: /path
      if ((node.type === "link" || node.type === "definition") && typeof node.url === "string") {
        node.url = resolve(node.url);
        return;
      }
      // <LinkCard href="/path" /> in .mdx files
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        for (const attribute of node.attributes ?? []) {
          if (attribute.type === "mdxJsxAttribute" && LINK_ATTRIBUTES.has(attribute.name)) {
            if (typeof attribute.value === "string") attribute.value = resolve(attribute.value);
          }
        }
      }
    });
  };
}
