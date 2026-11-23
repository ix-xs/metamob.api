---
title: Vindo da versão 4
description: "O que muda da versão 4 para a versão 5, e o método que substitui cada método antigo."
---

A versão 5 é uma reescrita. Ela chama os mesmos endpoints, mas os métodos mudaram de nome e de forma:

```ts
// Versão 4
// const MetamobAPI = require("@ix-xs/metamob.api");
// const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });
// const res = await client.getMonsters({ idOrName: "Tofu Maléfique" });
// if (res.ok) console.log(res.data.name.fr);

// Versão 5
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });
const monster = await metamob.monsters.get("Tofu Maléfique");
console.log(monster.name.fr);
```

## O que mudou

| | Versão 4 | Versão 5 |
| --- | --- | --- |
| Importação | uma classe padrão, só CommonJS | uma classe nomeada `Metamob`, ES modules e CommonJS |
| Opções | `api_key` | `apiKey` |
| Resultado | `{ ok, status, statusText, data, pagination, error }` | os próprios dados |
| Falha | `ok: false` | um [`MetamobApiError`](/basics/errors/) lançado |
| Listas | uma página por chamada | uma requisição para [esperar com await ou percorrer](/basics/lists/) |
| Um ou vários | `getX({ idOrName })` ou `getX()` | `x.get(ref)` e `x.list()` |
| Chave de outro jogador | `{ api_key }` nas opções | `{ apiKey }` como último argumento, ou [`withKey()`](/basics/many-keys/) |
| Dados incluídos | `client.cache` | [`data`](/basics/embedded-data/), pesquisável |
| Limite de requisições | não contado | [contado pelo cliente](/basics/rate-limit/) |
| Dependências | `@ix-xs/node-comfort` | nenhuma |
| Node.js | 18 | 20 ou mais recente |

## Resultados e erros

A versão 4 nunca lançava erro: você testava `ok`. A versão 5 retorna os dados e lança um erro quando a API recusa.

```ts
try {
  const profile = await metamob.users.get(username);
  console.log(profile.quests.length);
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) console.log("No such user.");
  else throw error;
}
```

`error.status` é o status HTTP, como antes. `error.code` é mais fácil de testar: veja [Erros](/basics/errors/).

## Listas

Uma chamada paginada retornava `{ data, pagination }`, e você fazia um laço sobre `offset`. Agora ela retorna uma requisição. Esperada com `await`, ela dá uma página com `items`, `total`, `limit` e `offset`. Percorrida, ela dá todos os itens.

```ts
// Versão 4
// let offset = 0;
// while (true) {
//   const { data, pagination } = await client.getMonsters({ limit: 200, offset });
//   ...
//   offset += data.length;
//   if (offset >= pagination.total) break;
// }

// Versão 5
for await (const monster of metamob.monsters.list()) {
  console.log(monster.name.fr);
}
```

## Todos os métodos

| Versão 4 | Versão 5 |
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

Os parâmetros que designam algo perderam o sufixo `IdOrName`: `serverIdOrName` virou `server`, `typeIdOrName` e `monsterTypeIdOrName` viraram `type`. As opções da biblioteca estão em camelCase. O que a API retorna mantém os nomes que a API dá, em snake_case.

## A chave de outro jogador

```ts
// Versão 4
// await client.updateQuestMonster(slug, "Tofu", 2, { api_key: theirKey });

// Versão 5: uma única chamada
await metamob.quests.setMonster(slug, "Tofu", 2, { apiKey: theirKey });

// Versão 5: um cliente para esse jogador
const theirs = metamob.withKey(theirKey);
await theirs.quests.setMonster(slug, "Tofu", 2);
```

## Os dados incluídos

`client.cache.monsters` e seus irmãos agora são `data.monsters`, `data.zones`, `data.subzones`, `data.servers`, `data.questTemplates`, `data.gameVersions`, `data.monsterTypes` e `data.questTypes`, com métodos para pesquisá-los. Veja [Os dados do pacote](/basics/embedded-data/).

```ts
import { data } from "@ix-xs/metamob.api";

data.monsters.length;
data.monster("Tofu Maléfique")?.id;
```

A versão 4 trazia só uma parte das subzonas. A versão 5 traz todas, então `zones.subzone("...")` e `zones.monsters("...")` agora reconhecem todas as subzonas pelo nome.

## O que ficou mais rígido

- Um nome que a biblioteca não encontra lança `UNKNOWN_NAME` com sugestões. A versão 4 retornava `{ ok: false }`.
- Uma busca com menos de 3 caracteres lança `INVALID_ARGUMENT` antes de gastar uma requisição. A API a recusaria de qualquer forma.
- Cada versão do jogo tem seus próprios monstros, e a maioria compartilha o nome de uma versão para outra. A versão 4 pegava o primeiro. A versão 5 escolhe o da missão em que você escreve, veja [Nomes e ids](/basics/names-and-ids/#monsters-that-share-a-name).


O [changelog](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md) lista todas as mudanças, versão por versão.
