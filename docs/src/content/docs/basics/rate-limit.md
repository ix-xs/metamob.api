---
title: La limite de requêtes
description: "Metamob accepte 60 requêtes par minute et par clé. Comment le client les compte, et comment suivre et régler la limite."
sidebar:
  order: 4
---

## Ce que l'API autorise

60 requêtes par minute, comptées par clé API. Au-delà, l'API répond 429 avec un en-tête `Retry-After`.

La limite garde le site disponible pour tout le monde : restez en dessous, et ne cherchez pas à la contourner.

## Ce que fait le client

Le client compte les requêtes envoyées avec chaque clé pendant la dernière minute. Quand 60 sont parties, l'appel suivant attend que la plus ancienne ait une minute, puis part. Les appels gardent leur ordre.

Une boucle de 300 requêtes prend donc environ cinq minutes, sans erreur.

Si un 429 arrive quand même, par exemple parce qu'un autre programme utilise la même clé, le client attend le temps que l'API demande, puis réessaie. Voir [ce qui est retenté](/basics/errors/#what-is-retried).

## La surveiller

`metamob.rateLimit` indique où en est la clé du client, d'après le compte de ce client : il ne sait rien des requêtes faites ailleurs avec la même clé.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

L'événement `rateLimit` est émis chaque fois qu'un appel a dû attendre, avec la durée de l'attente :

```ts
metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Dépenser moins de requêtes

La limite compte les requêtes, pas les éléments. Le client en envoie déjà le moins possible :

- Parcourir une liste utilise la plus grande page que l'API accepte, voir [Listes](/basics/lists/).
- `count()` et `first()` demandent un élément au lieu d'une page.
- Les données de référence sont [mises en cache](/basics/caching/), et deux appels identiques en cours partagent une seule requête.
- Les noms sont résolus à partir des [données du paquet](/basics/embedded-data/), sans requête.
- `quests.setMonsters()` écrit jusqu'à 200 monstres en une requête.

De votre côté :

```ts
import { data } from "@ix-xs/metamob.api";

// Lire des données de référence : interrogez le paquet, pas l'API.
const monster = data.monster("Tofu Maléfique"); // aucune requête
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 requête, avec les zones

// Beaucoup de quantités : un lot, pas une boucle.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## La régler

```ts
// En dessous de la limite, pour laisser de la place à un autre programme.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Désactivé : une rafale reçoit des 429, retentés après l'attente demandée.
const unlimited = new Metamob({ rateLimit: false });
```

Monter `requests` au-dessus de 60 n'augmente pas ce que l'API autorise : cela ne fait que déplacer l'attente du client vers des réponses 429.

## Plusieurs clés

Chaque clé a sa propre fenêtre. Un client créé avec [`withKey()`](/basics/many-keys/) partage le limiteur du client dont il vient, qui compte chaque clé à part.

## Annuler une attente

Un appel qui attend son tour peut être annulé avec un `signal`. Il lève une erreur avec le code `ABORTED` et libère sa place.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`RateLimitOptions`](/reference/rate-limit-options/) | Réglages du limiteur de requêtes intégré. |
| [`RateLimitState`](/reference/rate-limit-state/) | Où en est une clé API par rapport à sa limite de requêtes, d'après le compte de ce client. |
<!-- exports:end -->
