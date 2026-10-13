---
title: Configuration
description: "Chaque option du client et d'un appel isolé, avec sa valeur par défaut. Rien n'est requis à part une clé API, et les valeurs par défaut conviennent à un script aussi bien qu'à un bot."
sidebar:
  order: 8
---

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

Toutes les options sont facultatives. La clé seule peut être passée sous forme de chaîne.

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Créez un seul client et gardez-le : le limiteur et le cache vivent dedans. Deux clients pour la même clé comptent leurs requêtes séparément et peuvent dépasser la limite à eux deux.

## Un seul appel

Chaque méthode prend d'abord ses propres arguments, puis un objet d'options pour cet appel seulement.

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Quand une méthode a des filtres, ils viennent avant les options : `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Écouter le client

Le client émet ce qu'il fait. `on` renvoie une fonction qui arrête l'écoute.

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

`fetch` remplace le fetch global : pour passer par un proxy, pour enregistrer les requêtes dans des tests, ou sur un environnement qui n'en a pas.

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

## Référence

Options du client :

| Option | Par défaut | Signification |
| --- | --- | --- |
| `apiKey` | `METAMOB_API_KEY` | La clé du client |
| `timeout` | `"30s"` | Temps accordé à une tentative |
| `retry` | 3 nouvelles tentatives | `{ attempts, delay, maxDelay }`, ou `false`. Voir [Erreurs](/basics/errors/#what-is-retried) |
| `cache` | actif, `"10m"` | `{ ttl, methods, max, store }`, ou `false`. Voir [Cache](/basics/caching/) |
| `rateLimit` | actif, 60 par minute | `{ requests, per }`, ou `false`. Voir [La limite de requêtes](/basics/rate-limit/) |
| `fetch` | le `fetch` global | Un `fetch` à utiliser à la place |
| `baseUrl` | `https://www.metamob.fr/api/v1` | Où se trouve l'API |
| `headers` | aucun | En-têtes ajoutés à chaque requête |

Options d'un appel :

| Option | Signification |
| --- | --- |
| `apiKey` | La clé pour cet appel. Voir [Agir pour d'autres joueurs](/basics/many-keys/) |
| `signal` | Un `AbortSignal` qui annule l'appel |
| `timeout` | Temps accordé à une tentative de cet appel |
| `retry` | Politique de nouvelles tentatives de cet appel, ou `false` |
| `cache` | Durée de fraîcheur de cette réponse, ou `false` pour ignorer le cache |
| `headers` | En-têtes ajoutés à cette requête |

Membres du client :

| Membre | Signification |
| --- | --- |
| `me()` | Le compte de la clé |
| `quests`, `monsters`, `zones`, `users`, `conversations`, `kralove` | Les ressources |
| `gameVersions`, `servers`, `monsterTypes`, `questTypes`, `questTemplates` | Les listes de référence |
| `data` | [Les données du paquet](/basics/embedded-data/) |
| `withKey(apiKey)` | Un client pour une autre clé |
| `rateLimit` | Où en est la clé par rapport à la limite |
| `on`, `once`, `off` | Événements |
| `clearCache()` | Vide le cache |

## Voir aussi

- [Erreurs](/basics/errors/)
- [Cache](/basics/caching/)
- [La limite de requêtes](/basics/rate-limit/)
- [Environnements d'exécution](/reference/runtimes/)
