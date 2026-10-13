// Type-level tests: what the editor accepts, refuses and infers. Nothing here
// runs; `npm run test:types` compiles it.

import {
  type Account,
  type ConversationItem,
  type GameVersionName,
  ListRequest,
  type MethodId,
  METHODS,
  Metamob,
  type Monster,
  type MonsterDetail,
  type MonsterLike,
  type MonsterNameFr,
  type OwnQuestMonster,
  type Page,
  type PublicQuest,
  type QuestMonster,
  type ServerName,
  type TemplateHeader,
  type TemplateMonster,
  type TradeMatch,
  type ZoneNameEn,
  data,
} from "../../src/index.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
declare function expect<T extends true>(): T;
declare const metamob: Metamob;
declare const slug: string;

// The names known to the package are literal types, which is what makes the editor complete them.
expect<"Tofu Maléfique" extends MonsterNameFr ? true : false>();
expect<"Draconiros" extends ServerName ? true : false>();
expect<"Dofus Touch" extends GameVersionName ? true : false>();
expect<"Sufokia Bay" extends ZoneNameEn ? true : false>();
expect<string extends MonsterNameFr ? false : true>();

// A reference is an id, a known name, any other string, or an object with an id.
const references: MonsterLike[] = [21, "Tofu Maléfique", "A monster added to the game yesterday", { id: 21 }, {} as Monster];
void references;
// @ts-expect-error a boolean designates nothing
const wrong: MonsterLike = true;
void wrong;

export async function results() {
  expect<Equal<Awaited<ReturnType<typeof metamob.me>>, Account>>();
  expect<Equal<Awaited<ReturnType<typeof metamob.monsters.get>>, MonsterDetail>>();

  // A list awaits to a page and iterates over items.
  const request = metamob.monsters.list();
  expect<Equal<typeof request, ListRequest<Monster>>>();
  const page = await request;
  expect<Equal<typeof page.items, Monster[]>>();
  expect<Equal<typeof page.total, number | undefined>>();
  for await (const monster of request) expect<Equal<typeof monster, Monster>>();
  expect<Equal<Awaited<ReturnType<typeof request.all>>, Monster[]>>();
  expect<Equal<Awaited<ReturnType<typeof request.first>>, Monster | undefined>>();
  expect<Equal<Awaited<ReturnType<typeof request.count>>, number | undefined>>();
  for await (const each of request.pages()) expect<typeof each extends Page<Monster> ? true : false>();

  // Some pages carry what the list belongs to.
  const template = await metamob.questTemplates.monsters({ questType: "ocre", gameVersion: "Dofus Touch" });
  expect<Equal<typeof template.template, TemplateHeader>>();
  expect<Equal<typeof template.items, TemplateMonster[]>>();
  const publicQuest = await metamob.users.quest("Ix-xs", slug);
  expect<Equal<typeof publicQuest.quest, PublicQuest>>();
  expect<Equal<typeof publicQuest.items, QuestMonster[]>>();
  const own = await metamob.quests.monsters(slug);
  expect<Equal<typeof own.slug, string>>();
  expect<Equal<typeof own.items, OwnQuestMonster[]>>();
  expect<Equal<(typeof own.items)[number]["trade_offer"], number | null>>();
  const matches = await metamob.quests.matches(slug);
  expect<Equal<typeof matches.items, TradeMatch[]>>();

  // A conversation item is told apart by `kind`.
  for await (const item of metamob.conversations.messages("Ix-xs")) {
    expect<Equal<typeof item, ConversationItem>>();
    if (item.kind === "message") item.content satisfies string;
    else item.monsters_given satisfies { monster_id: number; quantity: number }[];
  }
}

export async function refused() {
  // @ts-expect-error `status` of your own quest takes five values
  metamob.quests.monsters(slug, { status: "missing" });
  // @ts-expect-error a public quest only shows what is wanted and offered
  metamob.users.quest("Ix-xs", slug, { status: "needed" });
  // @ts-expect-error `trade_mode` is 0 or 1
  await metamob.quests.update(slug, { trade_mode: 2 });
  // @ts-expect-error a quantity is a number
  await metamob.quests.setMonster(slug, "Tofu", "2");
  // @ts-expect-error unknown setting
  await metamob.quests.update(slug, { nickname: "x" });
  // @ts-expect-error unknown option of the client
  new Metamob({ api_key: "old spelling" });
  // @ts-expect-error unknown event
  metamob.on("quota", () => {});
  // @ts-expect-error unknown method in the cache options
  new Metamob({ cache: { methods: { "monsters.find": "1d" } } });
}

export function accepted() {
  // Three shapes for a batch of quantities.
  void metamob.quests.setMonsters(slug, [{ monster: "Tofu Maléfique", quantity: 1 }, { monster: 397, quantity: 0 }]);
  void metamob.quests.setMonsters(slug, { "Tofu Maléfique": 1 });
  void metamob.quests.setMonsters(slug, new Map<MonsterLike, number>([[397, 2]]));
  // Durations are numbers of milliseconds or strings with a unit.
  new Metamob({ timeout: 5000, cache: { ttl: "1d" }, rateLimit: { requests: 30, per: "1m" } });
  new Metamob("the key alone");
  // Every method id is a key of METHODS.
  const id: MethodId = "quests.setMonsters";
  METHODS[id].path satisfies string;
  // The embedded data answers without a promise.
  expect<Equal<ReturnType<typeof data.monster>, Monster | undefined>>();
  expect<Equal<ReturnType<typeof data.searchMonsters>, Monster[]>>();
}
