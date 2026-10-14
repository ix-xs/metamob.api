---
title: Cache
description: "Les monstres, les zones et les serveurs ne changent que lorsque le jeu change, donc leurs réponses sont gardées dix minutes. Tout ce qui est lié à un compte est récupéré à chaque fois, sauf indication contraire de votre part. Cette page montre comment régler les deux."
sidebar:
  order: 5
---

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h", // données de référence
    methods: { "users.get": "30s", "kralove.list": "1m" }, // et ce que vous choisissez
  },
});
```

## Ce qui est mis en cache par défaut

Les données de référence : versions du jeu, serveurs, types de monstres, types de quêtes, modèles de quête, monstres, zones et sous-zones. Une réponse est gardée 10 minutes, en mémoire, et partagée par toutes les clés : elle est la même pour tout le monde.

Rien d'autre. Les profils, les quêtes, les correspondances, les conversations et les événements Kralamoure sont lus depuis l'API à chaque appel, parce qu'ils changent dès que quelqu'un joue.

Deux lectures identiques envoyées au même moment partagent toujours une seule requête, avec ou sans cache.

## Mettre davantage en cache

`methods` donne une durée de fraîcheur à n'importe quelle méthode, par son nom tel qu'il figure dans [Toutes les méthodes](/reference/methods/).

```ts
const metamob = new Metamob({
  cache: {
    methods: {
      "users.get": "1m", // une page de profil très consultée
      "quests.matches": "5m", // les correspondances ne bougent pas à la seconde
      "monsters.get": "1d", // encore plus longtemps pour les données de référence
      "zones.list": false, // ne jamais mettre celle-ci en cache
    },
  },
});
```

Ce qui dépend du compte est gardé à part pour chaque clé : deux joueurs ne voient jamais les réponses l'un de l'autre. Les entrées d'une clé sont supprimées dès que cette clé modifie une quête, donc une lecture après une écriture est toujours fraîche.

## Pour un seul appel

```ts
// Ignorer le cache pour cet appel.
const fresh = await metamob.servers.list({ cache: false });

// Garder cette réponse cinq minutes, quoi que dise le client.
const profile = await metamob.users.get(username, { cache: "5m" });
```

## Le vider

```ts
await metamob.clearCache();
```

## Le désactiver

```ts
const metamob = new Metamob({ cache: false });
```

## Un cache qui survit au processus

Le stockage par défaut vit en mémoire et contient 500 entrées, les moins récemment utilisées partant en premier. Un stockage, c'est un `get` et un `set`, qui peuvent être asynchrones, plus un `delete` et un `clear` facultatifs : branchez Redis, un fichier, ou le KV d'une plateforme edge.

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

Une clé du stockage ne contient jamais de clé API : les entrées liées à un compte sont rangées sous une empreinte de celle-ci. Un stockage qui échoue ne fait pas échouer l'appel : la requête est envoyée comme s'il n'y avait pas de cache, et l'échec est émis sous la forme d'un événement `error`.

## Cache ou données embarquées

Pour les données de référence, il existe plus rapide qu'un cache : [les données du paquet](/basics/embedded-data/), qui ne demandent aucune requête. Utilisez l'API quand vous avez besoin de ce que le paquet ne contient pas, par exemple les zones d'un monstre telles que l'API les liste aujourd'hui, ou quand le jeu vient de changer.

## Durées

Partout où une durée est attendue, écrivez un nombre de millisecondes ou une chaîne avec une unité : `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Référence

| Option | Par défaut | Signification |
| --- | --- | --- |
| `cache` | actif | `false` le désactive |
| `cache.ttl` | `"10m"` | Durée de fraîcheur des données de référence |
| `cache.methods` | aucune | Durée de fraîcheur par méthode, ou `false` |
| `cache.max` | `500` | Entrées que contient le stockage en mémoire |
| `cache.store` | mémoire | Votre propre `CacheStore` |
| `{ cache }` sur un appel | | Une durée, ou `false` |

## Voir aussi

- [La limite de requêtes](/basics/rate-limit/)
- [Les données du paquet](/basics/embedded-data/)
- [Configuration](/basics/configuration/)
- [Toutes les méthodes](/reference/methods/)
