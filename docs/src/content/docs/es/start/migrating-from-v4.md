---
title: Desde la versión 4
description: "La versión 5 es una reescritura. Los endpoints son los mismos, la forma de llamarlos es más corta. Esta página relaciona cada método de la versión 4 con su sustituto."
---

```ts
// Versión 4
// const MetamobAPI = require("@ix-xs/metamob.api");
// const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });
// const res = await client.getMonsters({ idOrName: "Tofu Maléfique" });
// if (res.ok) console.log(res.data.name.fr);

// Versión 5
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });
const monster = await metamob.monsters.get("Tofu Maléfique");
console.log(monster.name.fr);
```

## Lo que cambió

| | Versión 4 | Versión 5 |
| --- | --- | --- |
| Importación | una clase por defecto, solo CommonJS | una clase con nombre `Metamob`, módulos ES y CommonJS |
| Opciones | `api_key` | `apiKey` |
| Resultado | `{ ok, status, statusText, data, pagination, error }` | los datos directamente |
| Fallo | `ok: false` | un [`MetamobApiError`](/basics/errors/) lanzado |
| Listas | una página por llamada | una solicitud que puedes [esperar o recorrer](/basics/lists/) |
| Uno o varios | `getX({ idOrName })` o `getX()` | `x.get(ref)` y `x.list()` |
| La clave de otro jugador | `{ api_key }` en las opciones | `{ apiKey }` como último argumento, o [`withKey()`](/basics/many-keys/) |
| Datos del paquete | `client.cache` | [`data`](/basics/embedded-data/), con búsqueda |
| Límite de solicitudes | lo gestionabas tú | [gestionado](/basics/rate-limit/) |
| Dependencias | `@ix-xs/node-comfort` | ninguna |
| Node.js | 18 | 20 o posterior |

## Resultados y errores

La versión 4 nunca lanzaba errores: comprobabas `ok`. La versión 5 devuelve los datos y lanza un error cuando la API rechaza la llamada.

```ts
try {
  const profile = await metamob.users.get(username);
  console.log(profile.quests.length);
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) console.log("No such user.");
  else throw error;
}
```

`error.status` es el estado HTTP, como antes. `error.code` es más fácil de comprobar: consulta [Errores](/basics/errors/).

## Listas

Antes, una llamada paginada devolvía `{ data, pagination }`, y hacías un bucle sobre `offset`. Ahora devuelve una solicitud. Si la esperas con `await`, da una página con `items`, `total`, `limit` y `offset`. Si la recorres, da cada elemento.

```ts
// Versión 4
// let offset = 0;
// while (true) {
//   const { data, pagination } = await client.getMonsters({ limit: 200, offset });
//   ...
//   offset += data.length;
//   if (offset >= pagination.total) break;
// }

// Versión 5
for await (const monster of metamob.monsters.list()) {
  console.log(monster.name.fr);
}
```

## Todos los métodos

| Versión 4 | Versión 5 |
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

Los parámetros que designan algo perdieron su sufijo `IdOrName`: `serverIdOrName` es `server`, `typeIdOrName` y `monsterTypeIdOrName` son `type`. Las opciones de la biblioteca están en camelCase. Lo que devuelve la API conserva los nombres que le da la API, en snake_case.

## La clave de otro jugador

```ts
// Versión 4
// await client.updateQuestMonster(slug, "Tofu", 2, { api_key: theirKey });

// Versión 5: una llamada
await metamob.quests.setMonster(slug, "Tofu", 2, { apiKey: theirKey });

// Versión 5: un cliente para ese jugador
const theirs = metamob.withKey(theirKey);
await theirs.quests.setMonster(slug, "Tofu", 2);
```

## Los datos del paquete

`client.cache.monsters` y sus hermanos son ahora `data.monsters`, `data.zones`, `data.subzones`, `data.servers`, `data.questTemplates`, `data.gameVersions`, `data.monsterTypes` y `data.questTypes`, con métodos para buscar en ellos. Consulta [Los datos del paquete](/basics/embedded-data/).

```ts
import { data } from "@ix-xs/metamob.api";

data.monsters.length;
data.monster("Tofu Maléfique")?.id;
```

La versión 4 traía 50 de las 192 subzonas. La versión 5 las trae todas, así que `zones.subzone("...")` y `zones.monsters("...")` ahora reconocen cada subzona por su nombre.

## Lo que es más estricto

- Un nombre que la biblioteca no encuentra lanza `UNKNOWN_NAME` con sugerencias. La versión 4 devolvía `{ ok: false }`.
- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT` antes de gastar una solicitud. La API la rechaza de todos modos.
- Diez archimonstruos comparten nombre entre dos versiones del juego. La versión 4 tomaba el primero. La versión 5 elige el de la misión en la que escribes, ver [Nombres e identificadores](/basics/names-and-ids/#monsters-that-share-a-name).

## Ver también

- [Inicio rápido](/start/quick-start/)
- [Todos los métodos](/reference/methods/)
- [Configuración](/basics/configuration/)
- [El registro de cambios](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
