---
title: Zones
description: "Read the zones and subzones of the game, and the monsters that live in a subzone."
sidebar:
  order: 5
---

The world of the game is cut into zones, themselves cut into subzones.

## Zones

`zones.list()` lists the zones, and `zones.get()` reads one with its subzones:

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // 3 characters at least

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

A zone is a name, an id or an object, see [Names and ids](/basics/names-and-ids/). Names work in French, English and Spanish: `"Sufokia Bay"` designates `"Baie de Sufokia"`.

## Subzones

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

The API reads a subzone through its zone. For the subzones of the package, the library finds the zone itself.

For a subzone added to the game after the package was published, give the zone as well:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Monsters of a subzone

`zones.monsters()` returns the monsters of a subzone, in a single array:

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

The other way, from a monster to its zones, see [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Walking a zone

The objects returned can be passed as they are to the next calls:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

That makes one request per subzone. The same walk is done without a request with [the data in the package](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  const count = data.monstersInSubzone(subzone).length;
  console.log(`${subzone.name.fr}: ${count}`);
}
```

## Your progress in a zone

The progress of one of your quests zone by zone is read with [`quests.zones()`](/resources/quests/#progress-by-zone).

## Limits and errors

- A search of fewer than 3 characters throws `INVALID_ARGUMENT`.
- A name that is neither in the package nor known to the API throws `UNKNOWN_NAME`, with suggestions.
- A subzone the package does not know, given without its zone, throws `UNKNOWN_NAME` and asks to pass `{ zone }`.
- Answers are [cached](/basics/caching/) for 10 minutes by default.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Zones`](/reference/zones/) | The zones and subzones of the game, and the monsters that live there. |
| [`Subzone`](/reference/subzone/) | A subzone with the zone it belongs to. |
| [`SubzoneParams`](/reference/subzone-params/) | Says which zone a subzone belongs to, for a subzone newer than the package. |
| [`SubzoneRef`](/reference/subzone-ref/) | A subzone as it appears in a list: its id and name. |
| [`Zone`](/reference/zone/) | A zone of the game. |
| [`ZoneDetail`](/reference/zone-detail/) | A zone with its subzones. |
<!-- exports:end -->
