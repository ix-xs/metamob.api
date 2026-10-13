---
title: Zones
description: The world of the game is cut into zones and subzones. Read them, search them by name, and list the monsters that live in a subzone.
sidebar:
  order: 5
---

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

console.log(monsters.map((monster) => monster.name.fr));
```

## Zones

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // 3 characters at least

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

A zone is a name, an id or an object, see [Names and ids](/basics/names-and-ids/). Names work in French, English and Spanish: `"Sufokia Bay"` is `"Baie de Sufokia"`.

## Subzones

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

The API addresses a subzone through its zone. You do not have to: the library knows which zone each subzone of the package is in.

For a subzone added to the game after the package was published, give the zone as well:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Monsters of a subzone

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

The answer is a plain array: a subzone holds a handful of monsters.

To go the other way, from a monster to its zones, read [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Walking a zone

Pass the objects along instead of their ids:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

That is one request per subzone. The same walk costs nothing with [the data in the package](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  console.log(`${subzone.name.fr}: ${data.monstersInSubzone(subzone).length}`);
}
```

## Your progress in a zone

How far one of your quests is in each zone is another call, [`quests.zones()`](/resources/quests/#progress-by-zone).

## Limits and errors

- A search shorter than 3 characters throws `INVALID_ARGUMENT`.
- A name that is neither in the package nor known to the API throws `UNKNOWN_NAME`, with suggestions.
- A subzone the package does not know, given without its zone, throws `UNKNOWN_NAME` and says to pass `{ zone }`.
- Answers are [cached](/basics/caching/) for 10 minutes by default.

## Reference

| Method | Returns |
| --- | --- |
| `zones.list({ query }, options?)` | `Zone[]` |
| `zones.get(zone, options?)` | `ZoneDetail`, the zone with its `subzones` |
| `zones.subzones(zone, { query }, options?)` | `SubzoneRef[]` |
| `zones.subzone(subzone, { zone }?, options?)` | `Subzone`, the subzone with its `zone` |
| `zones.monsters(subzone, { zone }?, options?)` | `Monster[]` |

A zone and a subzone both have an `id` and a `name` in three languages.

## See also

- [Monsters](/resources/monsters/)
- [Your quests](/resources/quests/)
- [The data in the package](/basics/embedded-data/)
- [Names and ids](/basics/names-and-ids/)
