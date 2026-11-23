---
title: Die Daten im Paket
description: "Monster, Zonen, Server und Quest-Vorlagen sind im Paket enthalten. data liest sie aus dem Speicher, ohne Anfrage und ohne API-Schlüssel."
sidebar:
  order: 6
---

Das Paket enthält eine Kopie der Referenzdaten der API. Das Objekt `data` fragt sie direkt ab, was zu einer Autovervollständigung oder einem Suchbefehl passt:

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Was enthalten ist

Die Referenzdaten der API zum Zeitpunkt der Veröffentlichung des Pakets: Monster, Zonen, Unterzonen, Server, Spielversionen, Monstertypen, Questtypen und Quest-Vorlagen. Mit den Verbindungen zwischen ihnen: den Monstern jeder Unterzone und denen, die jede Quest-Vorlage verlangt. Jede Spielversion hat dort ihre eigenen Monster, Zonen und Unterzonen, jeweils mit ihrer `game_version` und ihrer `official_id`.

`data.fetchedAt` ist das Datum der Kopie. Die Datensätze haben die Form, die die API ihnen gibt: Was Sie aus `data` lesen, hat dieselbe Form wie die Antwort eines Aufrufs.

Der Client hat sie ebenfalls: `metamob.data` ist dasselbe Objekt.

## Einen Datensatz finden

Jede Art hat eine Methode, die eine ID, einen Namen oder ein Objekt mit ID nimmt und den Datensatz oder `undefined` zurückgibt. Nichts wirft einen Fehler.

```ts
data.monster("Bouftou Royal"); // über den Namen, in jeder der fünf Sprachen der Website
data.monster(305); // über die ID
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Monster suchen

`searchMonsters` findet die Monster, deren Name einen Text enthält, in jeder der fünf Sprachen der Website, zuerst die Namen, die mit diesem Text beginnen. Es ist schnell genug, um bei jedem Tastendruck zu laufen.

```ts
data.searchMonsters("bouf"); // standardmäßig höchstens 25
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

Für einen Text, der auf nichts passt, liefert `suggest` die nächstliegenden Namen:

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // bis zu 5 Namen
```

## Den Verbindungen folgen

```ts
// Wo ein Monster lebt.
data.zonesOf("Tofu Maléfique");
data.subzonesOf("Tofu Maléfique").map((subzone) => subzone.name.fr);

// Was irgendwo lebt.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// Ein Monster und sein Archimonster.
data.archmonstersOf("Tofu"); // die Archimonster, die es als Referenz haben
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Quest-Vorlagen

Eine Quest-Vorlage ist das, was ein Questtyp in einer Spielversion verlangt: zum Beispiel die Ocker-Quest auf Dofus Touch.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

data.templateMonsters(ochreOnTouch).length; // jedes Monster der Quest, in Reihenfolge
data.templateMonsters(ochreOnTouch, { step: 4 }); // die der Stufe 4
data.stepOf("Tofu Maléfique", ochreOnTouch); // die Stufe, zu der dieses Monster gehört
data.templatesOf("Tofu Maléfique", { gameVersion: "Dofus Touch" }); // die Quest-Vorlagen, die es verlangen
```

## Die einfachen Listen

```ts
data.monsters; // jedes Monster
data.zones; // jede Zone, jeweils mit ihren Unterzonen
data.subzones; // jede Unterzone, jeweils mit ihrer Zone
data.servers;
data.gameVersions;
data.monsterTypes;
data.questTypes;
data.questTemplates;
```

Es sind schreibgeschützte Arrays. Die Daten werden beim ersten Lesen dekodiert, in wenigen Millisekunden.

## Wenn sich das Spiel ändert

Ein neues Monster, eine neue Zone oder ein neuer Server kommt mit der nächsten Version ins Paket. In der Zwischenzeit:

- ein Aufruf mit einem Namen, den das Paket nicht kennt, sucht ihn auch in der API, siehe [Namen und IDs](/basics/names-and-ids/#when-a-name-is-unknown);
- eine ID funktioniert immer, ob das Paket sie kennt oder nicht;
- `data` kennt nur seine Kopie: Ein neueres Monster ist dort `undefined`, bis das Paket aktualisiert wird.

Um zu lesen, was die API gerade sagt, nutzen Sie die Aufrufe: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) und die [Referenzlisten](/resources/reference-data/).

## In einem Browser

`data` braucht weder einen Schlüssel noch ein Netzwerk: Es funktioniert auch auf einer Webseite. Wenn Sie nur `data` importieren, bleibt der Client aus Ihrem Bundle heraus, und die Daten wiegen komprimiert etwa 30 kB. Die Seite [Ausprobieren](/help/playground/) funktioniert so.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Dataset`](/reference/dataset/) | Die im Paket enthaltenen Referenzdaten von Metamob (Monster, Zonen, Unterzonen, Server, Spielversionen und Quest-Vorlagen), Stand [`Dataset.fetchedAt`](/reference/dataset/). |
| [`data`](/reference/data/) | Die im Paket enthaltenen Referenzdaten. |
| [`MonsterHint`](/reference/monster-hint/) | Was zwei gleichnamige Monster unterscheidet. |
| [`MonsterSearchOptions`](/reference/monster-search-options/) | Optionen von [`Dataset.searchMonsters`](/reference/dataset/). |
<!-- exports:end -->
