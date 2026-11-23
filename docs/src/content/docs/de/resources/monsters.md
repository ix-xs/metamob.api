---
title: Monster
description: "Ein Monster mit seinen Zonen lesen, Monster nach Typ auflisten und sie über den Namen suchen."
sidebar:
  order: 4
---

## Ein Monster lesen

`monsters.get()` nimmt einen Namen, eine ID oder ein Objekt, siehe [Namen und IDs](/basics/names-and-ids/). Die Antwort enthält auch die Zonen und Unterzonen, in denen das Monster lebt:

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // das Monster, dessen seltene Version es ist
urls.monsterImage(monster); // sein Bild auf metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Jede Spielversion hat ihre eigenen Monster, und die meisten haben von einer Version zur nächsten denselben Namen. Ohne weitere Angabe ist es das von Dofus (Unity). Fragen Sie nach einer anderen Version oder einer Quest-Vorlage mit `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Auflisten und filtern

`monsters.list()` ist eine [Liste](/basics/lists/) mit höchstens 200 Monstern pro Seite:

```ts
// Eine Seite Bosse.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Jedes Archimonster.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}

// Die Monster von Dofus Retro, und ein Monster über seine ID im Spielclient.
const retro = metamob.monsters.list({ gameVersion: "Dofus Retro (1.29)" });
const [tofu] = await metamob.monsters.list({ gameVersion: "Dofus (Unity)", officialId: 98 }).take(1);
```

`type` ist `"monstre"`, `"boss"` oder `"archimonstre"`, ihre Übersetzungen, oder 1, 2 oder 3. `gameVersion` behält die Monster einer Spielversion. `officialId` sucht ein Monster über seine ID im Spielclient, dieselbe wie bei DofusDB für Dofus (Unity): Sie ist nur innerhalb einer Version eindeutig, daher `gameVersion` daneben. Jedes Monster trägt beide, `game_version` und `official_id`.

## Über den Namen suchen

`monsters.search()` sucht nach einem Teil des Namens, in jeder Sprache der Website, ab 3 Zeichen:

```ts
const found = await metamob.monsters.search("bouf").all();
const arch = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// Dasselbe, mit list() geschrieben.
await metamob.monsters.list({ query: "bouf" });
```

## Ohne Anfrage

Die Namen, Level, Typen und Zonen der Monster sind auch in [den Daten im Paket](/basics/embedded-data/). Für eine Autovervollständigung, die bei jedem Tastendruck sucht, ist das die richtige Wahl: Eine Anfrage pro Tastendruck würde schnell das Limit erreichen.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // keine Anfrage
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Gehen Sie über die API für die Daten von heute, zum Beispiel direkt nach einem Spielupdate.

## Monster einer Quest

Die Monster, die eine Quest verlangt, Stufe für Stufe, stammen aus den [Quest-Vorlagen](/resources/reference-data/#quest-templates). Was Sie davon besitzen, lesen Sie in [Ihre Quests](/resources/quests/#the-monsters-of-a-quest).

## Grenzen und Fehler

- Eine Suche mit weniger als 3 Zeichen wirft `INVALID_ARGUMENT` vor dem Senden.
- Eine ID, die nicht existiert, antwortet `NOT_FOUND`. Ein Name, der nicht existiert, wirft `UNKNOWN_NAME`, mit Vorschlägen.
- Antworten werden standardmäßig 10 Minuten [zwischengespeichert](/basics/caching/).

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Monsters`](/reference/monsters/) | Die Monster des Spiels. |
| [`urls`](/reference/urls/) | Adressen auf metamob.fr, gebildet aus dem, was die API zurückgibt. |
| [`Monster`](/reference/monster/) | Ein Monster, mit seiner Spielversion. |
| [`MonsterBase`](/reference/monster-base/) | Ein Monster, wo immer es innerhalb von etwas anderem erscheint: einer Quest, einer Stufe. |
| [`MonsterDetail`](/reference/monster-detail/) | Ein Monster mit den Orten, an denen es lebt. |
| [`MonsterListParams`](/reference/monster-list-params/) | Filter von [`Monsters.list`](/reference/monsters/). |
| [`MonsterReference`](/reference/monster-reference/) | Das Basismonster eines Archimonsters. |
| [`MonsterType`](/reference/monster-type/) | Eine Monsterart: 1 ist ein Monster, 2 ein Boss, 3 ein Archimonster. |
| [`MonsterZone`](/reference/monster-zone/) | Eine Zone, in der ein Monster lebt, mit den betroffenen Unterzonen. |
| [`TemplateMonster`](/reference/template-monster/) | Ein Monster einer Quest-Vorlage, mit der Stufe, zu der es gehört. |
<!-- exports:end -->
