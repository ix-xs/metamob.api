---
title: Cache
description: "O que fica em cache, por quanto tempo, e como ajustar."
sidebar:
  order: 5
---

## O que fica em cache por padrão

Somente os dados de referência: versões do jogo, servidores, tipos de monstro, tipos de missão, modelos de missão, monstros, zonas e subzonas. Eles só mudam com o jogo. Uma resposta fica 10 minutos em memória, e é compartilhada por todas as chaves, já que é a mesma para todos.

O resto (perfis, missões, correspondências, conversas, propostas de troca, eventos do Kralamor) é lido da API a cada chamada.

Duas leituras idênticas enviadas no mesmo momento sempre compartilham uma única requisição, com ou sem cache.

## Guardar mais em cache

`ttl` muda a validade dos dados de referência, e `methods` dá uma validade a qualquer método, pelo nome dele como aparece em [Todos os métodos](/resources/methods/):

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h",
    methods: {
      "users.get": "1m",
      "quests.matches": "5m",
      "monsters.get": "1d",
      "zones.list": false, // nunca em cache
    },
  },
});
```

O que depende da conta fica separado para cada chave: um jogador nunca vê as respostas de outro. As entradas de uma chave são descartadas assim que essa chave escreve algo, para que uma leitura depois de uma escrita esteja atualizada.

## Para uma chamada

```ts
// Ignorar o cache nesta chamada.
const fresh = await metamob.servers.list({ cache: false });

// Guardar esta resposta por cinco minutos, seja qual for a configuração do cliente.
const profile = await metamob.users.get(username, { cache: "5m" });
```

## Esvaziar

```ts
await metamob.clearCache();
```

## Desativar

```ts
const metamob = new Metamob({ cache: false });
```

## Um cache que sobrevive ao processo

Por padrão, o cache vive em memória e guarda 500 entradas. Para compartilhá-lo entre vários processos, dê a ele um armazenamento: um objeto com `get` e `set`, que podem ser assíncronos, e opcionalmente `delete` e `clear`. Por exemplo, com Redis:

```ts
import type { CacheEntry, CacheStore } from "@ix-xs/metamob.api";

const store: CacheStore = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : undefined;
  },
  async set(key, entry) {
    const seconds = Math.ceil((entry.expires - Date.now()) / 1000);
    if (seconds > 0) await redis.set(key, JSON.stringify(entry), "EX", seconds);
  },
  async delete(key) {
    await redis.del(key);
  },
};

const metamob = new Metamob({ cache: { store } });
```

As chaves do armazenamento nunca contêm uma chave de API, apenas um hash dela. Se o armazenamento falhar, a chamada continua sem o cache e a falha é emitida como um evento `error`.

## Cache ou dados incluídos

Os dados de referência também estão incluídos no pacote: [`data`](/basics/embedded-data/) os lê sem requisição. Passe pela API quando quiser os dados de hoje, por exemplo logo depois de uma atualização do jogo.

## Durações

Onde uma duração é esperada, escreva um número de milissegundos ou uma string com uma unidade: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`MemoryCache`](/reference/memory-cache/) | Armazenamento em memória que descarta a entrada usada há mais tempo quando fica cheio. |
| [`CacheEntry`](/reference/cache-entry/) | O que o cliente guarda para uma resposta em cache. |
| [`CacheOptions`](/reference/cache-options/) | Configurações do cache do cliente. |
| [`CacheStore`](/reference/cache-store/) | Onde ficam as respostas em cache. |
| [`Duration`](/reference/duration/) | Uma duração: milissegundos como número, ou uma string curta como `"30s"`, `"5m"`, `"2h"` ou `"1d"`. |
<!-- exports:end -->
