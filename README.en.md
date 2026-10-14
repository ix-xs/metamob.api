<div align="center">

# @ix-xs/metamob.api

**The whole Metamob API, with every monster called by its name.**

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/@ix-xs/metamob.api?activeTab=dependencies)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![types](https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white)](#names-instead-of-ids)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentation](https://ix-xs.github.io/metamob.api/en/)** ·
[Français](./README.md) ·
[Español](./README.es.md) ·
[Getting started](https://ix-xs.github.io/metamob.api/en/start/quick-start/) ·
[Every method](https://ix-xs.github.io/metamob.api/en/reference/methods/) ·
[Changelog](./CHANGELOG.md)

</div>

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 or newer, Bun, Deno, browsers and edge runtimes. No dependencies: it is built on `fetch`.

---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

// Who the key belongs to, and their quests.
const me = await metamob.me();
const [quest] = await metamob.quests.list();

// A monster by its name, in French, English or Spanish. Accents and case do not matter.
const tofu = await metamob.monsters.get("Tofu Maléfique");
console.log(tofu.level_min, tofu.zones.map((zone) => zone.name.fr));

// What the quest still needs. Pages are fetched as you go.
for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
  console.log(monster.step, monster.name.fr);
}

// One more archmonster in the bag.
await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
```

It covers the 35 endpoints of the [Metamob API](https://www.metamob.fr/help/api): account, quests, monsters, zones, trade partners, Kralamoure events, private messages and all the reference data, for Dofus, Dofus Retro and Dofus Touch.

## What it does for you

| The API as it is | With this library |
| --- | --- |
| Everything is addressed by a numeric id | **Write the name.** `"Tofu Maléfique"`, `"evil tofu"` or `21`: monsters, zones, subzones, servers and kinds of monsters, in three languages |
| A typo is a 404, when it is not a write on the wrong monster | **Caught before the call is made**, with the closest names: `Did you mean "Tofu Maléfique"?` |
| `limit` and `offset` loops everywhere | **`for await`** over any list, or `.all()`, `.take(n)`, `.count()`, or one page with `await` |
| 60 requests a minute, then 429 | **A built-in limiter** that makes calls wait their turn, per key, instead of failing |
| 200 monsters at most per batch | **Pass a thousand.** They are split, sent in order and merged |
| A subzone needs the id of its zone | **`zones.subzone("Coin des Bouftous")`**: the zone is found for you |
| Reference data means requests | **`data`**: more than 800 monsters, the zones, the servers and the quest templates, in the package, answered from memory |
| The same lists are fetched again and again | **A cache** for what only changes when the game does, and identical calls in flight share one request |
| Errors are a status code and three body shapes | **`error.code`**, typed, plus `isNotFound`, `isRateLimited`, `isUnauthorized` |
| A bot serves many players, each with their key | **`metamob.withKey(theirKey)`**: same client, their account, their own rate limit window |

## Names instead of ids

Wherever the API expects an id, you can pass the id, the name, or an object that has the id. Your editor completes the names.

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique");  // accents and case do not matter
await metamob.monsters.get("Evil Tofu");       // English and Spanish work too

await metamob.monsters.list({ type: "archimonstre" });
await metamob.kralove.list({ server: "Draconiros" });
await metamob.zones.monsters("Coin des Bouftous");
await metamob.quests.zones(slug, { zone: "Amakna", type: "boss" });
```

A name that does not exist never reaches a quest:

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
  }
}
```

Ten archmonsters share their name between two versions of the game. When you write to a quest, the quest says which one is meant; elsewhere, add `{ gameVersion }`.

## Lists

Every paginated method returns a request you can await or iterate.

```ts
// One page.
const page = await metamob.monsters.list({ type: "boss", limit: 20 });
page.items, page.total, page.hasNext;

// Everything, lazily. The largest page size is used, which costs the fewest requests.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) { /* ... */ }

// An array, bounded or not.
const first100 = await metamob.users.search("ix-").take(100);
const wanted = await metamob.users.quest("Ix-xs", "21b0a742", { status: "wanted" }).all();

// Just the number, in one small request.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

Private messages are paginated with a cursor instead of an offset. The same methods work:

```ts
for await (const item of metamob.conversations.messages("Ix-xs")) {
  if (item.kind === "message") console.log(item.sender, item.content);
  else console.log(item.sender, "proposed a trade:", item.status);
}
```

## Your quests

```ts
const quest = await metamob.quests.get(slug);
quest.current_step, quest.parallel_quests, quest.trade_mode;

// Settings. Send only what changes.
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { never_offer_arch: true });

// Quantities, one at a time or in bulk.
await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// How many of a monster the quest offers and wants, instead of the automatic calculation.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });
await metamob.quests.resetTrade(slug, "Tofu Maléfique");

// Progress by zone, least advanced subzones first.
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(zone.name.fr, `${zone.completed}/${zone.total}`);
}
```

## Trade partners

```ts
const { items } = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

for (const match of items) {
  const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
  const takes = match.matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(match.user.username, { gives, takes });
}
```

Anyone's public quests can be read too, with what they look for and what they offer:

```ts
const profile = await metamob.users.get("Ix-xs");
const page = await metamob.users.quest("Ix-xs", profile.quests[0].slug, { status: "offered" });
page.quest.server?.name, page.items;
```

## The data in the package

Monsters, zones, subzones, servers and quest templates ship with the package. Reading them sends nothing and counts for nothing against the rate limit.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("Tofu Maléfique");                      // the monster, or undefined
data.searchMonsters("bouf", { type: "archimonstre" }); // autocomplete for a Discord command
data.zonesOf("Tofu Maléfique");                      // where it lives
data.archmonstersOf("Tofu");                         // its rare versions
data.monstersInSubzone("Coin des Bouftous");
data.server("Draconiros")?.game_version?.name;       // "Dofus (Unity)"
data.suggest("monster", "Tofu Malefik");             // ["Tofu Maléfique"]
data.fetchedAt;                                      // the day the data was read from the API
```

A monster added to the game after the package was published still works by name: when a name is not in the package, the API is asked before giving up.

## Rate limit, retries and caching

Metamob allows 60 requests a minute per key. The client counts them and makes the extra ones wait, so a loop over a few hundred monsters slows down instead of failing.

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
metamob.on("retry", ({ method, attempt, error }) => console.warn(method, attempt, error.message));
```

A 429, a server error or a network failure is retried with exponential backoff, honouring `Retry-After`. Every write of this API sets a value, so replaying one changes nothing.

Reference data is cached for 10 minutes. Anything tied to an account is not, unless you ask:

```ts
const metamob = new Metamob({
  apiKey,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h", methods: { "users.get": "30s", "kralove.list": "1m" } },
});
```

## Several players, several keys

A bot or a website acts for players who each handed over their own key. `withKey` gives a client for one of them. It shares the settings, the cache and the listeners of the client it comes from, and each key keeps its own window of 60 requests a minute.

```ts
const theirs = metamob.withKey(player.apiKey);

const account = await theirs.me(); // a key says who it belongs to
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

A single call can also bring its key: `metamob.quests.list({ apiKey })`.

This exists to act for players who agreed to it. It is not a way around the rate limit, which is there to protect a server run by one person.

## Errors

```ts
import { MetamobApiError, isMetamobError } from "@ix-xs/metamob.api";

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
```

Every error extends `MetamobError` and has a `code`: `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMITED`, `BAD_REQUEST`, `SERVER_ERROR`, `TIMEOUT`, `NETWORK`, `UNKNOWN_NAME`, `INVALID_ARGUMENT`, `MISSING_API_KEY` and a few more.

## Small things that save time

```ts
import { urls } from "@ix-xs/metamob.api";

urls.monsterImage(tofu);    // "https://www.metamob.fr/img/monsters/..."
urls.profile("Ix-xs");      // "https://www.metamob.fr/profile/Ix-xs"

tofu.name.fr, tofu.name.en, tofu.name.es;            // every name comes in three languages
await metamob.kralove.list({ from: new Date() });    // a Date or "YYYY-MM-DD"
await metamob.monsters.get("Tofu", {}, { signal });  // every call takes an AbortSignal
```

## Coming from 4.x

Version 5 is a rewrite in TypeScript. The same endpoints, a shorter way to call them:

| 4.x | 5.x |
| --- | --- |
| `const MetamobAPI = require("@ix-xs/metamob.api")` | `const { Metamob } = require("@ix-xs/metamob.api")`, or `import { Metamob }` |
| `new MetamobAPI({ api_key })` | `new Metamob({ apiKey })` |
| `{ ok, status, statusText, data }` | the data, or a thrown `MetamobApiError` |
| `getMonsters({ idOrName })`, `getMonsters({ ... })` | `monsters.get(ref)`, `monsters.list({ ... })` |
| `getUserQuests(username, { slug })` | `users.quest(username, slug)` |
| `getMyQuests()`, `getQuestMonsters(slug)` | `quests.list()`, `quests.monsters(slug)` |
| `updateQuestMonster(slug, idOrName, quantity)` | `quests.setMonster(slug, ref, quantity)` |
| `{ api_key }` in the options of a call | `{ apiKey }` as last argument, or `metamob.withKey(apiKey)` |
| `client.cache` | `data` |
| `@ix-xs/node-comfort` installed with it | no dependency |

The [migration page](https://ix-xs.github.io/metamob.api/en/start/migrating-from-v4/) lists every method.

## Documentation

Everything is on **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/en/)**, in English, [in French](https://ix-xs.github.io/metamob.api/) and [in Spanish](https://ix-xs.github.io/metamob.api/es/): guides, one page per resource, recipes, and the list of all methods. The same documentation is in your editor: every method, parameter and field carries its description and an example.

## License

[MIT](./LICENSE). Not affiliated with Metamob or Ankama. Dofus is a trademark of Ankama Games. The data embedded in the package comes from the Metamob API; using the API means following [its rules](https://www.metamob.fr/help/api), the rate limit first among them.
