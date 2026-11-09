// Every time the guide names an export in code (`normalizeName()`,
// `OwnQuest`, `metamob.quests.setMonster()`, `data.monster()`), the name
// becomes a link to its page in the API reference. The names come from
// `src/data/api.json`, the model the reference is built from.
//
// Runs before `remarkBaseLinks`, which then adds the language and the base.
import model from "../src/data/api.json" with { type: "json" };

const SYMBOLS = new Map(model.symbols.map((symbol) => [symbol.name, symbol]));
const MEMBERS = new Map(
  model.symbols.map((symbol) => [symbol.name, new Map([...(symbol.properties ?? []), ...(symbol.methods ?? [])].map((m) => [m.name, m]))]),
);

/** The variables the guide always gives the same name, and what they hold. */
const ALIASES = { metamob: "Metamob", client: "Metamob", data: "Dataset" };

export const slugOf = (name) => SYMBOLS.get(name)?.slug;

/** The export a property holds, when its type is one export of the package (`metamob.quests` is a `Quests`). */
function holder(owner, property) {
  const member = MEMBERS.get(owner)?.get(property);
  const refs = (member?.type ?? []).filter((token) => token[1]?.ref);
  return refs.length === 1 ? refs[0][1].ref : undefined;
}

/**
 * The page of the reference that a piece of inline code names, or nothing:
 * `normalizeName`, `normalizeName()`, `OwnQuest`, `Page<T>`, `urls.profile()`,
 * `metamob.withKey()`, `metamob.quests.setMonster()` and `data.monster()`.
 */
export function referenceFor(code) {
  const match = /^([A-Za-z_$][\w$]*)((?:\.[A-Za-z_$][\w$]*){0,2})(?:\(\)|\(\.\.\.\)|<[^<>]*>)?$/.exec(code.trim());
  if (!match) return undefined;
  const [, written, rest] = match;
  const path = rest.split(".").filter(Boolean);
  let name = ALIASES[written] && path.length > 0 ? ALIASES[written] : written;
  if (!SYMBOLS.has(name) || (ALIASES[written] && path.length === 0)) return undefined;
  // `metamob.quests.setMonster`: the member of the resource `metamob.quests` holds.
  if (path.length === 2) {
    const next = holder(name, path[0]);
    if (!next) return undefined;
    name = next;
    path.shift();
  }
  const member = path[0];
  if (member && !MEMBERS.get(name)?.has(member)) return undefined;
  return `/reference/${slugOf(name)}/${member ? `#${member}` : ""}`;
}

/** The remark plugin. */
export function remarkApiLinks() {
  return (tree) => {
    const walk = (node, inLink, inHeading) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type === "inlineCode" && !inLink && !inHeading) {
          const url = referenceFor(child.value);
          if (url) return { type: "link", url, data: { hProperties: { className: ["api-link"] } }, children: [child] };
        }
        walk(child, inLink || child.type === "link" || child.type === "linkReference", inHeading || child.type === "heading");
        return child;
      });
    };
    walk(tree, false, false);
  };
}
