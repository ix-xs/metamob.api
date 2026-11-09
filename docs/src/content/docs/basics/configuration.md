---
title: Configuration
description: "Les options du client et d'un appel, avec leurs valeurs par défaut."
sidebar:
  order: 8
---

Toutes les options sont facultatives. Les valeurs par défaut conviennent à un script comme à un bot :

```ts
const metamob = new Metamob({
  apiKey: process.env.METAMOB_API_KEY,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h" },
  rateLimit: { requests: 50 },
});
```

## Le client

La clé seule peut aussi être passée sous forme de chaîne :

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Créez un seul client et gardez-le : c'est lui qui tient le compte des requêtes et le cache. Deux clients pour la même clé comptent séparément, et peuvent dépasser la limite à eux deux.

## Un seul appel

Chaque méthode prend d'abord ses propres arguments, puis un objet d'options pour cet appel seulement :

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Quand une méthode a des filtres, ils viennent avant les options : `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Écouter le client

Le client émet un événement à chaque étape d'un appel. `on` renvoie une fonction qui arrête l'écoute :

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Événement | Quand | Contenu |
| --- | --- | --- |
| `request` | Une requête part | `method`, `verb`, `url`, `attempt` |
| `response` | Une réponse est arrivée, ou vient du cache | `method`, `status`, `duration`, `cached` |
| `retry` | Une requête va être retentée | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | Un appel a attendu son tour | `method`, `delay` |
| `error` | Un écouteur ou un stockage de cache a levé une erreur | l'erreur |

Une URL dans un événement ne contient jamais la clé.

## Durées

Partout où une durée est attendue, écrivez un nombre de millisecondes ou une chaîne avec une unité : `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Un autre fetch, un autre hôte

`fetch` remplace le fetch global : pour passer par un proxy, pour observer les requêtes dans des tests, ou sur un environnement qui n'en a pas.

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

`baseUrl` dirige le client vers un autre hôte. La clé est envoyée à cet hôte : n'en utilisez qu'un en qui vous avez confiance.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Metamob`](/reference/metamob/) | Le client de l'API Metamob. |
| [`VERSION`](/reference/version/) | Version du paquet. |
| [`ClientEvents`](/reference/client-events/) | Événements émis par le client, voir `metamob.on()`. |
| [`MetamobOptions`](/reference/metamob-options/) | Options du client [`Metamob`](/reference/metamob/). |
| [`RequestOptions`](/reference/request-options/) | Options acceptées comme dernier argument de chaque appel à l'API. |
| [`RetryOptions`](/reference/retry-options/) | Règles des nouvelles tentatives. |
<!-- exports:end -->
