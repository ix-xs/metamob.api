---
title: Propositions d'échange
description: "Lire les propositions d'échange envoyées et reçues, et en envoyer une."
sidebar:
  order: 8
---

Une proposition d'échange part d'une de vos quêtes, vers un autre joueur. L'API permet de les lire, d'appliquer votre côté ou de les annuler, et d'en envoyer quand l'envoi est ouvert sur le compte. Chacune apparaît aussi dans la [conversation](/resources/conversations/#trade-proposals) avec ce joueur.

## Lister les propositions

`tradeProposals.list()` donne les propositions du compte, la plus récente en premier. C'est une [liste](/basics/lists/) de 50 par page au plus, paginée avec un curseur comme les messages :

```ts
const pending = { direction: "received", status: "pending" } as const;

const waiting = await metamob.tradeProposals.list(pending).all();
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const done = await metamob.tradeProposals.list({ quest: slug, status: "completed" });
```

| Filtre | Valeurs |
| --- | --- |
| `direction` | `"received"` : faites à vous. `"sent"` : faites par vous. `"all"`, la valeur par défaut : les deux |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"` |
| `quest` | Le slug de l'une de vos quêtes |
| `since` | Une `Date`, ou une date ISO 8601 avec son fuseau horaire comme `"2026-01-27T14:00:00Z"` : seulement les propositions créées à partir de ce moment, inclus |

Une date sans fuseau horaire, ou que l'API ne saurait pas lire, est refusée avant toute requête.

## Qui donne quoi

`monsters_given` est ce que l'expéditeur donne, `monsters_received` ce que l'expéditeur reçoit. Quand vous êtes le destinataire, lisez-les dans l'autre sens : vous recevez `monsters_given` et vous donnez `monsters_received`.

```ts
const me = await metamob.me();

for await (const proposal of metamob.tradeProposals.list({ status: "pending" })) {
  const mine = proposal.recipient === me.username;
  const incoming = mine ? proposal.monsters_given : proposal.monsters_received;

  for (const { monster_id, quantity } of incoming) {
    console.log(proposal.id, quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Une proposition désigne ses monstres par leur identifiant : [`data.monster()`](/basics/embedded-data/) transforme un identifiant en monstre sans requête.

| `status` | Signification |
| --- | --- |
| `pending` | Personne n'a encore appliqué son côté |
| `half_applied` | Un des deux joueurs a appliqué son côté : voir `applications` |
| `completed` | Les deux côtés sont appliqués |
| `cancelled` | Annulée par `cancelled_by`, ou expirée quand `cancelled_by` vaut `null` |

## Lire une proposition

`tradeProposals.get()` prend un identifiant, ou une proposition tirée d'une liste. La réponse ajoute `viewer`, votre côté de la proposition : votre rôle, si vous avez appliqué votre côté, ce qui sort de votre quête (`removed`) et ce qui y entre (`added`).

```ts
const proposal = await metamob.tradeProposals.get(57);

proposal.viewer.role; // "sender" ou "recipient"
proposal.viewer.applied; // vous avez appliqué votre côté

for (const { monster_id, owned, quantity } of proposal.viewer.added) {
  const name = data.monster(monster_id)?.name.fr;
  console.log(name, `${owned ?? 0} owned, ${quantity} coming`);
}
```

Chaque monstre de `removed` et de `added` porte `owned` : le nombre d'exemplaires que vous en possédez maintenant. Une fois votre côté appliqué, il en tient déjà compte. Il vaut `null` quand vous n'avez pas de quête de ce type sur ce serveur.

`create()`, `apply()` et `cancel()` renvoient la proposition sous la même forme.

## Faire une proposition

`tradeProposals.create()` envoie une proposition depuis l'une de vos quêtes. Ses champs portent les mêmes noms qu'en lecture : `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` et `monsters_received`. Les monstres s'écrivent comme pour [`quests.setMonsters()`](/resources/quests/#recording-many-monsters), par identifiant ou par nom :

```ts
// Un partenaire et sa quête, tels que matches() les trouve.
const match = await metamob.quests.matches(slug).first();

if (match) {
  const proposal = await metamob.tradeProposals.create({
    recipient: match.user.username,
    sender_quest: slug,
    recipient_quest: match.quest.slug,
    monsters_given: { "Tofu Maléfique": 1 },
    monsters_received: { "Bouftou Royal": 1 },
  });
  console.log(proposal.id, proposal.status); // "pending"
}
```

`recipient`, `sender_quest` et `recipient_quest` sont obligatoires. `recipient_quest` est le slug de la quête de l'autre joueur, que `quests.matches()` donne pour chaque partenaire. Les deux quêtes doivent être du même type et sur le même serveur. Il faut au moins un monstre, d'un côté ou de l'autre, et 200 au plus de chaque côté.

:::note
L'envoi est fermé par défaut : Metamob l'ouvre compte par compte, sur demande, et l'API répond `FORBIDDEN` sans cela. Les règles sont celles du site : `FORBIDDEN` quand l'un des deux joueurs a bloqué l'autre, `RATE_LIMITED` au-delà des limites anti-spam.
:::

Une proposition n'est jamais retentée, quel que soit l'échec : envoyée deux fois, elle existerait en double. Après un délai dépassé ou une coupure réseau, consultez `list({ direction: "sent" })` avant de la renvoyer.

## Appliquer une proposition

`tradeProposals.apply()` applique votre côté de la proposition à votre quête : ce que vous donnez en sort, ce que vous recevez y entre. Cela vaut pour l'expéditeur comme pour le destinataire, et la proposition passe à `completed` quand les deux côtés sont appliqués. Contrairement à l'envoi, c'est ouvert à toutes les clés :

```ts
const proposal = await metamob.tradeProposals.apply(57);

proposal.status; // "half_applied", ou "completed" si l'autre côté l'était déjà
proposal.viewer.applied; // true
```

S'il vous manque des exemplaires d'un monstre à donner, rien n'est modifié et l'API répond `CONFLICT`, avec ce que vous possédez et ce qui est demandé. Avec `allowPartial: true`, la proposition est appliquée quand même, chaque quantité réduite à ce que vous possédez : `viewer.clamped` vaut alors `true`, et `applied_quantity` donne ce qui a vraiment bougé pour chaque monstre. `clamped` vaut aussi `true` quand un monstre reçu dépasserait la quantité maximale.

```ts
const proposal = await metamob.tradeProposals.apply(57, { allowPartial: true });
const { clamped, removed } = proposal.viewer;

if (clamped) {
  for (const { monster_id, quantity, applied_quantity } of removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // ce qui a vraiment bougé
  }
}
```

Appliquer deux fois, ou appliquer une proposition annulée, répond aussi `CONFLICT`. `apply()` n'est jamais retenté : après un délai dépassé, relisez la proposition avec `get()` avant de recommencer.

## Annuler ou refuser

`tradeProposals.cancel()` annule une proposition que vous avez envoyée, ou refuse une proposition reçue. C'est possible tant que vous n'avez pas appliqué votre côté, même si l'autre joueur a appliqué le sien :

```ts
const proposal = await metamob.tradeProposals.cancel(57);

proposal.status; // "cancelled"
```

Une proposition déjà annulée, ou que vous avez déjà appliquée, répond `CONFLICT`. Comme `apply()`, `cancel()` n'est jamais retenté.

## Surveiller les nouvelles propositions

Interrogée régulièrement avec `since`, la liste donne ce qui est arrivé depuis la dernière fois, par exemple pour un bot qui vous prévient :

```ts
let lastCheck = new Date();

setInterval(async () => {
  const since = lastCheck;
  lastCheck = new Date();

  const fresh = await metamob.tradeProposals
    .list({ direction: "received", since })
    .all();
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` reste à `null` tant que le destinataire n'a pas ouvert la proposition sur le site.

## Limites et erreurs

- `apply()` et `cancel()` répondent `NOT_FOUND` pour une proposition qui n'existe pas ou à laquelle vous ne participez pas, et `CONFLICT` pour une proposition déjà annulée, déjà appliquée par vous, ou dont votre quête a été supprimée.
- `create()` refuse avant l'envoi une proposition sans aucun monstre, une quantité hors de 1 à 99, un monstre nommé deux fois du même côté, ou plus de 200 monstres d'un même côté.
- L'API répond `BAD_REQUEST` pour un monstre qui n'est pas dans la quête, pour un monstre dont vous donnez plus d'exemplaires que vous n'en possédez, ou pour deux quêtes de types ou de serveurs différents, et `NOT_FOUND` pour une quête qui n'existe pas ou, pour `sender_quest`, qui n'est pas la vôtre.
- `NOT_FOUND` pour une proposition qui n'existe pas ou qui n'est pas la vôtre.
- `BAD_REQUEST` pour une `quest` qui n'est pas l'une de vos quêtes, et pour un `direction` ou un `status` que l'API ne connaît pas.
- Un identifiant, une quête ou une date invalide est refusé avant d'être envoyé.
- Les propositions appartiennent au compte de la clé. Rien ici n'est mis en cache par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | une liste de `TradeProposal`, par curseur |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |
| `tradeProposals.create({ recipient, sender_quest, recipient_quest, monsters_given, monsters_received }, options?)` | `TradeProposalDetail` |
| `tradeProposals.apply(id, { allowPartial }?, options?)` | `TradeProposalDetail` |
| `tradeProposals.cancel(id, options?)` | `TradeProposalDetail` |

Une `TradeProposal` :

| Champ | Type |
| --- | --- |
| `id` | `number` |
| `sender`, `recipient` | `string`, des pseudos |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null`, avec sa version du jeu |
| `quest_template` | `{ id, quest_type } \| null`, `null` quand la quête a été supprimée |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null`, `null` quand elle n'est pas visible |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, qui a confirmé |
| `cancelled_at` | `string \| null` |
| `cancelled_by` | `string \| null`, `null` quand elle a expiré |
| `created_at` | `string` |
| `read_at` | `string \| null`, `null` tant que le destinataire ne l'a pas lue |

Une `TradeProposalDetail` est une `TradeProposal` avec `viewer` : `role` (`"sender" | "recipient"`), `applied` (`boolean`), `clamped` (`boolean | null`), `removed` et `added` (`{ monster_id, quantity, owned }[]`, avec `applied_quantity` dans la réponse d'`apply()`).
