---
title: Names and ids
description: "Monsters, zones, servers and the rest can be designated by their id, their name or an object. What is accepted, and what happens when a name is unknown."
sidebar:
  order: 1
---

A monster can be given by its id or by its name, in any of the three languages of the site:

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique"); // accents and case do not matter
await metamob.monsters.get("Evil Tofu"); // English
await metamob.monsters.get("Tofu maléfico"); // Spanish
```

## What can be designated by name

| What | Accepted | Where |
| --- | --- | --- |
| A monster | id, name in French, English or Spanish, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| A zone | id, name in the three languages, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| A subzone | id, name in the three languages, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| A server | id, name, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| A kind of monster | 1, 2, 3, or `monstre`, `boss`, `archimonstre` and their translations | every `type` filter |
| A version of the game | id, name, `{ id }` | `gameVersions.get`, the `gameVersion` hint |
| A kind of quest | id, slug (`ocre`, `dokille`), name | `questTypes.get` |
| A quest template | id, `{ id }`, or `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

A quest is always designated by its slug and a player by their username: those are strings the API takes as they are.

Your editor completes the names. They are literal types, generated from the data in the package, and any other string is still accepted.

## Passing an object

An object with a numeric `id` works too: the result of one call can be passed as it is to the next.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## How a name is matched

A name is compared after removing accents, ignoring case, treating every kind of apostrophe and of dash as one, and collapsing multiple spaces. `"TOFU  MALEFIQUE"` and `"Tofu Maléfique"` are the same name. Nothing else is forgiven: a missing letter gives a different name.

The lookup happens in the data included in the package, without a request. A string made only of digits, such as `"21"`, is read as an id.

## When a name is unknown

A name that is not in the package may be newer than the package. The library then asks the API once, with a search. If the API does not know it either, the call throws a `MetamobArgumentError` with the code `UNKNOWN_NAME` and the closest names.

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (error instanceof MetamobArgumentError) {
    error.code; // "UNKNOWN_NAME"
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
    error.suggestions; // ["Tofu Maléfique"]
  }
}
```

In that case, nothing is sent to the API.

To offer suggestions yourself, before any call:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // the monsters whose name contains "tofu"
```

## Monsters that share a name

Six pairs of monsters, mostly archmonsters, share a name in at least one language, across two versions of the game, with two different ids. "Crognan le Barbare" is one monster on Dofus (Unity) and another on Dofus Retro and Dofus Touch.

When you write to a quest, the quest decides. The library reads once the template the quest follows, and takes the monster of that template.

```ts
// The right "Crognan le Barbare" for this quest, whatever its version of the game.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

Elsewhere, say which one you want:

```ts
const name = "Crognan le Barbare";

const unity = await metamob.monsters.get(name, { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get(name, { gameVersion: "Dofus Touch" });

// Or by quest template.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get(name, { template: ochreOnRetro });
```

Without a hint, the monster of the quest template with the lowest id is returned. `data.monstersNamed(name)` lists every monster that answers to a name.

## Subzones and their zone

The API needs the zone of a subzone to read it. When the subzone is in the package, the library finds its zone:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

A subzone added to the game after the package was published is not in it yet: give its zone.

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`normalizeName`](/reference/normalize-name/) | The form names are compared in: no accents, lower case, one kind of apostrophe and of dash, single spaces. |
| [`GameVersionLike`](/reference/game-version-like/) | A version of the game: its id, its name, or an object with its `id`. |
| [`MonsterLike`](/reference/monster-like/) | A monster: its id, its name in French, English or Spanish, or an object with its `id`. |
| [`MonsterTypeLike`](/reference/monster-type-like/) | A kind of monster: its id (1, 2, 3), its name in French, English or Spanish, or an object with its `id`. |
| [`QuestTemplateLike`](/reference/quest-template-like/) | A quest template: its id, an object with its `id`, or the kind of quest and the version of the game it is for. |
| [`QuestTypeLike`](/reference/quest-type-like/) | A kind of quest: its id, its slug (`ocre`, `dokille`), its name, or an object with its `id`. |
| [`ServerLike`](/reference/server-like/) | A server: its id, its name, or an object with its `id`. |
| [`SubzoneLike`](/reference/subzone-like/) | A subzone: its id, its name in French, English or Spanish, or an object with its `id`. |
| [`ZoneLike`](/reference/zone-like/) | A zone: its id, its name in French, English or Spanish, or an object with its `id`. |
| [`GameVersionName`](/reference/game-version-name/), [`MonsterNameEn`](/reference/monster-name-en/), [`MonsterNameEs`](/reference/monster-name-es/), [`MonsterNameFr`](/reference/monster-name-fr/), [`MonsterTypeNameEn`](/reference/monster-type-name-en/), [`MonsterTypeNameEs`](/reference/monster-type-name-es/), [`MonsterTypeNameFr`](/reference/monster-type-name-fr/), [`QuestTemplateId`](/reference/quest-template-id/), [`QuestTypeNameEn`](/reference/quest-type-name-en/), [`QuestTypeNameEs`](/reference/quest-type-name-es/), [`QuestTypeNameFr`](/reference/quest-type-name-fr/), [`QuestTypeSlug`](/reference/quest-type-slug/), [`ServerName`](/reference/server-name/), [`SubzoneNameEn`](/reference/subzone-name-en/), [`SubzoneNameEs`](/reference/subzone-name-es/), [`SubzoneNameFr`](/reference/subzone-name-fr/), [`ZoneNameEn`](/reference/zone-name-en/), [`ZoneNameEs`](/reference/zone-name-es/), [`ZoneNameFr`](/reference/zone-name-fr/) | The names the package knows, one type per language: monsters, zones, subzones, kinds of monster and of quest, servers, game versions. |
<!-- exports:end -->
