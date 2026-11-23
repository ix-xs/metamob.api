---
title: Namen und IDs
description: "Monster, Zonen, Server und der Rest lassen sich über ihre ID, ihren Namen oder ein Objekt angeben. Was akzeptiert wird, und was geschieht, wenn ein Name unbekannt ist."
sidebar:
  order: 1
---

Ein Monster lässt sich über seine ID oder seinen Namen angeben, in jeder der fünf Sprachen der Website:

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique"); // Akzente und Groß-/Kleinschreibung spielen keine Rolle
await metamob.monsters.get("Evil Tofu"); // Englisch
await metamob.monsters.get("Tofu maléfico"); // Spanisch
```

## Was sich über den Namen angeben lässt

| Was | Akzeptiert | Wo |
| --- | --- | --- |
| Ein Monster | ID, Name auf Französisch, Englisch, Spanisch, Portugiesisch oder Deutsch, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| Eine Zone | ID, Name in den fünf Sprachen, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| Eine Unterzone | ID, Name in den fünf Sprachen, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| Ein Server | ID, Name, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| Ein Monstertyp | 1, 2, 3, oder `monstre`, `boss`, `archimonstre` und ihre Übersetzungen | jeder Filter `type` |
| Eine Spielversion | ID, Name, `{ id }` | `gameVersions.get`, der Hinweis `gameVersion` |
| Ein Questtyp | ID, Slug (`ocre`, `dokille`), Name | `questTypes.get` |
| Eine Quest-Vorlage | ID, `{ id }`, oder `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

Eine Quest wird immer über ihren Slug angegeben und ein Spieler über seinen Benutzernamen: Das sind Strings, die die API so nimmt, wie sie sind.

Ihr Editor vervollständigt die Namen. Es sind Literaltypen, aus den Daten im Paket erzeugt, und jeder andere String wird trotzdem akzeptiert.

## Ein Objekt übergeben

Ein Objekt mit einer numerischen `id` funktioniert auch: Das Ergebnis eines Aufrufs lässt sich unverändert an den nächsten übergeben.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## Wie ein Name verglichen wird

Ein Name wird verglichen, nachdem Akzente entfernt wurden, ohne Groß-/Kleinschreibung, wobei jede Art von Apostroph und von Bindestrich als gleich gilt und mehrfache Leerzeichen zusammengefasst werden. `"TOFU  MALEFIQUE"` und `"Tofu Maléfique"` sind derselbe Name. Sonst wird nichts verziehen: Ein fehlender Buchstabe ergibt einen anderen Namen.

Die Suche erfolgt in den Daten im Paket, ohne Anfrage. Ein String nur aus Ziffern, wie `"21"`, wird als ID gelesen.

## Wenn ein Name unbekannt ist

Ein Name, der nicht im Paket steht, kann neuer sein als das Paket. Die Bibliothek fragt dann einmal die API, mit einer Suche. Wenn auch die API ihn nicht kennt, wirft der Aufruf einen `MetamobArgumentError` mit dem Code `UNKNOWN_NAME` und den nächstliegenden Namen.

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

In diesem Fall wird nichts an die API gesendet.

Um selbst Vorschläge anzubieten, vor jedem Aufruf:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // die Monster, deren Name "tofu" enthält
```

## Monster mit demselben Namen

Jede Spielversion hat ihre eigenen Monster: Der Tofu von Dofus Retro ist nicht der von Dofus (Unity), er hat seine eigene ID. Die meisten Namen bezeichnen daher ein Monster pro Version. Dasselbe gilt für Zonen und Unterzonen: Es gibt drei Amakna.

Wenn Sie in eine Quest schreiben, entscheidet die Quest. Die Bibliothek liest einmal die Vorlage, der die Quest folgt, und nimmt das Monster dieser Vorlage.

```ts
// Der richtige "Crognan le Barbare" für diese Quest, egal welche Spielversion sie hat.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

Anderswo sagen Sie, welches Sie wollen:

```ts
const name = "Crognan le Barbare";

const unity = await metamob.monsters.get(name, { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get(name, { gameVersion: "Dofus Touch" });

// Oder über die Quest-Vorlage.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get(name, { template: ochreOnRetro });
```

Ohne Hinweis wird das von Dofus (Unity) zurückgegeben, und ebenso für eine Zone oder eine Unterzone. `data.monstersNamed(name)` listet jedes Monster auf, das auf einen Namen hört.

## Unterzonen und ihre Zone

Die API braucht die Zone einer Unterzone, um sie zu lesen. Wenn die Unterzone im Paket steht, findet die Bibliothek ihre Zone:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Eine Unterzone, die nach der Veröffentlichung des Pakets ins Spiel kam, steht noch nicht darin: Geben Sie ihre Zone an.

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`normalizeName`](/reference/normalize-name/) | Die Form, in der Namen verglichen werden: ohne Akzente, kleingeschrieben, eine einzige Art von Apostroph und Bindestrich, einfache Leerzeichen. |
| [`GameVersionLike`](/reference/game-version-like/) | Eine Spielversion: ihre ID, ihr Name oder ein Objekt mit ihrer `id`. |
| [`MonsterLike`](/reference/monster-like/) | Ein Monster: seine ID, sein Name auf Französisch, Englisch, Spanisch, Portugiesisch oder Deutsch, oder ein Objekt mit seiner `id`. |
| [`MonsterTypeLike`](/reference/monster-type-like/) | Eine Monsterart: ihre ID (1, 2, 3), ihr Name in einer beliebigen Sprache der Website oder ein Objekt mit ihrer `id`. |
| [`QuestTemplateLike`](/reference/quest-template-like/) | Eine Quest-Vorlage: ihre ID, ein Objekt mit ihrer `id`, oder die Questart und die Spielversion, für die sie gilt. |
| [`QuestTypeLike`](/reference/quest-type-like/) | Eine Questart: ihre ID, ihr Slug (`ocre`, `dokille`), ihr Name oder ein Objekt mit ihrer `id`. |
| [`ServerLike`](/reference/server-like/) | Ein Server: seine ID, sein Name oder ein Objekt mit seiner `id`. |
| [`SubzoneLike`](/reference/subzone-like/) | Eine Unterzone: ihre ID, ihr Name auf Französisch, Englisch, Spanisch, Portugiesisch oder Deutsch, oder ein Objekt mit ihrer `id`. |
| [`ZoneLike`](/reference/zone-like/) | Eine Zone: ihre ID, ihr Name auf Französisch, Englisch, Spanisch, Portugiesisch oder Deutsch, oder ein Objekt mit ihrer `id`. |
| [`GameVersionName`](/reference/game-version-name/), [`MonsterNameDe`](/reference/monster-name-de/), [`MonsterNameEn`](/reference/monster-name-en/), [`MonsterNameEs`](/reference/monster-name-es/), [`MonsterNameFr`](/reference/monster-name-fr/), [`MonsterNamePt`](/reference/monster-name-pt/), [`MonsterTypeNameDe`](/reference/monster-type-name-de/), [`MonsterTypeNameEn`](/reference/monster-type-name-en/), [`MonsterTypeNameEs`](/reference/monster-type-name-es/), [`MonsterTypeNameFr`](/reference/monster-type-name-fr/), [`MonsterTypeNamePt`](/reference/monster-type-name-pt/), [`QuestTemplateId`](/reference/quest-template-id/), [`QuestTypeNameDe`](/reference/quest-type-name-de/), [`QuestTypeNameEn`](/reference/quest-type-name-en/), [`QuestTypeNameEs`](/reference/quest-type-name-es/), [`QuestTypeNameFr`](/reference/quest-type-name-fr/), [`QuestTypeNamePt`](/reference/quest-type-name-pt/), [`QuestTypeSlug`](/reference/quest-type-slug/), [`ServerName`](/reference/server-name/), [`SubzoneNameDe`](/reference/subzone-name-de/), [`SubzoneNameEn`](/reference/subzone-name-en/), [`SubzoneNameEs`](/reference/subzone-name-es/), [`SubzoneNameFr`](/reference/subzone-name-fr/), [`SubzoneNamePt`](/reference/subzone-name-pt/), [`ZoneNameDe`](/reference/zone-name-de/), [`ZoneNameEn`](/reference/zone-name-en/), [`ZoneNameEs`](/reference/zone-name-es/), [`ZoneNameFr`](/reference/zone-name-fr/), [`ZoneNamePt`](/reference/zone-name-pt/) | Die Namen, die das Paket kennt, ein Typ pro Sprache: Monster, Zonen, Unterzonen, Monster- und Questtypen, Server, Spielversionen. |
<!-- exports:end -->
