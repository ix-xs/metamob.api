---
title: The data in the package
description: Monsters, zones, subzones, servers and quest templates ship with the package. The data object reads them from memory, with no request and no API key, which is what an autocomplete or a lookup command needs.
sidebar:
  order: 6
---

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## What is in it

A copy of the reference data of the API, taken when the package was published: every monster, zone, subzone, server, version of the game, kind of monster, kind of quest and quest template, with which monsters live in which subzone and which monsters each quest template asks for.

`data.fetchedAt` is the day the copy was taken. The records have the shape the API gives them, so what you read from `data` and what you get from a call are interchangeable.

The client has it too: `metamob.data` is the same object.

## Finding one record

Each kind has a method that takes an id, a name or an object with an id, and returns the record or `undefined`. Nothing throws.

```ts
data.monster("Bouftou Royal"); // by name, in any of the three languages
data.monster(305); // by id
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Searching monsters

`searchMonsters` finds the monsters whose name contains a text, in any language, names that start with it first. It is fast enough to run on every keystroke.

```ts
data.searchMonsters("bouf"); // 25 at most by default
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

For a text that matches nothing, `suggest` gives the closest names:

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // up to 5 names
```

## Following the links

```ts
// Where a monster lives.
data.subzonesOf("Tofu Maléfique").map((subzone) => `${subzone.zone.name.fr} > ${subzone.name.fr}`);
data.zonesOf("Tofu Maléfique");

// What lives somewhere.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// A monster and its archmonster.
data.archmonstersOf("Tofu"); // the archmonsters that have it as reference
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Quest templates

A quest template is what a kind of quest asks for in a version of the game: the Ochre quest on Dofus Touch, for instance.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

data.templateMonsters(ochreOnTouch).length; // every monster of the quest, in order
data.templateMonsters(ochreOnTouch, { step: 4 }); // those of step 4
data.stepOf("Tofu Maléfique", ochreOnTouch); // the step this monster belongs to
data.templatesOf("Tofu Maléfique"); // the quest templates that ask for it
```

## The plain lists

```ts
data.monsters; // every monster
data.zones; // every zone, each with its subzones
data.subzones; // every subzone, each with its zone
data.servers;
data.gameVersions;
data.monsterTypes;
data.questTypes;
data.questTemplates;
```

They are read-only arrays, built once on first use. The whole data set is decoded the first time anything is read, which takes a few milliseconds.

## When the game changes

A new monster, zone or server reaches the package with its next release. In between, nothing breaks:

- A call given a name the package does not know asks the API before giving up, see [Names and ids](/basics/names-and-ids/#when-a-name-is-unknown).
- An id always works, known or not.
- `data` itself only knows what it shipped with: `data.monster("a brand new monster")` is `undefined` until you update the package.

To read what the API says right now, use the calls: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) and the [reference lists](/resources/reference-data/).

## In a browser

`data` needs neither a key nor a network, so it runs in a page. Importing only `data` leaves the client out of your bundle; the data set itself weighs about 30 kB once compressed. The search box on the home page of this site is exactly that.

## Reference

| Member | Returns |
| --- | --- |
| `monster(ref, hint?)` | `Monster \| undefined` |
| `monstersNamed(name)` | `Monster[]`, more than one for a shared name |
| `searchMonsters(query, { type, gameVersion, template, limit })` | `Monster[]` |
| `zone(ref)`, `subzone(ref)` | `ZoneDetail \| undefined`, `Subzone \| undefined` |
| `server(ref)`, `gameVersion(ref)` | `Server \| undefined`, `GameVersion \| undefined` |
| `monsterType(ref)`, `questType(ref)` | `MonsterType \| undefined`, `QuestType \| undefined` |
| `questTemplate(ref)` | `QuestTemplate \| undefined` |
| `subzonesOf(monster)`, `zonesOf(monster)` | `Subzone[]`, `Zone[]` |
| `monstersInSubzone(subzone)`, `monstersInZone(zone)` | `Monster[]` |
| `archmonstersOf(monster)` | `Monster[]` |
| `templatesOf(monster)` | `QuestTemplate[]` |
| `templateMonsters(template, { step })` | `TemplateMonster[]` |
| `stepOf(monster, template)` | `number \| undefined` |
| `suggest(kind, text, limit?)` | `string[]` |
| `fetchedAt` | `string`, as `YYYY-MM-DD` |

## See also

- [Names and ids](/basics/names-and-ids/)
- [Monsters](/resources/monsters/)
- [A Discord command with autocomplete](/recipes/discord-command/)
- [Caching](/basics/caching/)
