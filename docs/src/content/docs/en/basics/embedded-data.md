---
title: The data in the package
description: "Monsters, zones, servers and quest templates are included in the package. data reads them from memory, with no request and no API key."
sidebar:
  order: 6
---

The package holds a copy of the reference data of the API. The `data` object queries it directly, which suits an autocomplete or a lookup command:

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## What is in it

The reference data of the API at the time the package was published: monsters, zones, subzones, servers, versions of the game, kinds of monsters, kinds of quests and quest templates. With the links between them: the monsters of each subzone, and those each quest template asks for.

`data.fetchedAt` is the date of the copy. The records have the shape the API gives them: what you read from `data` has the same shape as the answer of a call.

The client has it too: `metamob.data` is the same object.

## Finding one record

Each kind has a method that takes an id, a name or an object with an id, and returns the record or `undefined`. Nothing throws an error.

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

`searchMonsters` finds the monsters whose name contains a text, in any of the three languages, starting with the names that begin with that text. It is fast enough to run on every keystroke.

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
data.zonesOf("Tofu Maléfique");
data.subzonesOf("Tofu Maléfique").map((subzone) => subzone.name.fr);

// What lives somewhere.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// A monster and its archmonster.
data.archmonstersOf("Tofu"); // the archmonsters that have it as reference
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Quest templates

A quest template is what a kind of quest asks for in a version of the game: the Ochre quest on Dofus Touch, for example.

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

They are read-only arrays. The data is decoded the first time it is read, in a few milliseconds.

## When the game changes

A new monster, zone or server reaches the package with its next release. In the meantime:

- a call given a name the package does not know also looks for it in the API, see [Names and ids](/basics/names-and-ids/#when-a-name-is-unknown);
- an id always works, known to the package or not;
- `data` only knows its copy: a newer monster is `undefined` there until the package is updated.

To read what the API says right now, use the calls: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) and the [reference lists](/resources/reference-data/).

## In a browser

`data` needs neither a key nor a network: it also works in a web page. Importing only `data` leaves the client out of your bundle, and the data weighs about 30 kB once compressed. The [Try it](/help/playground/) page works this way.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Dataset`](/reference/dataset/) | The reference data of Metamob embedded in the package (monsters, zones, subzones, servers, game versions and quest templates), as of [`Dataset.fetchedAt`](/reference/dataset/). |
| [`data`](/reference/data/) | The reference data embedded in the package. |
| [`MonsterHint`](/reference/monster-hint/) | What tells two monsters of the same name apart. |
| [`MonsterSearchOptions`](/reference/monster-search-options/) | Options of [`Dataset.searchMonsters`](/reference/dataset/). |
<!-- exports:end -->
