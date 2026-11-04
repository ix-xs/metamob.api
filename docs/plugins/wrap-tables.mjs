// Wraps every Markdown table in a scroll container, so it scrolls sideways on a phone.

import { localeOfFile } from "./base-links.mjs";

const LABELS = { en: "Table", fr: "Tableau" };

function visit(node, fn) {
  if (!Array.isArray(node.children)) return;
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];
    if (fn(child, index, node) !== false) visit(child, fn);
  }
}

export function rehypeWrapTables() {
  return (tree, file) => {
    const label = LABELS[localeOfFile(file?.path ?? file?.history?.[0]) ?? "en"] ?? LABELS.en;
    visit(tree, (node, index, parent) => {
      if (node.type !== "element" || node.tagName !== "table") return undefined;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["at-table"], tabIndex: 0, role: "region", ariaLabel: label },
        children: [node],
      };
      return false;
    });
  };
}
