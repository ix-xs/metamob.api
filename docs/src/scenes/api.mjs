// The Metamob API as the scenes of the guide see it: the same paths and the
// same shapes as the real one, for an example account. The monsters come from
// the data of the package, so their names and steps are the real ones.
import { data } from "../../../dist/index.js";

const KEY = "your-key";
const TEMPLATE = 1;
const server = (name) => {
  const { id, community, game_version } = data.server(name);
  return { id, name, community, game_version };
};
const template = () => {
  const { id, quest_type, monster_count, step_count } = data.questTemplate(TEMPLATE);
  return { id, quest_type: { id: quest_type.id, slug: quest_type.slug, name: quest_type.name }, monster_count, step_count };
};

const QUESTS = [
  { slug: "a1b2c3d4", character_name: "Ix-xs", current_step: 4, parallel_quests: 1, server: server("Mikhal"), show_trades: true, is_favorite: true },
  { slug: "e5f6a7b8", character_name: "Ix-alt", current_step: 1, parallel_quests: 1, server: server("Tylezia"), show_trades: false, is_favorite: false },
];

/** What the account owns: every monster of the steps before the current one, and every other one of the current step. */
function questMonsters(quest) {
  return data.templateMonsters(TEMPLATE).map((monster, index) => {
    const owned = monster.step < quest.current_step || (monster.step === quest.current_step && index % 2 === 0) ? 1 : 0;
    const { id, name, image, level_min, level_max, type } = data.monster(monster.id);
    return { id, name, image, level_min, level_max, type, step: monster.step, quantity: owned, want: owned < quest.parallel_quests ? 1 : 0, offer: 0, trade_offer: null, trade_want: null };
  });
}

const STATE = new Map(QUESTS.map((quest) => [quest.slug, questMonsters(quest)]));

const PARTNERS = [
  { username: "Partner-A", character: "Kalaya", parallel: 1, gives: 3, takes: 2 },
  { username: "Partner-B", character: "Orion", parallel: 2, gives: 2, takes: 0 },
  { username: "Partner-C", character: "Selis", parallel: 1, gives: 1, takes: 1 },
];

function matches(slug) {
  const monsters = STATE.get(slug);
  const missing = monsters.filter((monster) => monster.quantity === 0);
  const spare = monsters.filter((monster) => monster.quantity > 0).slice(-10);
  const entry = (monster, available) => ({ id: monster.id, name: monster.name, available, needed: 1, covers_need: available >= 1 });
  return PARTNERS.map((partner, index) => ({
    user: { username: partner.username, avatar: null, last_active: "2026-11-09T08:12:00Z" },
    quest: { slug: `f${index}e1d2c3`, character_name: partner.character, parallel_quests: partner.parallel },
    matches: {
      they_have_you_want: missing.slice(index, index + partner.gives).map((monster) => entry(monster, 2)),
      you_have_they_want: spare.slice(index, index + partner.takes).map((monster) => entry(monster, 1)),
    },
    match_score: partner.gives + partner.takes,
  }));
}

const json = (status, body) => ({ status, body: JSON.stringify(body) });
const error = (status, message) => json(status, { status, error: status, messages: { error: message } });

function page(items, query, max) {
  const limit = Math.min(Number(query.get("limit") ?? max), max);
  const offset = Number(query.get("offset") ?? 0);
  return { items: items.slice(offset, offset + limit), pagination: { total: items.length, limit, offset } };
}

/** The answer of the API to one request. */
export function answer({ method, url, body, key }) {
  if (key !== KEY) return error(401, "Missing or invalid API key");
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const query = url.searchParams;
  let match;

  if (method === "GET" && path === "/me") {
    return json(200, { data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-11-09T09:30:00Z" } });
  }
  if (method === "GET" && path === "/quests") {
    return json(200, { data: QUESTS.map((quest) => ({ ...quest, quest_template: template() })) });
  }
  if ((match = /^\/quests\/(\w+)$/.exec(path)) && method === "GET") {
    const quest = QUESTS.find((q) => q.slug === match[1]);
    if (!quest) return error(404, "Quest not found");
    return json(200, { data: { ...quest, quest_template: template() } });
  }
  if ((match = /^\/quests\/(\w+)\/monsters$/.exec(path)) && method === "GET") {
    const quest = QUESTS.find((q) => q.slug === match[1]);
    if (!quest) return error(404, "Quest not found");
    let list = STATE.get(quest.slug);
    const status = query.get("status");
    if (status === "needed") list = list.filter((monster) => monster.quantity < quest.parallel_quests);
    if (query.get("step")) list = list.filter((monster) => monster.step === Number(query.get("step")));
    const { items, pagination } = page(list, query, 200);
    return json(200, { data: { slug: quest.slug, monsters: items, pagination } });
  }
  if ((match = /^\/quests\/(\w+)\/monsters\/(\d+)$/.exec(path)) && method === "PATCH") {
    const quest = QUESTS.find((q) => q.slug === match[1]);
    const monster = STATE.get(match[1])?.find((m) => m.id === Number(match[2]));
    if (!quest) return error(404, "Quest not found");
    if (!monster) return error(400, "Monster not part of this quest");
    monster.quantity = JSON.parse(body).quantity;
    const status = monster.quantity - quest.parallel_quests;
    return json(200, { data: { monster_id: monster.id, quantity: monster.quantity, owned: monster.quantity, status, effective_offer: Math.max(status, 0), effective_want: Math.max(-status, 0) } });
  }
  if (method === "GET" && path === "/monsters") {
    return json(200, { data: [], pagination: { total: 0, limit: Number(query.get("limit") ?? 20), offset: 0 } });
  }
  if ((match = /^\/quests\/(\w+)\/matches$/.exec(path)) && method === "GET") {
    if (!STATE.has(match[1])) return error(404, "Quest not found");
    let list = matches(match[1]);
    if (query.get("only_possible_trades") === "1") list = list.filter((m) => m.matches.they_have_you_want.length > 0 && m.matches.you_have_they_want.length > 0);
    const { items, pagination } = page(list, query, 50);
    return json(200, { data: items, pagination });
  }
  return error(404, "Endpoint not found");
}
