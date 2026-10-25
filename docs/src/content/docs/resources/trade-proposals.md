---
title: Propositions d'échange
description: Suivez les propositions d'échange que vous avez envoyées et reçues sur toutes vos quêtes, filtrez-les par sens, par état, par quête ou par date, et voyez ce que vous possédez de chaque monstre avant de répondre.
sidebar:
  order: 8
---

```ts
const waiting = await metamob.tradeProposals.list({ direction: "received", status: "pending" }).all();

for (const proposal of waiting) {
  console.log(`${proposal.sender} proposes a trade on ${proposal.server?.name}`);
}
```

Une proposition d'échange se fait sur le site, depuis une quête, à destination d'un autre joueur. L'API les lit : elle n'en crée, n'en confirme et n'en annule aucune. Chacune apparaît aussi dans la [conversation](/resources/conversations/#trade-proposals) avec ce joueur.

## Lister les propositions

`tradeProposals.list()` donne les propositions du compte, la plus récente en premier. C'est une [liste](/basics/lists/), de 50 par page au plus, paginée avec un curseur comme les messages.

```ts
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const onQuest = await metamob.tradeProposals.list({ quest: slug, status: "completed" }).all();
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
  console.log(proposal.id, incoming.map((monster) => `${monster.quantity} x ${data.monster(monster.monster_id)?.name.fr}`));
}
```

Une proposition désigne ses monstres par leur identifiant : [`data.monster()`](/basics/embedded-data/) transforme un identifiant en monstre sans requête.

| `status` | Signification |
| --- | --- |
| `pending` | Personne n'a encore confirmé |
| `half_applied` | Un des deux joueurs a confirmé : voir `applications` |
| `completed` | Les deux joueurs ont confirmé |
| `cancelled` | Annulée par `cancelled_by`, ou expirée quand `cancelled_by` vaut `null` |

## Lire une proposition

`tradeProposals.get()` prend un identifiant, ou une proposition tirée d'une liste. Quand une proposition est lue seule, chaque monstre est accompagné de `owned` : le nombre d'exemplaires que vous en possédez maintenant, dans votre quête concernée par la proposition.

```ts
const proposal = await metamob.tradeProposals.get(57);

for (const monster of proposal.monsters_given) {
  console.log(data.monster(monster.monster_id)?.name.fr, `${monster.owned ?? 0} owned, ${monster.quantity} in the proposal`);
}
```

`owned` est la quantité actuelle, pas celle du jour où la proposition a été faite : une fois l'échange appliqué, elle en tient déjà compte. Il vaut `null` quand vous n'avez pas de quête de ce type sur ce serveur.

## Surveiller les nouvelles propositions

En interrogeant la liste toutes les quelques minutes avec `since`, vous savez ce qui est arrivé entre-temps, par exemple pour un bot qui vous prévient.

```ts
let lastCheck = new Date();

setInterval(async () => {
  const now = new Date();
  const fresh = await metamob.tradeProposals.list({ direction: "received", since: lastCheck }).all();
  lastCheck = now;
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` reste à `null` tant que le destinataire n'a pas ouvert la proposition sur le site.

## Limites et erreurs

- L'API ne crée, ne confirme et n'annule pas de propositions.
- `NOT_FOUND` pour une proposition qui n'existe pas ou qui n'est pas la vôtre.
- Un identifiant, une quête ou une date invalide est refusé avant d'être envoyé.
- Les propositions appartiennent au compte de la clé. Rien ici n'est mis en cache par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | une liste de `TradeProposal`, par curseur |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |

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

Une `TradeProposalDetail` est identique, avec `owned: number | null` sur chaque monstre.

## Voir aussi

- [Conversations](/resources/conversations/)
- [Échanges](/resources/trading/)
- [Listes](/basics/lists/)
- [Les données du paquet](/basics/embedded-data/)
