---
title: Erreurs
description: "Un appel renvoie les données ou lève une erreur. Les sortes d'erreurs, leurs codes, et ce qui est retenté."
sidebar:
  order: 3
---

Un appel renvoie les données demandées, ou lève une erreur quand il échoue. Chaque erreur porte un `code` à tester :

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

Une erreur de l'API a aussi des raccourcis pour les cas les plus courants :

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

Certains échecs sont passagers. Dans ces cas, la bibliothèque renvoie la requête avant de lever l'erreur :

| Échec | Retenté |
| --- | --- |
| 429, limite de requêtes | Oui, après l'attente que l'API demande |
| 502, 503, 504 | Oui |
| 500 | Sur les lectures seulement |
| Panne réseau, délai dépassé | Oui |
| 400, 401, 403, 404 | Non |
| Annulé avec votre `signal` | Non |

Par défaut, il y a jusqu'à 3 tentatives supplémentaires. Le délai commence à 500 ms et double à chaque fois, jusqu'à 60 secondes. Quand l'API envoie `Retry-After`, c'est cette attente qui est utilisée. Un `Retry-After` plus long que `maxDelay` n'est pas attendu : l'erreur est levée aussitôt, avec son `retryAfter` en secondes.

Les écritures qui fixent une valeur, sur une quête ou une conversation, donnent le même résultat envoyées deux fois : elles sont retentées elles aussi. L'envoi d'un message ou d'une proposition d'échange ne l'est jamais, puisqu'il arriverait deux fois. Après un délai dépassé, vérifiez qu'il n'est pas parti avant de le renvoyer.

Le nombre de tentatives se règle pour le client ou pour un appel :

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

Un argument que l'API refuserait à coup sûr est refusé avant l'envoi, avec `INVALID_ARGUMENT` : un slug vide, une quantité négative, une recherche de moins de 3 caractères, une date au mauvais format, un message de plus de 1000 caractères, une proposition sans monstre.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`MetamobApiError`](/reference/metamob-api-error/) | L'API a répondu avec un statut d'erreur. |
| [`MetamobArgumentError`](/reference/metamob-argument-error/) | Levée avant l'envoi de l'appel qu'elle concerne : un argument invalide, une clé API absente, ou un nom qui ne correspond à aucun monstre, zone ou serveur. |
| [`MetamobError`](/reference/metamob-error/) | Classe de base de tout ce que lève cette bibliothèque. |
| [`MetamobRequestError`](/reference/metamob-request-error/) | La requête n'a jamais produit de réponse exploitable : délai dépassé, panne réseau, annulation ou corps illisible. |
| [`isMetamobError`](/reference/is-metamob-error/) | Garde de type pour les erreurs levées par cette bibliothèque, éventuellement restreinte à un code. |
| [`MetamobErrorCode`](/reference/metamob-error-code/) | Le `code` de chaque erreur levée par cette bibliothèque. |
<!-- exports:end -->
