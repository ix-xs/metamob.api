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

Each version of the game has its own monsters, and most have the same name from one version to the next. Without more, it is the one of Dofus (Unity). Ask for another version, or a quest template with `{ template }`:

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

// The monsters of Dofus Retro, and one monster by its id in the game client.
const retro = metamob.monsters.list({ gameVersion: "Dofus Retro (1.29)" });
const [tofu] = await metamob.monsters.list({ gameVersion: "Dofus (Unity)", officialId: 98 }).take(1);
```

`type` is `"monstre"`, `"boss"` or `"archimonstre"`, their translations, or 1, 2 or 3. `gameVersion` keeps the monsters of one version of the game. `officialId` looks for a monster by its id in the game client, the same as DofusDB for Dofus (Unity): it is unique within a version only, hence `gameVersion` next to it. Every monster carries both, `game_version` and `official_id`.

## Searching by name

`monsters.search()` looks for a part of the name, in every language of the site, from 3 characters:

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

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Monsters`](/reference/monsters/) | The monsters of the game. |
| [`urls`](/reference/urls/) | Addresses on metamob.fr, built from what the API returns. |
| [`Monster`](/reference/monster/) | A monster, with its version of the game. |
| [`MonsterBase`](/reference/monster-base/) | A monster, wherever it appears inside something else: a quest, a step. |
| [`MonsterDetail`](/reference/monster-detail/) | A monster with the places it lives in. |
| [`MonsterListParams`](/reference/monster-list-params/) | Filters of [`Monsters.list`](/reference/monsters/). |
| [`MonsterReference`](/reference/monster-reference/) | The base monster of an archmonster. |
| [`MonsterType`](/reference/monster-type/) | A kind of monster: 1 is a monster, 2 a boss, 3 an archmonster. |
| [`MonsterZone`](/reference/monster-zone/) | A zone where a monster lives, with the subzones concerned. |
| [`TemplateMonster`](/reference/template-monster/) | A monster of a quest template, with the step it belongs to. |
<!-- exports:end -->
