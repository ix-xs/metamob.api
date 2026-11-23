---
title: Referenzdaten
description: "Spielversionen, Server, Monstertypen, Questtypen und Quest-Vorlagen."
sidebar:
  order: 10
---

Diese Listen sind die, auf die sich der Rest der API bezieht.

## Zuerst das Paket fragen

Alle diese Daten sind auch im Paket enthalten, und [`data`](/basics/embedded-data/) liest sie ohne Anfrage: `data.servers`, `data.server("Draconiros")`, `data.questTemplates` und so weiter. Die Aufrufe unten fragen die API, für den Fall, dass Sie die Daten von heute wollen.

Ihre Antworten werden standardmäßig 10 Minuten [zwischengespeichert](/basics/caching/), für jeden Schlüssel.

## Spielversionen

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Server

Jeder Server gehört zu einer Spielversion und zu einer Community:

```ts
const servers = await metamob.servers.list();
const server = await metamob.servers.get("Draconiros");

server.community; // "World" oder "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Monstertypen

Es gibt drei: Monster, Boss und Archimonster, mit den IDs 1, 2 und 3. Jeder Filter `type` akzeptiert ihre Namen:

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Questtypen

Metamob verfolgt zwei Quests: die des Ocker-Dofus, Slug `ocre`, und die Dokille, Slug `dokille`:

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // ihr Bild auf metamob.fr
```

## Quest-Vorlagen

Eine Quest ist nicht in jeder Spielversion gleich: Die des Ocker-Dofus verlangt auf Dofus (Unity) und auf Dofus Touch nicht dieselben Monster. Eine Quest-Vorlage ist ein Questtyp in einer Spielversion.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

Eine Vorlage wird über ihre ID angegeben oder über das, was sie ist:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

Die API hat keinen Endpunkt für eine Vorlage ohne ihre Monster: `get()` findet sie in der Liste.

## Die Monster einer Vorlage

`questTemplates.monsters()` ist eine [Liste](/basics/lists/) dessen, was die Quest verlangt, jedes Monster mit seiner Stufe, höchstens 200 pro Seite:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// Eine Stufe.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();

// Die ganze Quest, in Reihenfolge.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Jede Seite enthält auch die Vorlage, zu der die Monster gehören, in `page.template`.

Die Quests der Spieler verweisen auf ihre Vorlage: `quest.quest_template` enthält ihre ID, ihren Questtyp und ihre Anzahl an Monstern und Stufen.

## Grenzen und Fehler

- `NOT_FOUND` für eine ID, die nicht existiert.
- `UNKNOWN_NAME`, mit Vorschlägen, für einen Namen, den weder das Paket noch die API kennt.
- Keine Vorlage für einen Questtyp in einer Spielversion: ebenfalls `UNKNOWN_NAME`. Die Dokille gibt es nicht in jeder Version.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`GameVersions`](/reference/game-versions/) | Die Spielversionen. |
| [`MonsterTypes`](/reference/monster-types/) | Die Monsterarten. |
| [`QuestTemplates`](/reference/quest-templates/) | Die Quest-Vorlagen: was jede Questart in jeder Spielversion verlangt. |
| [`QuestTypes`](/reference/quest-types/) | Die Questarten. |
| [`Servers`](/reference/servers/) | Die Spielserver. |
| [`GameVersion`](/reference/game-version/) | Eine Spielversion: Dofus (Unity), Dofus Retro (1.29) oder Dofus Touch. |
| [`LocalizedName`](/reference/localized-name/) | Ein Name in den Sprachen der Website. |
| [`QuestTemplate`](/reference/quest-template/) | Eine Quest-Vorlage: die Monster, die für eine Questart in einer Spielversion zu fangen sind. |
| [`QuestTemplateRef`](/reference/quest-template-ref/) | Die Vorlage, der eine Quest folgt, wie sie innerhalb einer Quest erscheint. |
| [`QuestType`](/reference/quest-type/) | Eine Questart, wie `questTypes` sie zurückgibt, mit ihrem Bild. |
| [`QuestTypeRef`](/reference/quest-type-ref/) | Eine Questart, wie sie innerhalb einer Quest erscheint: Ocker (`ocre`) oder Schockerqual (`dokille`). |
| [`Server`](/reference/server/) | Ein Spielserver. |
| [`TemplateHeader`](/reference/template-header/) | Die Vorlage, zu der eine Seite von Monstern gehört. |
| [`TemplateMonstersParams`](/reference/template-monsters-params/) | Filter von [`QuestTemplates.monsters`](/reference/quest-templates/). |
| [`Language`](/reference/language/) | Eine Sprache, in die die Website übersetzt ist. |
<!-- exports:end -->
