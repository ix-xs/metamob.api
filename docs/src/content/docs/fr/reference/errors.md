---
title: Codes d'erreur
description: "Tous les codes d'erreur que la bibliothèque lève, leur cause, si une nouvelle tentative a déjà eu lieu, et les propriétés de chaque classe d'erreur. Servez-vous-en pour savoir ce que signifie un échec."
---

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);
} catch (error) {
  if (error instanceof MetamobError) {
    error.code; // défini par la bibliothèque, par exemple "NOT_FOUND"
    error.message; // "quests.setMonster: Quest not found"
  }
  throw error;
}
```

Toutes les erreurs étendent `MetamobError` et portent un `code`. [Erreurs](/basics/errors/) explique comment les traiter. Cette page est la table où les retrouver.

## Codes

`code` est un `MetamobErrorCode`. Il y en a 14.

« Retentée » signifie jusqu'à 3 tentatives de plus par défaut. Le délai commence à 500 ms et double, jusqu'à 60 secondes. Quand l'API envoie un `Retry-After`, c'est cette attente qui est utilisée, sauf si elle dépasse `retry.maxDelay` : l'erreur est alors levée aussitôt, avec son `retryAfter`.

Venant de l'API, sous forme de `MetamobApiError` :

| Code | Statut | Cause | Retentée |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | Un paramètre que l'API refuse : une quantité hors limites, une valeur de filtre inconnue | Non |
| `UNAUTHORIZED` | 401 | La clé est absente, invalide ou a été révoquée | Non |
| `FORBIDDEN` | 403 | La clé n'a pas le droit de faire cela | Non |
| `NOT_FOUND` | 404 | Cela n'existe pas, ou ce n'est pas à vous : une quête d'un autre compte, une quête masquée, un joueur supprimé | Non |
| `RATE_LIMITED` | 429 | Plus de 60 requêtes en une minute avec cette clé | Oui |
| `SERVER_ERROR` | 500 et plus | L'API a échoué | 502, 503, 504 : oui. 500 : lectures seulement |
| `API_ERROR` | tout autre | Un statut d'erreur pour lequel la bibliothèque n'a pas de nom | Non |

Venant de la requête, sous forme de `MetamobRequestError` :

| Code | Cause | Retentée |
| --- | --- | --- |
| `TIMEOUT` | Une tentative n'a reçu aucune réponse dans le délai `timeout`, 30 secondes par défaut | Oui |
| `NETWORK` | La requête n'a pas pu être faite : pas de connexion, DNS, TLS | Oui |
| `ABORTED` | Votre `signal` a annulé l'appel | Non |
| `PARSE_ERROR` | L'API a répondu 200 avec autre chose que du JSON | Non |

Venant de la bibliothèque, sous forme de `MetamobArgumentError`, avant tout envoi :

| Code | Cause |
| --- | --- |
| `MISSING_API_KEY` | Aucune clé dans les options du client, ni dans les options de l'appel, ni dans `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | Un argument qui ne peut pas être correct : un slug vide, une quantité négative, une recherche de moins de 3 caractères, une date au mauvais format, un lot vide |
| `UNKNOWN_NAME` | Aucun monstre, zone, sous-zone, serveur, version ou type ne porte ce nom. `suggestions` contient les plus proches |

## MetamobError

La base des trois.

| Propriété | Type | Signification |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | L'un des codes ci-dessus |
| `message` | `string` | La méthode, puis ce qui a échoué |
| `name` | `string` | Le nom de la classe |
| `cause` | `unknown` | L'erreur d'origine, quand il y en a une |

## MetamobApiError

| Propriété | Type | Signification |
| --- | --- | --- |
| `status` | `number` | Le statut HTTP |
| `method` | `string` | La méthode qui a échoué, par exemple `quests.get` |
| `url` | `string` | L'adresse appelée. Elle ne contient jamais la clé |
| `messages` | `Record<string, string>` | Ce que l'API a dit, par champ. Souvent `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | Le nombre de secondes que l'API a demandé d'attendre, sur un 429 |
| `body` | `unknown` | Le corps de la réponse, analysé quand c'est du JSON |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

L'API formule ses erreurs de trois façons selon le point d'accès. La bibliothèque les lit toutes dans `message` et `messages` : vous n'avez donc jamais à analyser `body` vous-même.

## MetamobRequestError

| Propriété | Type | Signification |
| --- | --- | --- |
| `method` | `string` | La méthode qui a échoué |
| `cause` | `unknown` | Ce que `fetch` a levé, ou la raison de l'annulation |

## MetamobArgumentError

| Propriété | Type | Signification |
| --- | --- | --- |
| `suggestions` | `readonly string[]` | Pour `UNKNOWN_NAME`, les noms existants les plus proches, le meilleur d'abord. Vide sinon |

## isMetamobError

```ts
function handle(error: unknown) {
  if (isMetamobError(error)) error.code; // n'importe quelle erreur de la bibliothèque
  if (isMetamobError(error, "NOT_FOUND")) error.message; // un seul code
}
```

C'est un garde de type : dans la branche, `error` est une `MetamobError`.

## Voir aussi

- [Erreurs](/basics/errors/)
- [Dépannage](/help/troubleshooting/)
- [La limite de requêtes](/basics/rate-limit/)
- [Tous les exports](/reference/exports/)
