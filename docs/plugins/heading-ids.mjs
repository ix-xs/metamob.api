// A translated page gets the heading ids of its original, by position, so one
// set of anchors works in every language.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { originalOf } from "./base-links.mjs";

function plain(text) {
  return text
    .replace(/\s+#+\s*$/, "")
    .split("`")
    // Odd pieces are inline code, kept as written.
    .map((piece, index) =>
      index % 2 === 1
        ? piece
        : piece
            .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
            .replace(/(\*\*|__)(.+?)\1/g, "$2")
            .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?=[^\w*]|$)/g, "$1$2")
            .replace(/\\([\\`*_{}[\]()#+\-.!<>|])/g, "$1"),
    )
    .join("")
    .trim();
}

export function headingIds(source) {
  const slugger = new GithubSlugger();
  const ids = [];
  let fence = null;
  for (const line of source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").split(/\r?\n/)) {
    const mark = /^\s*(`{3,}|~{3,})/.exec(line);
    if (mark) {
      if (!fence) fence = mark[1];
      else if (mark[1].startsWith(fence)) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (heading) ids.push(slugger.slug(plain(heading[1])));
  }
  return ids;
}

function visit(node, fn) {
  fn(node);
  if (Array.isArray(node.children)) for (const child of node.children) visit(child, fn);
}

// Runs before Astro's own, which keeps an id that is already there.
export function rehypeSharedHeadingIds() {
  return (tree, file) => {
    const source = file?.path ?? file?.history?.[0];
    const original = originalOf(source);
    if (!original || !existsSync(original)) return;
    const ids = headingIds(readFileSync(path.normalize(original), "utf8"));
    let index = 0;
    visit(tree, (node) => {
      if (node.type !== "element" || !/^h[1-6]$/.test(node.tagName)) return;
      const id = ids[index++];
      if (id) (node.properties ??= {}).id = id;
    });
  };
}
