// The code samples of README.md, compiled by `npm run test:types` so the
// front page of the package cannot drift from the library.

import { Metamob, MetamobApiError, data, isMetamobError, urls } from "../../src/index.js";

declare const apiKey: string, slug: string;
declare const player: { apiKey: string };
declare const signal: AbortSignal;

export async function intro() {
  const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

  const me = await metamob.me();
  const [quest] = await metamob.quests.list();
  if (!quest) return me;

  const tofu = await metamob.monsters.get("Tofu Maléfique");
  console.log(tofu.level_min, tofu.zones.map((zone) => zone.name.fr));

  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
  return me;
}

export async function names(metamob: Metamob) {
  await metamob.monsters.get(21);
  await metamob.monsters.get("Tofu Maléfique");
  await metamob.monsters.get("tofu malefique");
  await metamob.monsters.get("Evil Tofu");

  await metamob.monsters.list({ type: "archimonstre" });
  await metamob.kralove.list({ server: "Draconiros" });
  await metamob.zones.monsters("Coin des Bouftous");
  await metamob.quests.zones(slug, { zone: "Amakna", type: "boss" });

  try {
    await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
  } catch (error) {
    if (isMetamobError(error, "UNKNOWN_NAME")) {
      error.message;
    }
  }
}

export async function lists(metamob: Metamob) {
  const page = await metamob.monsters.list({ type: "boss", limit: 20 });
  page.items, page.total, page.hasNext;

  for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
    monster.name.fr;
  }

  const first100 = await metamob.users.search("ix-").take(100);
  const wanted = await metamob.users.quest("Ix-xs", "21b0a742", { status: "wanted" }).all();

  const left = await metamob.quests.monsters(slug, { status: "needed" }).count();

  for await (const item of metamob.conversations.messages("Ix-xs")) {
    if (item.kind === "message") console.log(item.sender, item.content);
    else console.log(item.sender, "proposed a trade:", item.status);
  }
  return [first100, wanted, left];
}

export async function quests(metamob: Metamob) {
  const quest = await metamob.quests.get(slug);
  quest.current_step, quest.parallel_quests, quest.trade_mode;

  await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
  await metamob.quests.update(slug, { never_offer_arch: true });

  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
  await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

  await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });
  await metamob.quests.resetTrade(slug, "Tofu Maléfique");

  for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
    console.log(zone.name.fr, `${zone.completed}/${zone.total}`);
  }
}

export async function trading(metamob: Metamob) {
  const { items } = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

  for (const match of items) {
    const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
    const takes = match.matches.you_have_they_want.map((monster) => monster.name.fr);
    console.log(match.user.username, { gives, takes });
  }

  const profile = await metamob.users.get("Ix-xs");
  const page = await metamob.users.quest("Ix-xs", profile.quests[0]!.slug, { status: "offered" });
  page.quest.server?.name, page.items;
}

export function embedded() {
  data.monster("Tofu Maléfique");
  data.searchMonsters("bouf", { type: "archimonstre" });
  data.zonesOf("Tofu Maléfique");
  data.archmonstersOf("Tofu");
  data.monstersInSubzone("Coin des Bouftous");
  data.server("Draconiros")?.game_version?.name;
  data.suggest("monster", "Tofu Malefik");
  data.fetchedAt;
}

export function limits(metamob: Metamob) {
  metamob.rateLimit;

  metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
  metamob.on("retry", ({ method, attempt, error }) => console.warn(method, attempt, error.message));

  return new Metamob({
    apiKey,
    timeout: "10s",
    retry: { attempts: 5 },
    cache: { ttl: "1h", methods: { "users.get": "30s", "kralove.list": "1m" } },
  });
}

export async function keys(metamob: Metamob) {
  const theirs = metamob.withKey(player.apiKey);

  const account = await theirs.me();
  await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);

  await metamob.quests.list({ apiKey });
  return account;
}

export async function errors(metamob: Metamob) {
  try {
    await metamob.users.get("nobody-by-that-name");
  } catch (error) {
    if (error instanceof MetamobApiError && error.isNotFound) {
      // no such user
    } else if (isMetamobError(error, "UNAUTHORIZED")) {
      // the key was revoked
    } else {
      throw error;
    }
  }
}

export async function small(metamob: Metamob) {
  const tofu = await metamob.monsters.get("Tofu Maléfique");
  urls.monsterImage(tofu);
  urls.profile("Ix-xs");

  tofu.name.fr, tofu.name.en, tofu.name.es;
  await metamob.kralove.list({ from: new Date() });
  await metamob.monsters.get("Tofu", {}, { signal });
}
