---
title: Names and ids
description: Wherever the API expects a numeric id, you can write the name, the id, or pass the object another call returned. This page says what is accepted, how names are matched and what happens when one is unknown.
sidebar:
  order: 1
---

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
| A zone | id, name in three languages, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| A subzone | id, name in three languages, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| A server | id, name, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| A kind of monster | 1, 2, 3, or `monstre`, `boss`, `archimonstre` and their translations | every `type` filter |
| A version of the game | id, name, `{ id }` | `gameVersions.get`, the `gameVersion` hint |
| A kind of quest | id, slug (`ocre`, `dokille`), name | `questTypes.get` |
| A quest template | id, `{ id }`, or `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

A quest is always designated by its slug and a player by their username: those are strings the API takes as they are.

Your editor completes the names. They are literal types, generated from the data in the package, and any other string is still accepted.

## Passing an object

Anything with a numeric `id` works, so the result of one call feeds the next without picking the id out.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## How a name is matched

A name is compared after removing accents, ignoring case, treating every kind of apostrophe as the same and collapsing spaces. `"TOFU  MALEFIQUE"` and `"Tofu Maléfique"` are the same name. Nothing else is forgiven: a missing letter is a different name.

The lookup happens in the data that ships with the package, so it costs no request. A string made only of digits, such as `"21"`, is read as an id.

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

The write is never sent: a typo cannot change the wrong monster.

To offer suggestions yourself, before calling anything:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // monsters whose name contains "tofu"
```

## Monsters that share a name

Ten archmonsters have the same name in two versions of the game, with two different ids. "Crognan le Barbare" is one monster on Dofus (Unity) and another on Dofus Retro and Dofus Touch.

When you write to a quest, the quest decides. The library reads which template the quest follows, once, and picks the monster of that template.

```ts
// The right "Crognan le Barbare" for this quest, whatever its version of the game.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

Elsewhere, say which one you mean:

```ts
const unity = await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });

// Or by quest template.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get("Crognan le Barbare", { template: ochreOnRetro });
```

Without a hint, the monster whose quest template has the lowest id is returned. `data.monstersNamed(name)` lists every monster that answers to a name.

## Subzones and their zone

The API addresses a subzone through its zone. The library finds the zone for you when the subzone is in the package:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

A subzone added to the game after the package was published is not known yet, and needs its zone:

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

## Reference

| Type | Accepts |
| --- | --- |
| `MonsterLike` | `number`, a monster name, `{ id }` |
| `ZoneLike`, `SubzoneLike` | `number`, a name, `{ id }` |
| `ServerLike`, `GameVersionLike` | `number`, a name, `{ id }` |
| `MonsterTypeLike` | `number`, a name, `{ id }` |
| `QuestTypeLike` | `number`, a slug, a name, `{ id }` |
| `QuestTemplateLike` | `number`, `{ id }`, `{ questType, gameVersion }` |
| `MonsterHint` | `{ gameVersion }`, `{ template }` |

## See also

- [The data in the package](/basics/embedded-data/)
- [Monsters](/resources/monsters/)
- [Errors](/basics/errors/)
- [Reference data](/resources/reference-data/)
