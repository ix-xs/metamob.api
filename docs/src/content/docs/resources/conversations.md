---
title: Conversations
description: Lisez les conversations privées du compte et, dans chacune, les messages et les propositions d'échange échangés avec un joueur. L'API les lit, elle n'en envoie pas.
sidebar:
  order: 7
---

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind === "message") console.log(`${item.sender}: ${item.content}`);
  else console.log(`${item.sender} proposed a trade (${item.status})`);
}
```

## Lister les conversations

Il y a une conversation par correspondant, la plus récente en premier. C'est une [liste](/basics/lists/), de 50 par page au plus.

```ts
const page = await metamob.conversations.list();

for (const conversation of page.items) {
  console.log(conversation.username, conversation.message_count, conversation.last_message_at);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Sans `status`, ce sont les conversations actives qui sont listées.

## Lire une conversation

`conversations.messages()` donne ce qui a été échangé avec un joueur, du plus récent au plus ancien. Deux sortes d'éléments arrivent mélangés, et `kind` les distingue.

```ts
const latest = await metamob.conversations.messages(username).take(10);

for (const item of latest) {
  if (item.kind === "message") {
    item.content;
    item.sender;
    item.read_at; // null tant qu'il n'est pas lu
  }
}
```

Pour les afficher dans l'ordre de lecture, inversez ce que vous avez récupéré :

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Remonter dans le temps

Les messages sont paginés avec un curseur, pas avec un décalage : chaque page fournit le curseur de la suivante. Renvoyez-le tel quel : ce n'est pas l'identifiant d'un message. L'itération le fait pour vous. À la main :

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId: page.nextBeforeId });
  older.items;
}
```

Il n'y a pas de total pour les messages : `page.total` et `count()` valent `undefined`. Le nombre d'éléments d'une conversation est `message_count`, dans la liste des conversations.

## Propositions d'échange

Une proposition faite sur le site apparaît dans la conversation comme un élément dont `kind` vaut `"proposal"`.

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const given of item.monsters_given) {
    console.log(`  given: ${given.quantity} x ${data.monster(given.monster_id)?.name.fr}`);
  }
  for (const received of item.monsters_received) {
    console.log(`  received: ${received.quantity} x ${data.monster(received.monster_id)?.name.fr}`);
  }
}
```

Une proposition désigne ses monstres par leur identifiant : [`data.monster()`](/basics/embedded-data/) transforme un identifiant en monstre sans requête.

| `status` | Signification |
| --- | --- |
| `pending` | Personne n'a encore confirmé |
| `half_applied` | Un des deux joueurs a confirmé : voir `applications` |
| `completed` | Les deux joueurs ont confirmé |
| `cancelled` | Annulée, à la date `cancelled_at` |

## Messages non lus

L'API n'a pas de compteur de messages non lus. Un message que vous avez reçu et pas encore ouvert a `read_at` à `null` :

```ts
const me = await metamob.me();
const recent = await metamob.conversations.messages(username).take(50);

const unread = recent.filter((item) => item.kind === "message" && item.sender !== me.username && item.read_at === null);
```

## Limites et erreurs

- L'API n'envoie pas de messages. Elle ne crée, ne confirme et n'annule pas non plus de propositions.
- Un correspondant peut ne plus avoir de profil : un compte supprimé garde ses conversations lisibles pendant 30 jours, alors que `users.get()` répond `NOT_FOUND`.
- Les conversations appartiennent au compte de la clé. Rien ici n'est mis en cache par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | une liste de `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | une liste de `ConversationItem`, par curseur |

Un message :

| Champ | Type |
| --- | --- |
| `kind` | `"message"` |
| `id` | `number` |
| `content` | `string` |
| `sender` | `string`, un pseudo |
| `created_at` | `string` |
| `read_at` | `string \| null` |

Une proposition :

| Champ | Type |
| --- | --- |
| `kind` | `"proposal"` |
| `id` | `number` |
| `sender`, `recipient` | `string`, des pseudos |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server_id` | `number` |
| `quest_type` | `{ id, slug } \| null`, `null` quand la quête a été supprimée |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, qui a confirmé |
| `cancelled_at` | `string \| null` |
| `created_at` | `string` |

## Voir aussi

- [Listes](/basics/lists/)
- [Échanges](/resources/trading/)
- [Autres joueurs](/resources/users/)
- [Les données du paquet](/basics/embedded-data/)
