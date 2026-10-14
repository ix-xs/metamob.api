---
title: Coming from version 4
description: Version 5 is a rewrite. The endpoints are the same, the way to call them is shorter. This page maps every method of version 4 to its replacement.
---

```ts
// Version 4
// const MetamobAPI = require("@ix-xs/metamob.api");
// const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });
// const res = await client.getMonsters({ idOrName: "Tofu Maléfique" });
// if (res.ok) console.log(res.data.name.fr);

// Version 5
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });
const monster = await metamob.monsters.get("Tofu Maléfique");
console.log(monster.name.fr);
```

## What changed

| | Version 4 | Version 5 |
| --- | --- | --- |
| Import | a default class, CommonJS only | a named `Metamob` class, ES modules and CommonJS |
| Options | `api_key` | `apiKey` |
| Result | `{ ok, status, statusText, data, pagination, error }` | the data itself |
| Failure | `ok: false` | a thrown [`MetamobApiError`](/basics/errors/) |
| Lists | one page per call | a request to [await or iterate](/basics/lists/) |
| One or many | `getX({ idOrName })` or `getX()` | `x.get(ref)` and `x.list()` |
| Another player's key | `{ api_key }` in the options | `{ apiKey }` as last argument, or [`withKey()`](/basics/many-keys/) |
| Embedded data | `client.cache` | [`data`](/basics/embedded-data/), searchable |
| Rate limit | yours to handle | [handled](/basics/rate-limit/) |
| Dependencies | `@ix-xs/node-comfort` | none |
| Node.js | 18 | 20 or newer |

## Results and errors

Version 4 never threw: you tested `ok`. Version 5 returns the data and throws when the API refuses.

```ts
try {
  const profile = await metamob.users.get(username);
  console.log(profile.quests.length);
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) console.log("No such user.");
  else throw error;
}
```

`error.status` is the HTTP status, as before. `error.code` is easier to test: see [Errors](/basics/errors/).

## Lists

A paginated call used to resolve to `{ data, pagination }`, and you looped on `offset`. It now returns a request. Awaited, it gives a page with `items`, `total`, `limit` and `offset`. Iterated, it gives every item.

```ts
// Version 4
// let offset = 0;
// while (true) {
//   const { data, pagination } = await client.getMonsters({ limit: 200, offset });
//   ...
//   offset += data.length;
//   if (offset >= pagination.total) break;
// }

// Version 5
for await (const monster of metamob.monsters.list()) {
  console.log(monster.name.fr);
}
```

## Every method

| Version 4 | Version 5 |
| --- | --- |
| `getMe()` | `metamob.me()` |
| `getGameVersions()`, `getGameVersions({ idOrName })` | `gameVersions.list()`, `gameVersions.get(ref)` |
| `getServers()`, `getServers({ idOrName })` | `servers.list()`, `servers.get(ref)` |
| `getMonsterTypes()`, `getMonsterTypes({ idOrName })` | `monsterTypes.list()`, `monsterTypes.get(ref)` |
| `getQuestTypes()`, `getQuestTypes({ idOrName })` | `questTypes.list()`, `questTypes.get(ref)` |
| `getQuestTemplates()` | `questTemplates.list()` |
| `getQuestTemplates({ id, step })` | `questTemplates.monsters(template, { step })` |
| `getMonsters({ query, typeIdOrName })` | `monsters.list({ query, type })` |
| `getMonsters({ idOrName })` | `monsters.get(ref)` |
| `getZones({ query })`, `getZones({ idOrName })` | `zones.list({ query })`, `zones.get(ref)` |
| `getSubZones({ zoneIdOrName, query })` | `zones.subzones(zone, { query })` |
| `getSubZones({ idOrName })` | `zones.subzone(ref)` |
| `getSubZoneMonsters(ref)` | `zones.monsters(ref)` |
| `getKraloves({ serverIdOrName, from })` | `kralove.list({ server, from })` |
| `getKraloves({ id })` | `kralove.get(id)` |
| `searchUsers(query, { serverIdOrName, active_within_days })` | `users.search(query, { server, activeWithinDays })` |
| `getUser(username)` | `users.get(username)` |
| `getUserQuests(username)` | `users.quests(username)` |
| `getUserQuests(username, { slug, monsterTypeIdOrName, status, step })` | `users.quest(username, slug, { type, status, step })` |
| `getConversations({ status })` | `conversations.list({ status })` |
| `getMessages(username, { before_id })` | `conversations.messages(username, { beforeId })` |
| `getMyQuests()` | `quests.list()` |
| `getQuest(slug)` | `quests.get(slug)` |
| `updateQuest(slug, changes)` | `quests.update(slug, changes)` |
| `getQuestMonsters(slug, { monsterTypeIdOrName, status, trade, step })` | `quests.monsters(slug, { type, status, trade, step })` |
| `updateQuestMonster(slug, ref, quantity)` | `quests.setMonster(slug, ref, quantity)` |
| `updateQuestMonsters(slug, list)` | `quests.setMonsters(slug, quantities)` |
| `setQuestMonsterTrade(slug, ref, trade)` | `quests.setTrade(slug, ref, trade)`, `quests.resetTrade(slug, ref)` |
| `getQuestMatches(slug, { min_parallel_quests, only_possible_trades })` | `quests.matches(slug, { minParallelQuests, onlyPossibleTrades })` |
| `getQuestZones(slug, { zoneIdOrName, subzoneIdOrName, monsterTypeIdOrName })` | `quests.zones(slug, { zone, subzone, type })` |

The parameters that designate something lost their `IdOrName` suffix: `serverIdOrName` is `server`, `typeIdOrName` and `monsterTypeIdOrName` are `type`. Options of the library are in camelCase. What the API returns keeps the names the API gives it, in snake_case.

## The key of another player

```ts
// Version 4
// await client.updateQuestMonster(slug, "Tofu", 2, { api_key: theirKey });

// Version 5: one call
await metamob.quests.setMonster(slug, "Tofu", 2, { apiKey: theirKey });

// Version 5: a client for that player
const theirs = metamob.withKey(theirKey);
await theirs.quests.setMonster(slug, "Tofu", 2);
```

## The embedded data

`client.cache.monsters` and its siblings are now `data.monsters`, `data.zones`, `data.subzones`, `data.servers`, `data.questTemplates`, `data.gameVersions`, `data.monsterTypes` and `data.questTypes`, with methods to search them. See [The data in the package](/basics/embedded-data/).

```ts
import { data } from "@ix-xs/metamob.api";

data.monsters.length;
data.monster("Tofu Maléfique")?.id;
```

Version 4 shipped 50 of the 192 subzones. Version 5 ships all of them, so `zones.subzone("...")` and `zones.monsters("...")` now recognise every subzone by name.

## Things that are stricter

- A name the library cannot find throws `UNKNOWN_NAME` with suggestions. Version 4 resolved to `{ ok: false }`.
- A search of fewer than 3 characters throws `INVALID_ARGUMENT` before a request is spent. The API refuses it anyway.
- Ten archmonsters share their name between two versions of the game. Version 4 took the first one. Version 5 picks the one of the quest you write to, see [Names and ids](/basics/names-and-ids/#monsters-that-share-a-name).

## See also

- [Quick start](/start/quick-start/)
- [Every method](/reference/methods/)
- [Configuration](/basics/configuration/)
- [The changelog](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
