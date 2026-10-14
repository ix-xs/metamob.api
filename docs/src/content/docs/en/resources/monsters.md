---
title: Monsters
description: Search the monsters of the game by name in three languages, filter them by kind, and read one with the zones where it lives and, for an archmonster, the monster it is the rare version of.
sidebar:
  order: 4
---

```ts
const tofu = await metamob.monsters.get("Tofu Maléfique");

console.log(tofu.name.en); // "Evil Tofu"
console.log(tofu.level_min, tofu.level_max);
console.log(tofu.zones.map((zone) => zone.name.fr)); // ["Amakna"]
```

## Reading one monster

`monsters.get()` takes a name, an id or an object, see [Names and ids](/basics/names-and-ids/). On top of what a list gives, the answer has the zones and subzones where the monster can be found.

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // the monster it is the rare version of
urls.monsterImage(monster); // its picture on metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

A few archmonsters share their name between two versions of the game. A hint says which one you mean, a version of the game here, or a quest template with `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Listing and filtering

`monsters.list()` is a [list](/basics/lists/), 200 monsters per page at most.

```ts
// One page of bosses.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Every archmonster.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}
```

`type` is `"monstre"`, `"boss"` or `"archimonstre"`, their English or Spanish names, or 1, 2 or 3.

## Searching by name

A search matches a part of the name, in French, English or Spanish. It needs 3 characters at least.

```ts
const found = await metamob.monsters.search("bouf").all();
const archmonsters = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// The same, written with list().
await metamob.monsters.list({ query: "bouf" });
```

## Without a request

For names, levels, kinds and where a monster lives, [the data in the package](/basics/embedded-data/) answers from memory. It is the right tool for an autocomplete, where a request per keystroke would eat the rate limit in seconds.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // no request
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Ask the API when you need the state of the game right now, for instance just after an update of the game.

## Monsters of a quest

Which monsters a quest asks for, and in which step, is a matter of [quest templates](/resources/reference-data/#quest-templates). What you own of them is under [Your quests](/resources/quests/#the-monsters-of-a-quest).

## Limits and errors

- A search shorter than 3 characters throws `INVALID_ARGUMENT` before a request is spent.
- An id that does not exist answers `NOT_FOUND`. A name that does not exist throws `UNKNOWN_NAME`, with suggestions.
- Answers are [cached](/basics/caching/) for 10 minutes by default.

## Reference

| Method | Returns |
| --- | --- |
| `monsters.get(monster, { gameVersion, template }?, options?)` | `MonsterDetail` |
| `monsters.list({ query, type, limit, offset }, options?)` | a list of `Monster` |
| `monsters.search(query, { type, limit, offset }, options?)` | a list of `Monster` |

A `Monster`:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `number` | |
| `name` | `{ fr, en, es }` | The name in three languages |
| `image` | `string` | File name of the picture, see `urls.monsterImage()` |
| `level_min`, `level_max` | `number` | |
| `type` | `MonsterType \| null` | `{ id, name }`: monster, boss or archmonster |
| `reference` | `{ id, name }` or absent | For an archmonster, its base monster |
| `zones` | `ZoneDetail[]` | Only from `get()`: zones, each with the subzones concerned |

## See also

- [Names and ids](/basics/names-and-ids/)
- [The data in the package](/basics/embedded-data/)
- [Zones](/resources/zones/)
- [Reference data](/resources/reference-data/)
