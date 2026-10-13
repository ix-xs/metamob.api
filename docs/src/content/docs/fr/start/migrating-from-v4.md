---
title: Depuis la version 4
description: "La version 5 est une réécriture. Les points d'accès sont les mêmes, la façon de les appeler est plus courte. Cette page fait correspondre chaque méthode de la version 4 à sa remplaçante."
---

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

## Ce qui a changé

| | Version 4 | Version 5 |
| --- | --- | --- |
| Import | une classe par défaut, CommonJS uniquement | une classe nommée `Metamob`, modules ES et CommonJS |
| Options | `api_key` | `apiKey` |
| Résultat | `{ ok, status, statusText, data, pagination, error }` | les données elles-mêmes |
| Échec | `ok: false` | une [`MetamobApiError`](/basics/errors/) levée |
| Listes | une page par appel | une requête à [attendre ou à parcourir](/basics/lists/) |
| Un ou plusieurs | `getX({ idOrName })` ou `getX()` | `x.get(ref)` et `x.list()` |
| La clé d'un autre joueur | `{ api_key }` dans les options | `{ apiKey }` en dernier argument, ou [`withKey()`](/basics/many-keys/) |
| Données embarquées | `client.cache` | [`data`](/basics/embedded-data/), avec recherche |
| Limite de requêtes | à gérer vous-même | [gérée](/basics/rate-limit/) |
| Dépendances | `@ix-xs/node-comfort` | aucune |
| Node.js | 18 | 20 ou plus récent |

## Résultats et erreurs

La version 4 ne levait jamais d'erreur : vous testiez `ok`. La version 5 renvoie les données et lève une erreur quand l'API refuse.

```ts
try {
  const profile = await metamob.users.get(username);
  console.log(profile.quests.length);
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) console.log("No such user.");
  else throw error;
}
```

`error.status` est le statut HTTP, comme avant. `error.code` est plus simple à tester : voir [Erreurs](/basics/errors/).

## Listes

Un appel paginé renvoyait `{ data, pagination }`, et vous faisiez une boucle sur `offset`. Il renvoie maintenant une requête. Attendue avec `await`, elle donne une page avec `items`, `total`, `limit` et `offset`. Parcourue, elle donne chaque élément.

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

## Toutes les méthodes

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

Les paramètres qui désignent quelque chose ont perdu leur suffixe `IdOrName` : `serverIdOrName` devient `server`, `typeIdOrName` et `monsterTypeIdOrName` deviennent `type`. Les options de la bibliothèque sont en camelCase. Ce que l'API renvoie garde les noms que l'API lui donne, en snake_case.

## La clé d'un autre joueur

```ts
// Version 4
// await client.updateQuestMonster(slug, "Tofu", 2, { api_key: theirKey });

// Version 5 : un seul appel
await metamob.quests.setMonster(slug, "Tofu", 2, { apiKey: theirKey });

// Version 5 : un client pour ce joueur
const theirs = metamob.withKey(theirKey);
await theirs.quests.setMonster(slug, "Tofu", 2);
```

## Les données embarquées

`client.cache.monsters` et ses voisins sont maintenant `data.monsters`, `data.zones`, `data.subzones`, `data.servers`, `data.questTemplates`, `data.gameVersions`, `data.monsterTypes` et `data.questTypes`, avec des méthodes pour y chercher. Voir [Les données du paquet](/basics/embedded-data/).

```ts
import { data } from "@ix-xs/metamob.api";

data.monsters.length;
data.monster("Tofu Maléfique")?.id;
```

La version 4 livrait 50 des 192 sous-zones. La version 5 les livre toutes, donc `zones.subzone("...")` et `zones.monsters("...")` reconnaissent maintenant chaque sous-zone par son nom.

## Ce qui est plus strict

- Un nom que la bibliothèque ne trouve pas lève `UNKNOWN_NAME` avec des suggestions. La version 4 renvoyait `{ ok: false }`.
- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT` avant qu'une requête soit dépensée. L'API la refuse de toute façon.
- Dix archimonstres portent le même nom dans deux versions du jeu. La version 4 prenait le premier. La version 5 choisit celui de la quête dans laquelle vous écrivez, voir [Noms et identifiants](/basics/names-and-ids/#monsters-that-share-a-name).

## Voir aussi

- [Démarrage rapide](/start/quick-start/)
- [Toutes les méthodes](/reference/methods/)
- [Configuration](/basics/configuration/)
- [Le journal des modifications](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
