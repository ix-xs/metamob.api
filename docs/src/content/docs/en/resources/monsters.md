---
title: Monsters
description: "Read a monster with its zones, list monsters by kind and search them by name."
sidebar:
  order: 4
---

## Reading one monster

`monsters.get()` takes a name, an id or an object, see [Names and ids](/basics/names-and-ids/). The answer also has the zones and subzones where the monster lives:

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // the monster it is the rare version of
urls.monsterImage(monster); // its picture on metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

A few archmonsters have the same name in two versions of the game. Say which one with a version of the game, or a quest template with `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Listing and filtering

`monsters.list()` is a [list](/basics/lists/) of 200 monsters per page at most:

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

`monsters.search()` looks for a part of the name, in French, English or Spanish, from 3 characters:

```ts
const found = await metamob.monsters.search("bouf").all();
const arch = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// The same, written with list().
await metamob.monsters.list({ query: "bouf" });
```

## Without a request

The names, levels, kinds and zones of monsters are also in [the data in the package](/basics/embedded-data/). For an autocomplete, which searches on every keystroke, that is what to use: one request per keystroke would quickly reach the limit.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // no request
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Go through the API for today's data, for example right after a game update.

## Monsters of a quest

The monsters a quest asks for, step by step, come from the [quest templates](/resources/reference-data/#quest-templates). What you own of them is read in [Your quests](/resources/quests/#the-monsters-of-a-quest).

## Limits and errors

- A search of fewer than 3 characters throws `INVALID_ARGUMENT` before sending.
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
| `zones` | `ZoneDetail[]` | Only with `get()`: the zones, each with the subzones concerned |
