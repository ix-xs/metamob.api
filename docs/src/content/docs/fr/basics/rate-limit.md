---
title: La limite de requêtes
description: "Metamob autorise 60 requêtes par minute et par clé API. Le client les compte et fait attendre son tour à l'appel suivant, donc une longue boucle ralentit au lieu d'échouer. Cette page montre comment surveiller la limite, la régler et dépenser moins de requêtes."
sidebar:
  order: 4
---

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Ce que l'API autorise

60 requêtes par minute, comptées par clé API. Au-delà, l'API répond 429 avec un en-tête `Retry-After`.

Metamob est un service gratuit tenu par une seule personne. La limite est ce qui le garde disponible pour tout le monde : restez en dessous, et ne cherchez pas à la contourner.

## Ce que fait le client

Le limiteur est actif par défaut. Il garde, pour chaque clé, l'heure des requêtes envoyées pendant la dernière minute. Quand 60 ont été envoyées, l'appel suivant attend que la plus ancienne ait une minute, puis part. Les appels gardent leur ordre.

Rien n'échoue et rien n'est abandonné : une boucle de 300 requêtes prend environ quatre minutes au lieu de lever une erreur après la 60e.

Si un 429 arrive quand même, parce qu'un autre programme utilise la même clé par exemple, le client retient tous les appels de cette clé pendant le temps que l'API demande, puis réessaie. Voir [ce qui est retenté](/basics/errors/#what-is-retried).

## La surveiller

`metamob.rateLimit` indique où en est la clé du client, d'après le compte de ce client : il ne sait rien des requêtes faites ailleurs avec la même clé.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

L'événement `rateLimit` est émis chaque fois qu'un appel a dû attendre, avec la durée de l'attente.

## Dépenser moins de requêtes

La limite compte les requêtes, pas les éléments. La plupart des économies sont déjà faites pour vous :

- Parcourir une liste utilise la plus grande page que l'API accepte, voir [Listes](/basics/lists/).
- `count()` et `first()` demandent un élément au lieu d'une page.
- Les données de référence sont [mises en cache](/basics/caching/), et deux appels identiques en cours partagent une seule requête.
- Les noms sont résolus à partir des [données du paquet](/basics/embedded-data/), sans requête.
- `quests.setMonsters()` écrit jusqu'à 200 monstres en une requête, là où `setMonster()` dans une boucle en enverrait 200.

Ce qui vous reste à faire :

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
// Restez bien en dessous de la limite, pour laisser de la place à un autre programme sur la même clé.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Désactivé. Une rafale reçoit alors des 429, qui sont retentés après l'attente que l'API demande.
const unlimited = new Metamob({ rateLimit: false });
```

Monter `requests` au-dessus de 60 n'augmente pas ce que l'API autorise : cela ne fait que déplacer l'attente du client vers des réponses 429.

## Plusieurs clés

Chaque clé a sa propre fenêtre. Un client créé avec [`withKey()`](/basics/many-keys/) partage le limiteur du client dont il vient, qui garde une fenêtre par clé. Un bot qui sert dix joueurs ne mélange donc jamais leurs décomptes.

## Annuler une attente

Un appel qui attend son tour peut être annulé avec un `signal`. Il lève une erreur avec le code `ABORTED` et libère sa place.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

## Référence

| Option | Par défaut | Signification |
| --- | --- | --- |
| `rateLimit` | actif | `false` désactive le limiteur |
| `rateLimit.requests` | `60` | Requêtes autorisées par fenêtre, par clé |
| `rateLimit.per` | `"1m"` | Durée de la fenêtre |

| `metamob.rateLimit` | Signification |
| --- | --- |
| `limit` | Requêtes autorisées par fenêtre |
| `remaining` | Requêtes restantes dans la fenêtre en cours |
| `resetsIn` | Millisecondes avant qu'une requête soit de nouveau libre, 0 quand il y en a déjà une |

## Voir aussi

- [Cache](/basics/caching/)
- [Erreurs](/basics/errors/)
- [Agir pour d'autres joueurs](/basics/many-keys/)
- [Listes](/basics/lists/)
