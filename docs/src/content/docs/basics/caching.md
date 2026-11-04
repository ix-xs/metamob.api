---
title: Cache
description: "Ce qui est gardé en cache, combien de temps, et comment le régler."
sidebar:
  order: 5
---

## Ce qui est mis en cache par défaut

Seulement les données de référence : versions du jeu, serveurs, types de monstres, types de quêtes, modèles de quête, monstres, zones et sous-zones. Elles ne changent qu'avec le jeu. Une réponse est gardée 10 minutes en mémoire, et partagée par toutes les clés puisqu'elle est la même pour tout le monde.

Le reste (profils, quêtes, partenaires, conversations, propositions, événements Kralamoure) est lu depuis l'API à chaque appel.

Deux lectures identiques envoyées au même moment partagent toujours une seule requête, avec ou sans cache.

## Mettre davantage en cache

`ttl` change la durée des données de référence, et `methods` donne une durée à n'importe quelle méthode, par son nom tel qu'il figure dans [Toutes les méthodes](/reference/methods/) :

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h",
    methods: {
      "users.get": "1m",
      "quests.matches": "5m",
      "monsters.get": "1d",
      "zones.list": false, // jamais en cache
    },
  },
});
```

Ce qui dépend du compte est gardé à part pour chaque clé : un joueur ne voit jamais les réponses d'un autre. Les entrées d'une clé sont oubliées dès que cette clé écrit quelque chose, pour qu'une lecture après une écriture soit à jour.

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

Par défaut, le cache vit en mémoire et garde 500 entrées. Pour le partager entre plusieurs processus, donnez-lui un stockage : un objet avec `get` et `set`, qui peuvent être asynchrones, et éventuellement `delete` et `clear`. Par exemple avec Redis :

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

Les clés du stockage ne contiennent jamais de clé API, seulement une empreinte. Si le stockage échoue, l'appel continue sans cache et l'échec est émis comme événement `error`.

## Cache ou données embarquées

Les données de référence sont aussi incluses dans le paquet : [`data`](/basics/embedded-data/) les lit sans requête. Passez par l'API quand vous voulez les données du jour, par exemple juste après une mise à jour du jeu.

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
