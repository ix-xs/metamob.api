---
title: Zonen
description: "Die Zonen und Unterzonen des Spiels lesen, und die Monster, die in einer Unterzone leben."
sidebar:
  order: 5
---

Die Welt des Spiels ist in Zonen aufgeteilt, die wiederum in Unterzonen aufgeteilt sind.

## Zonen

`zones.list()` listet die Zonen auf, und `zones.get()` liest eine mit ihren Unterzonen:

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // mindestens 3 Zeichen

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

Eine Zone ist ein Name, eine ID oder ein Objekt, siehe [Namen und IDs](/basics/names-and-ids/). Namen funktionieren in den fünf Sprachen der Website: `"Sufokia Bay"` bezeichnet `"Baie de Sufokia"`. Jede Spielversion hat ihre eigenen Zonen, mit ihrer `game_version`: Ein Name bezeichnet die von Dofus (Unity). Für eine andere Version filtern Sie mit `zones.list({ gameVersion })` und übergeben die ID.

## Unterzonen

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Die API liest eine Unterzone über ihre Zone. Für die Unterzonen des Pakets findet die Bibliothek die Zone selbst.

Für eine Unterzone, die nach der Veröffentlichung des Pakets ins Spiel kam, geben Sie auch die Zone an:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Monster einer Unterzone

`zones.monsters()` gibt die Monster einer Unterzone zurück, in einem einzigen Array:

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

Für den umgekehrten Weg, von einem Monster zu seinen Zonen, siehe [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Eine Zone durchlaufen

Die zurückgegebenen Objekte lassen sich unverändert an die nächsten Aufrufe übergeben:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Das ergibt eine Anfrage pro Unterzone. Derselbe Durchlauf geht ohne Anfrage mit [den Daten im Paket](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  const count = data.monstersInSubzone(subzone).length;
  console.log(`${subzone.name.fr}: ${count}`);
}
```

## Ihr Fortschritt in einer Zone

Den Fortschritt einer Ihrer Quests Zone für Zone lesen Sie mit [`quests.zones()`](/resources/quests/#progress-by-zone).

## Grenzen und Fehler

- Eine Suche mit weniger als 3 Zeichen wirft `INVALID_ARGUMENT`.
- Ein Name, der weder im Paket steht noch der API bekannt ist, wirft `UNKNOWN_NAME`, mit Vorschlägen.
- Eine Unterzone, die das Paket nicht kennt und die ohne ihre Zone angegeben wird, wirft `UNKNOWN_NAME` und verlangt, `{ zone }` zu übergeben.
- Antworten werden standardmäßig 10 Minuten [zwischengespeichert](/basics/caching/).

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Zones`](/reference/zones/) | Die Zonen und Unterzonen des Spiels und die Monster, die dort leben. |
| [`Subzone`](/reference/subzone/) | Eine Unterzone mit der Zone, zu der sie gehört. |
| [`SubzoneParams`](/reference/subzone-params/) | Gibt an, zu welcher Zone eine Unterzone gehört, für eine Unterzone, die neuer ist als das Paket. |
| [`SubzoneRef`](/reference/subzone-ref/) | Eine Unterzone, wie ein Monster oder eine Quest sie nennt: ihre ID und ihr Name. |
| [`Zone`](/reference/zone/) | Eine Zone des Spiels. |
| [`ZoneDetail`](/reference/zone-detail/) | Eine Zone mit ihren Unterzonen. |
| [`ZoneListParams`](/reference/zone-list-params/) | Filter von [`Zones.list`](/reference/zones/). |
| [`ZoneSubzone`](/reference/zone-subzone/) | Eine Unterzone, wie eine Zone sie auflistet. |
<!-- exports:end -->
