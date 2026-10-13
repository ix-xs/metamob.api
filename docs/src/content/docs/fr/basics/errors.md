---
title: Erreurs
description: "Un appel renvoie les données ou lève une erreur. Chaque erreur a un code typé, et celles qui viennent de l'API portent aussi le statut et le message qu'elle a envoyés. Cette page montre comment les distinguer et ce qui est retenté pour vous."
sidebar:
  order: 3
---

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Trois sortes d'erreurs

| Classe | Quand | En plus |
| --- | --- | --- |
| `MetamobApiError` | L'API a répondu avec un statut d'erreur | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | Aucune réponse exploitable : panne réseau, délai dépassé, annulation, JSON invalide | `method`, `cause` |
| `MetamobArgumentError` | L'appel a été refusé avant d'être envoyé : mauvais argument, nom inconnu, pas de clé | `suggestions` |

Les trois étendent `MetamobError`, qui a un `code`.

## Tester une erreur

`isMetamobError(error)` indique si une erreur vient de la bibliothèque. Avec un code, elle vérifie aussi le code.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // une faute de frappe dans le nom du monstre
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // la quête n'existe pas, ou n'est pas à vous
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // la clé a été révoquée
  } else {
    throw error;
  }
}
```

Une erreur de l'API a des raccourcis pour les trois que vous testez le plus :

```ts
try {
  await metamob.quests.get(slug);
} catch (error) {
  if (error instanceof MetamobApiError) {
    error.isNotFound; // 404
    error.isUnauthorized; // 401
    error.isRateLimited; // 429
    error.status; // le statut HTTP
    error.messages; // ce que l'API a dit, par champ : { error: "Quest not found" }
  }
}
```

## Ce que signifie un 404

L'API répond 404 pour ce qui n'existe pas et pour ce qui n'est pas à vous. `quests.get()`, `quests.monsters()` et toutes les écritures répondent `NOT_FOUND` sur une quête d'un autre compte, qu'elle existe ou non. `users.quest()` répond `NOT_FOUND` sur une quête masquée.

## Ce qui est retenté

Avant qu'une erreur vous parvienne, la bibliothèque a déjà réessayé quand réessayer peut aider.

| Échec | Retenté |
| --- | --- |
| 429, limite de requêtes | Oui, après l'attente que l'API demande |
| 502, 503, 504 | Oui |
| 500 | Sur les lectures seulement |
| Panne réseau, délai dépassé | Oui |
| 400, 401, 403, 404 | Non |
| Annulé avec votre `signal` | Non |

Par défaut, il y a jusqu'à 3 tentatives supplémentaires. Le délai commence à 500 ms et double à chaque fois, jusqu'à 60 secondes. Quand l'API envoie `Retry-After`, c'est cette attente qui est utilisée. Un `Retry-After` plus long que `maxDelay` n'est pas attendu : l'erreur est levée aussitôt, avec son `retryAfter` en secondes.

Chaque écriture de cette API fixe une valeur, donc en envoyer une deux fois donne le même résultat. C'est pourquoi les écritures sont retentées elles aussi.

```ts
// Pour tout le client.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// Pour un seul appel.
await metamob.quests.get(slug, { retry: false });
```

Pour voir les nouvelles tentatives au moment où elles ont lieu :

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Délais et annulation

Une tentative dispose de 30 secondes par défaut. `timeout` change ce délai, pour le client ou pour un appel. Un `signal` annule un appel de l'extérieur, y compris pendant qu'il attend le limiteur.

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 2000);

try {
  await metamob.quests.matches(slug, {}, { signal: controller.signal, timeout: "5s" });
} catch (error) {
  if (isMetamobError(error, "ABORTED")) console.log("Cancelled.");
  if (isMetamobError(error, "TIMEOUT")) console.log("Too slow.");
}
```

## Les arguments sont vérifiés d'abord

Ce dont on peut savoir que c'est faux sans interroger l'API est refusé localement, avec `INVALID_ARGUMENT` : un slug vide, une quantité négative, une recherche de moins de 3 caractères, une date au mauvais format. Aucune requête n'est dépensée.

## Référence

| Code | Signification |
| --- | --- |
| `BAD_REQUEST` | 400 : l'API a refusé les paramètres |
| `UNAUTHORIZED` | 401 : clé manquante, invalide ou révoquée |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 : n'existe pas, ou n'est pas à vous |
| `RATE_LIMITED` | 429, après les nouvelles tentatives |
| `SERVER_ERROR` | 5xx, après les nouvelles tentatives |
| `API_ERROR` | Tout autre statut d'erreur |
| `TIMEOUT` | Pas de réponse à temps |
| `NETWORK` | La requête n'a pas pu être faite |
| `ABORTED` | Annulé avec votre `signal` |
| `PARSE_ERROR` | La réponse n'était pas du JSON valide |
| `MISSING_API_KEY` | Pas de clé dans les options, l'appel ou l'environnement |
| `INVALID_ARGUMENT` | Un argument est faux |
| `UNKNOWN_NAME` | Aucun monstre, zone ou serveur ne porte ce nom |

[Codes d'erreur](/reference/errors/) liste les propriétés de chaque classe.

## Voir aussi

- [La limite de requêtes](/basics/rate-limit/)
- [Noms et identifiants](/basics/names-and-ids/)
- [Configuration](/basics/configuration/)
- [Dépannage](/help/troubleshooting/)
