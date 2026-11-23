---
title: Von Version 4 umsteigen
description: "Was sich von Version 4 zu Version 5 ändert, und die Methode, die jede alte Methode ersetzt."
---

Version 5 ist eine Neufassung. Sie ruft dieselben Endpunkte auf, aber die Methoden haben Namen und Form geändert:

```ts
// Version 4
// const MetamobAPI = require("@ix-xs/metamob.api");
// const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });
// const res = await client.getMonsters({ idOrName: "Tofu Maléfique" });
// if (res.ok) console.log(res.data.name.fr);

// Version 5
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });
const monster = await metamob.monsters.get("Tofu Maléfique");
console.log(monster.name.fr);
```

## Was sich geändert hat

| | Version 4 | Version 5 |
| --- | --- | --- |
| Import | eine Standardklasse, nur CommonJS | eine benannte Klasse `Metamob`, ES-Module und CommonJS |
| Optionen | `api_key` | `apiKey` |
| Ergebnis | `{ ok, status, statusText, data, pagination, error }` | die Daten selbst |
| Fehlschlag | `ok: false` | ein geworfener [`MetamobApiError`](/basics/errors/) |
| Listen | eine Seite pro Aufruf | eine Anfrage zum [Abwarten oder Durchlaufen](/basics/lists/) |
| Eins oder viele | `getX({ idOrName })` oder `getX()` | `x.get(ref)` und `x.list()` |
| Schlüssel eines anderen Spielers | `{ api_key }` in den Optionen | `{ apiKey }` als letztes Argument, oder [`withKey()`](/basics/many-keys/) |
| Eingebettete Daten | `client.cache` | [`data`](/basics/embedded-data/), durchsuchbar |
| Anfragelimit | nicht gezählt | [vom Client gezählt](/basics/rate-limit/) |
| Abhängigkeiten | `@ix-xs/node-comfort` | keine |
| Node.js | 18 | 20 oder neuer |

## Ergebnisse und Fehler

Version 4 hat nie einen Fehler geworfen: Sie haben `ok` geprüft. Version 5 gibt die Daten zurück und wirft einen Fehler, wenn die API ablehnt.

```ts
try {
  const profile = await metamob.users.get(username);
  console.log(profile.quests.length);
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) console.log("No such user.");
  else throw error;
}
```

`error.status` ist wie zuvor der HTTP-Status. `error.code` ist einfacher zu prüfen: siehe [Fehler](/basics/errors/).

## Listen

Ein paginierter Aufruf gab früher `{ data, pagination }` zurück, und Sie haben über `offset` geschleift. Jetzt gibt er eine Anfrage zurück. Mit `await` abgewartet, liefert sie eine Seite mit `items`, `total`, `limit` und `offset`. Durchlaufen, liefert sie jedes Element.

```ts
// Version 4
// let offset = 0;
// while (true) {
//   const { data, pagination } = await client.getMonsters({ limit: 200, offset });
//   ...
//   offset += data.length;
//   if (offset >= pagination.total) break;
// }

// Version 5
for await (const monster of metamob.monsters.list()) {
  console.log(monster.name.fr);
}
```

## Alle Methoden

| Version 4 | Version 5 |
| --- | --- |
| `getMe()` | `metamob.me()` |
| `getGameVersions()`, `getGameVersions({ idOrName })` | `gameVersions.list()`, `gameVersions.get(ref)` |
| `getServers()`, `getServers({ idOrName })` | `servers.list()`, `servers.get(ref)` |
| `getMonsterTypes()`, `getMonsterTypes({ idOrName })` | `monsterTypes.list()`, `monsterTypes.get(ref)` |
| `getQuestTypes()`, `getQuestTypes({ idOrName })` | `questTypes.list()`, `questTypes.get(ref)` |
| `getQuestTemplates()` | `questTemplates.list()` |
| `getQuestTemplates({ id, step })` | `questTemplates.monsters(template, { step })` |
| `getMonsters({ query, typeIdOrName })` | `monsters.list({ query, type })` |
| `getMonsters({ idOrName })` | `monsters.get(ref)` |
| `getZones({ query })`, `getZones({ idOrName })` | `zones.list({ query })`, `zones.get(ref)` |
| `getSubZones({ zoneIdOrName, query })` | `zones.subzones(zone, { query })` |
| `getSubZones({ idOrName })` | `zones.subzone(ref)` |
| `getSubZoneMonsters(ref)` | `zones.monsters(ref)` |
| `getKraloves({ serverIdOrName, from })` | `kralove.list({ server, from })` |
| `getKraloves({ id })` | `kralove.get(id)` |
| `searchUsers(query, { serverIdOrName, active_within_days })` | `users.search(query, { server, activeWithinDays })` |
| `getUser(username)` | `users.get(username)` |
| `getUserQuests(username)` | `users.quests(username)` |
| `getUserQuests(username, { slug, monsterTypeIdOrName, status, step })` | `users.quest(username, slug, { type, status, step })` |
| `getConversations({ status })` | `conversations.list({ status })` |
| `getMessages(username, { before_id })` | `conversations.messages(username, { beforeId })` |
| `getMyQuests()` | `quests.list()` |
| `getQuest(slug)` | `quests.get(slug)` |
| `updateQuest(slug, changes)` | `quests.update(slug, changes)` |
| `getQuestMonsters(slug, { monsterTypeIdOrName, status, trade, step })` | `quests.monsters(slug, { type, status, trade, step })` |
| `updateQuestMonster(slug, ref, quantity)` | `quests.setMonster(slug, ref, quantity)` |
| `updateQuestMonsters(slug, list)` | `quests.setMonsters(slug, quantities)` |
| `setQuestMonsterTrade(slug, ref, trade)` | `quests.setTrade(slug, ref, trade)`, `quests.resetTrade(slug, ref)` |
| `getQuestMatches(slug, { min_parallel_quests, only_possible_trades })` | `quests.matches(slug, { minParallelQuests, onlyPossibleTrades })` |
| `getQuestZones(slug, { zoneIdOrName, subzoneIdOrName, monsterTypeIdOrName })` | `quests.zones(slug, { zone, subzone, type })` |

Die Parameter, die etwas bezeichnen, haben ihr Suffix `IdOrName` verloren: `serverIdOrName` heißt `server`, `typeIdOrName` und `monsterTypeIdOrName` heißen `type`. Die Optionen der Bibliothek sind in camelCase. Was die API zurückgibt, behält die Namen, die die API ihm gibt, in snake_case.

## Der Schlüssel eines anderen Spielers

```ts
// Version 4
// await client.updateQuestMonster(slug, "Tofu", 2, { api_key: theirKey });

// Version 5: ein einzelner Aufruf
await metamob.quests.setMonster(slug, "Tofu", 2, { apiKey: theirKey });

// Version 5: ein Client für diesen Spieler
const theirs = metamob.withKey(theirKey);
await theirs.quests.setMonster(slug, "Tofu", 2);
```

## Die eingebetteten Daten

`client.cache.monsters` und seine Geschwister heißen jetzt `data.monsters`, `data.zones`, `data.subzones`, `data.servers`, `data.questTemplates`, `data.gameVersions`, `data.monsterTypes` und `data.questTypes`, mit Methoden, um sie zu durchsuchen. Siehe [Die Daten im Paket](/basics/embedded-data/).

```ts
import { data } from "@ix-xs/metamob.api";

data.monsters.length;
data.monster("Tofu Maléfique")?.id;
```

Version 4 lieferte nur einen Teil der Unterzonen mit. Version 5 liefert alle mit, sodass `zones.subzone("...")` und `zones.monsters("...")` jetzt jede Unterzone über ihren Namen erkennen.

## Was strenger ist

- Ein Name, den die Bibliothek nicht findet, wirft `UNKNOWN_NAME` mit Vorschlägen. Version 4 gab `{ ok: false }` zurück.
- Eine Suche mit weniger als 3 Zeichen wirft `INVALID_ARGUMENT`, bevor eine Anfrage verbraucht wird. Die API lehnt sie ohnehin ab.
- Jede Spielversion hat ihre eigenen Monster, und die meisten teilen ihren Namen von einer Version zur nächsten. Version 4 nahm das erste. Version 5 wählt das der Quest, in die Sie schreiben, siehe [Namen und IDs](/basics/names-and-ids/#monsters-that-share-a-name).


Das [Changelog](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md) listet jede Änderung auf, Version für Version.
