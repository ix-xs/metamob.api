// Checks the library against the real API: every read endpoint, the shape
// of what comes back, and the embedded data against what the API serves.
//
//   npm run live
//
// Needs METAMOB_API_KEY in `.env`. It sends about 30 requests, held at 45 a
// minute by the client's own rate limiter. With METAMOB_QUEST_SLUG set to one of your
// quests, it also exercises the write endpoints on a single monster and puts
// everything back the way it was.

import env from "@ix-xs/node-comfort/env";
import { Metamob, MetamobApiError, data } from "../../src/index.js";

let config: { METAMOB_API_KEY: string; METAMOB_QUEST_SLUG?: string | undefined };
try {
  config = env.validate({ METAMOB_API_KEY: { type: "string", minLength: 20 }, METAMOB_QUEST_SLUG: { type: "string", optional: true } });
} catch (error) {
  console.error((error as Error).message);
  console.error("Put your key in .env (see .env.example).");
  process.exit(2);
}

const metamob = new Metamob({ apiKey: config.METAMOB_API_KEY, cache: false, rateLimit: { requests: 45, per: "1m" } });
let requests = 0;
metamob.on("request", () => requests++);
metamob.on("rateLimit", ({ delay }) => console.log(`  (rate limiter: waited ${Math.round(delay / 1000)} s)`));

let failures = 0;
const ISO_DATE = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$");
const problems: string[] = [];

/** Reports what a record has beyond `expected`, and what it lacks. */
function shape(label: string, record: unknown, expected: string[], optional: string[] = []): void {
  if (!record || typeof record !== "object") return void problems.push(`${label}: expected an object, got ${record === null ? "null" : typeof record}`);
  const keys = Object.keys(record);
  const extra = keys.filter((key) => !expected.includes(key) && !optional.includes(key));
  const missing = expected.filter((key) => !(key in record));
  if (extra.length) problems.push(`${label}: fields the types do not describe: ${extra.join(", ")}`);
  if (missing.length) problems.push(`${label}: fields the types promise but the API did not send: ${missing.join(", ")}`);
  const id = (record as { id?: unknown }).id;
  if (id !== undefined && typeof id !== "number") problems.push(`${label}: id is a ${typeof id}`);
}

/** The API documents every date as ISO 8601 in UTC, with the Z suffix. */
function date(label: string, value: unknown): void {
  if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) problems.push(`${label}: expected a date like 2026-01-27T20:00:00Z, got ${JSON.stringify(value)}`);
}

async function step<T>(name: string, run: () => Promise<T>): Promise<T | undefined> {
  try {
    const result = await run();
    console.log(`ok    ${name}`);
    return result;
  } catch (error) {
    failures++;
    const detail = error instanceof MetamobApiError ? `${error.status} ${error.message}` : (error as Error).message;
    console.log(`FAIL  ${name}: ${detail}`);
    return undefined;
  }
}

const MONSTER = ["id", "name", "image", "level_min", "level_max", "type"];
const QUEST = ["slug", "character_name", "current_step", "parallel_quests", "server", "quest_template"];

const me = await step("me()", async () => {
  const account = await metamob.me();
  shape("Account", account, ["username", "bio", "avatar", "last_active"]);
  date("Account.last_active", account.last_active);
  return account;
});
if (!me) {
  console.error("\nThe key does not work: nothing else can be checked.");
  process.exit(1);
}
console.log(`      signed in as ${me.username}`);

await step("reference data matches the embedded copy", async () => {
  const [versions, servers, monsterTypes, questTypes, templates] = await Promise.all([metamob.gameVersions.list(), metamob.servers.list(), metamob.monsterTypes.list(), metamob.questTypes.list(), metamob.questTemplates.list()]);
  shape("GameVersion", versions[0], ["id", "name"]);
  shape("Server", servers[0], ["id", "name", "community", "game_version"]);
  shape("MonsterType", monsterTypes[0], ["id", "name"]);
  shape("QuestType", questTypes[0], ["id", "slug", "name", "image"]);
  shape("QuestTemplate", templates[0], ["id", "quest_type", "game_version", "monster_count", "step_count"]);
  const drift = (label: string, live: { id: number }[], embedded: readonly { id: number }[]) => {
    const now = live.map((record) => record.id).sort((a, b) => a - b).join(",");
    const then = embedded.map((record) => record.id).sort((a, b) => a - b).join(",");
    if (now !== then) problems.push(`${label}: the API lists ${live.length}, the embedded data ${embedded.length}. Run \`npm run data:update\`.`);
  };
  drift("servers", servers, data.servers);
  drift("game versions", versions, data.gameVersions);
  drift("quest types", questTypes, data.questTypes);
  drift("quest templates", templates, data.questTemplates);
  const communities = [...new Set(servers.map((server) => server.community))].filter((community) => community !== "World" && community !== "France");
  if (communities.length) problems.push(`servers: communities the types do not list: ${communities.join(", ")}`);
});

await step("monsters.list() and count()", async () => {
  const page = await metamob.monsters.list({ limit: 3 });
  shape("Monster", page.items[0], MONSTER, ["reference"]);
  if (page.total !== data.monsters.length) problems.push(`monsters: the API has ${page.total}, the embedded data ${data.monsters.length}. Run \`npm run data:update\`.`);
  const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
  console.log(`      ${page.total} monsters, ${archmonsters} archmonsters`);
});

await step('monsters.get("Tofu") and search', async () => {
  const tofu = await metamob.monsters.get("Tofu");
  shape("MonsterDetail", tofu, [...MONSTER, "zones"], ["reference"]);
  if (tofu.id !== data.monster("Tofu")?.id) problems.push("monsters.get: the API and the embedded data disagree on the id of Tofu");
  const found = await metamob.monsters.search("tofu").take(3);
  if (!found.length) problems.push("monsters.search: nothing found for tofu");
});

await step("zones: list, get, subzone, monsters", async () => {
  const zones = await metamob.zones.list();
  shape("Zone", zones[0], ["id", "name"]);
  if (zones.length !== data.zones.length) problems.push(`zones: the API lists ${zones.length}, the embedded data ${data.zones.length}. Run \`npm run data:update\`.`);
  const zone = await metamob.zones.get(zones[0]!);
  shape("ZoneDetail", zone, ["id", "name", "subzones"]);
  const first = zone.subzones[0];
  if (first) {
    shape("Subzone", await metamob.zones.subzone(first, { zone }), ["id", "name", "zone"]);
    const monsters = await metamob.zones.monsters(first, { zone });
    if (monsters[0]) shape("Monster of a subzone", monsters[0], MONSTER, ["reference"]);
  }
  const total = (await Promise.all(zones.slice(0, 3).map((candidate) => metamob.zones.subzones(candidate)))).flat().length;
  console.log(`      ${zones.length} zones, ${total} subzones in the first three`);
});

await step("questTemplates.monsters()", async () => {
  const page = await metamob.questTemplates.monsters(1, { limit: 2 });
  shape("TemplateHeader", page.template, ["id", "quest_type", "game_version"]);
  shape("TemplateMonster", page.items[0], [...MONSTER, "step"], ["reference"]);
});

await step("kralove.list() and get()", async () => {
  const events = await metamob.kralove.list();
  if (!events.length) return void console.log("      no event to read");
  shape("KraloveEvent", events[0], ["id", "event_datetime", "description", "creator", "participants_count", "character_count", "messages_count", "server"]);
  date("KraloveEvent.event_datetime", events[0]!.event_datetime);
  shape("KraloveEventDetail", await metamob.kralove.get(events[0]!), ["id", "event_datetime", "description", "creator", "server", "participants", "messages"]);
});

const slugs = await step("users: search, get, quests, quest", async () => {
  const page = await metamob.users.search(me.username.slice(0, 3), { limit: 3 });
  if (page.items[0]) shape("UserSummary", page.items[0], ["username", "avatar", "last_active"]);
  if (page.items[0]) date("UserSummary.last_active", page.items[0].last_active);
  const profile = await metamob.users.get(me.username);
  shape("UserProfile", profile, ["username", "bio", "avatar", "last_active", "quests"]);
  const quests = await metamob.users.quests(me.username);
  if (!quests[0]) return void console.log("      no public quest to read");
  shape("PublicQuestSummary", quests[0], [...QUEST, "wanted_count", "offered_count"]);
  shape("QuestTemplateRef", quests[0].quest_template, ["id", "quest_type", "monster_count", "step_count"]);
  const monsters = await metamob.users.quest(me.username, quests[0].slug, { limit: 2 });
  shape("PublicQuest", monsters.quest, QUEST);
  shape("QuestMonster", monsters.items[0], [...MONSTER, "step", "quantity", "want", "offer"], ["reference"]);
});
void slugs;

const PROPOSAL = ["id", "sender", "recipient", "status", "server", "quest_template", "sender_quest", "recipient_quest", "monsters_given", "monsters_received", "applications", "cancelled_at", "cancelled_by", "created_at", "read_at"];

/** Checks a proposal against its type, wherever it comes from. */
function proposal(label: string, item: Record<string, unknown>, extra: string[] = [], optional: string[] = []): void {
  shape(label, item, [...PROPOSAL, ...extra], optional);
  date(`${label}.created_at`, item.created_at);
  for (const key of ["cancelled_at", "read_at"]) if (item[key] !== null) date(`${label}.${key}`, item[key]);
  if (item.server !== null) shape(`${label}.server`, item.server, ["id", "name", "community", "game_version"]);
  if (item.quest_template !== null) shape(`${label}.quest_template`, item.quest_template, ["id", "quest_type"]);
}

/** Runs a call the API must refuse with this code. */
async function refused(code: string, run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (error instanceof MetamobApiError && error.code === code) return;
    throw new Error(`expected ${code}, got ${error instanceof MetamobApiError ? `${error.status} ${error.code}` : (error as Error).message}`);
  }
  throw new Error(`expected ${code}, the call succeeded`);
}

await step("conversations: list, messages, unread_count, markAsRead", async () => {
  const page = await metamob.conversations.list({ limit: 10 });
  for (const conversation of page.items) {
    shape("Conversation", conversation, ["username", "message_count", "unread_count", "last_message_at"]);
    date("Conversation.last_message_at", conversation.last_message_at);
    if (!Number.isInteger(conversation.unread_count) || conversation.unread_count < 0) problems.push(`Conversation.unread_count: ${conversation.unread_count}`);
  }
  await refused("NOT_FOUND", () => metamob.conversations.markAsRead("zz-nobody-zz-0000"));
  const read = page.items.find((conversation) => conversation.unread_count === 0);
  if (read) {
    // Nothing unread there, so marking it changes nothing.
    const result = await metamob.conversations.markAsRead(read.username);
    if (result.marked_count !== 0) problems.push(`markAsRead on a read conversation marked ${result.marked_count}`);
  }
  if (!page.items[0]) return void console.log("      no conversation to read");
  const items = await metamob.conversations.messages(page.items[0].username, { limit: 5 });
  for (const item of items) {
    date(`${item.kind}.created_at`, item.created_at);
    if (item.kind === "message") shape("ConversationMessage", item, ["kind", "id", "content", "sender", "created_at", "read_at"]);
    // The API still sends the two deprecated fields for a while.
    else proposal("ConversationProposal", item as unknown as Record<string, unknown>, ["kind"], ["server_id", "quest_type"]);
  }
});

await step("tradeProposals: list, get, filters", async () => {
  const page = await metamob.tradeProposals.list({ limit: 5 });
  for (const item of page.items) proposal("TradeProposal", item as unknown as Record<string, unknown>);
  const recent = await metamob.tradeProposals.list({ direction: "received", status: "pending", since: new Date(Date.now() - 30 * 86_400_000), limit: 5 });
  for (const item of recent.items) if (item.status !== "pending") problems.push(`tradeProposals status filter let through ${item.status}`);
  await refused("NOT_FOUND", () => metamob.tradeProposals.get(2_000_000_000));
  if (!page.items[0]) return void console.log("      no trade proposal to read");
  const detail = await metamob.tradeProposals.get(page.items[0]);
  proposal("TradeProposalDetail", detail as unknown as Record<string, unknown>);
  for (const monster of [...detail.monsters_given, ...detail.monsters_received]) shape("ProposalMonsterDetail", monster, ["monster_id", "quantity", "owned"]);
});

const own = await step("quests: list, get, monsters, matches, zones", async () => {
  const quests = await metamob.quests.list();
  if (!quests[0]) return void console.log("      the account has no quest");
  shape("OwnQuest", quests[0], [...QUEST, "show_trades", "is_favorite"]);
  const slug = quests[0].slug;
  shape("QuestSettings", await metamob.quests.get(slug), [...QUEST, "show_trades", "is_favorite", "trade_mode", "trade_offer_threshold", "trade_want_threshold", "type_filters"]);
  const page = await metamob.quests.monsters(slug, { limit: 2 });
  shape("OwnQuestMonster", page.items[0], [...MONSTER, "step", "quantity", "want", "offer", "trade_offer", "trade_want"], ["reference"]);
  const needed = await metamob.quests.monsters(slug, { status: "needed" }).count();
  const matches = await metamob.quests.matches(slug, { limit: 2 });
  if (matches.items[0]) shape("TradeMatch", matches.items[0], ["user", "quest", "matches", "match_score"]);
  const zones = await metamob.quests.zones(slug, { zone: 1 });
  if (zones[0]) {
    shape("ZoneProgress", zones[0], ["id", "name", "completed", "total", "subzones"]);
    const monster = zones[0].subzones[0]?.monsters[0];
    if (monster) shape("ZoneProgressMonster", monster, ["id", "name", "image", "type", "step", "owned", "required", "status", "offer", "want"]);
  }
  console.log(`      ${quests.length} quests; ${needed} of ${page.total} monsters still needed in ${slug}`);
  return quests.map((quest) => quest.slug);
});

const writable = config.METAMOB_QUEST_SLUG;
if (!writable) {
  console.log("skip  writes (set METAMOB_QUEST_SLUG to one of your quests to check them)");
} else if (own && !own.includes(writable)) {
  failures++;
  console.log(`FAIL  writes: ${writable} is not one of the quests of this account`);
} else {
  await step(`writes on ${writable}, then back to how it was`, async () => {
    const page = await metamob.quests.monsters(writable, { limit: 1 });
    const monster = page.items[0];
    if (!monster) throw new Error("the quest has no monster");
    const before = { quantity: monster.quantity, trade_offer: monster.trade_offer, trade_want: monster.trade_want };
    const target = before.quantity === 0 ? 1 : before.quantity - 1;
    try {
      const single = await metamob.quests.setMonster(writable, monster, target);
      shape("MonsterQuantityResult", single, ["monster_id", "quantity", "owned", "status", "effective_offer", "effective_want"]);
      if (single.quantity !== target) problems.push(`setMonster: asked for ${target}, the API answered ${single.quantity}`);
      const batch = await metamob.quests.setMonsters(writable, [{ monster, quantity: before.quantity }]);
      shape("MonstersUpdateResult", batch, ["updated_count", "monsters"]);
      shape("TradeOverrideResult", await metamob.quests.setTrade(writable, monster, { trade_offer: 0 }), ["monster_id", "trade_offer", "trade_want", "effective_offer", "effective_want"]);
    } finally {
      await metamob.quests.setMonster(writable, monster, before.quantity);
      await metamob.quests.setTrade(writable, monster, { trade_offer: before.trade_offer, trade_want: before.trade_want });
    }
    const after = (await metamob.quests.monsters(writable, { limit: 1 })).items[0]!;
    if (after.quantity !== before.quantity || after.trade_offer !== before.trade_offer || after.trade_want !== before.trade_want) {
      throw new Error(`${monster.name.fr} was not put back: ${JSON.stringify(before)} became ${JSON.stringify({ quantity: after.quantity, trade_offer: after.trade_offer, trade_want: after.trade_want })}`);
    }
    console.log(`      ${monster.name.fr} went from ${before.quantity} to ${target} and back`);
  });
}

console.log(`\n${requests} requests sent. Embedded data fetched on ${data.fetchedAt}.`);
if (problems.length) {
  console.log(`\n${problems.length} thing${problems.length === 1 ? "" : "s"} to look at:`);
  for (const problem of [...new Set(problems)]) console.log(`  - ${problem}`);
}
if (failures || problems.length) process.exit(1);
console.log("Everything matches.");
