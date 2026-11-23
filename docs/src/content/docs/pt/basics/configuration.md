---
title: Configuração
description: "As opções do cliente e de uma chamada, com seus valores padrão."
sidebar:
  order: 8
---

Todas as opções são opcionais. Os valores padrão servem tanto para um script quanto para um bot:

```ts
const metamob = new Metamob({
  apiKey: process.env.METAMOB_API_KEY,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h" },
  rateLimit: { requests: 50 },
});
```

## O cliente

A chave sozinha também pode ser passada como string:

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Crie um cliente e mantenha-o: ele guarda a contagem de requisições e o cache. Dois clientes para a mesma chave contam separadamente, e juntos podem ultrapassar o limite.

## Uma chamada

Cada método recebe primeiro seus próprios argumentos, depois um objeto de opções só para essa chamada:

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Quando um método tem filtros, eles vêm antes das opções: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Ouvir o cliente

O cliente emite um evento a cada etapa de uma chamada. `on` retorna uma função que para de ouvir:

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Evento | Quando | Conteúdo |
| --- | --- | --- |
| `request` | Uma requisição sai | `method`, `verb`, `url`, `attempt` |
| `response` | Uma resposta chegou, ou veio do cache | `method`, `status`, `duration`, `cached` |
| `retry` | Uma requisição será tentada de novo | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | Uma chamada esperou a vez dela | `method`, `delay` |
| `error` | Um listener ou um armazenamento de cache lançou um erro | o erro |

Uma URL em um evento nunca contém a chave.

## Durações

Onde uma duração é esperada, escreva um número de milissegundos ou uma string com uma unidade: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Outro fetch, outro host

`fetch` substitui o fetch global: para passar por um proxy, para observar as requisições nos testes, ou em um ambiente que não tem um.

```ts
const calls: string[] = [];

const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  fetch: async (input, init) => {
    calls.push(String(input));
    return fetch(input, init);
  },
});
```

`baseUrl` aponta o cliente para outro host. A chave é enviada a esse host: use apenas um em que você confia.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Metamob`](/reference/metamob/) | O cliente da API do Metamob. |
| [`VERSION`](/reference/version/) | Versão do pacote. |
| [`ClientEvents`](/reference/client-events/) | Eventos emitidos pelo cliente, veja `metamob.on()`. |
| [`MetamobOptions`](/reference/metamob-options/) | Opções do cliente [`Metamob`](/reference/metamob/). |
| [`RequestOptions`](/reference/request-options/) | Opções aceitas como último argumento de cada chamada à API. |
| [`RetryOptions`](/reference/retry-options/) | Política de novas tentativas. |
<!-- exports:end -->
