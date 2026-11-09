---
title: Conversations
description: "Lire les conversations privées du compte, les marquer comme lues et envoyer un message."
sidebar:
  order: 7
---

## Lister les conversations

`conversations.list()` donne une conversation par correspondant, la plus récente en premier. C'est une [liste](/basics/lists/) de 50 par page au plus :

```ts
const page = await metamob.conversations.list();

for (const { username, unread_count } of page.items) {
  console.log(username, `${unread_count} unread`);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Sans `status`, ce sont les conversations actives qui sont listées.

## Lire une conversation

`conversations.messages()` donne ce qui a été échangé avec un joueur, du plus récent au plus ancien. Les messages et les propositions d'échange arrivent ensemble, et `kind` les distingue :

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

Pour les afficher dans l'ordre de lecture, inversez le tableau :

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Remonter dans le temps

Les messages sont paginés avec un curseur : chaque page donne celui de la suivante, à renvoyer tel quel. `for await` s'en charge. À la main :

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const beforeId = page.nextBeforeId;
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId });
}
```

Il n'y a pas de total pour les messages : `page.total` et `count()` valent `undefined`. Le nombre d'éléments d'une conversation est `message_count`, dans la liste des conversations.

## Propositions d'échange

Une proposition apparaît dans la conversation comme un élément dont `kind` vaut `"proposal"`. Pour toutes les propositions du compte, filtrées par état, par quête ou par date, voir [Propositions d'échange](/resources/trade-proposals/).

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const { monster_id, quantity } of item.monsters_given) {
    console.log("  given:", quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Une proposition désigne ses monstres par leur identifiant : [`data.monster()`](/basics/embedded-data/) transforme un identifiant en monstre sans requête.

Quand vous êtes le destinataire, vous recevez `monsters_given` et vous donnez `monsters_received`. Une proposition a ici les mêmes champs que dans [`tradeProposals.list()`](/resources/trade-proposals/), avec `kind` en plus.

## Messages non lus

`unread_count` compte ce que vous avez reçu sans l'avoir lu, propositions comprises. Dans une conversation, un élément non lu a `read_at` à `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marquer comme lu

`conversations.markAsRead()` marque comme lu tout ce qui a été reçu d'un joueur, comme l'ouverture de la conversation sur le site. Elle renvoie le nombre d'éléments marqués, `0` s'il n'y en avait aucun :

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

## Envoyer un message

`conversations.send()` envoie un message privé de 1000 caractères au plus, et le renvoie tel qu'il apparaît dans la conversation :

```ts
const text = "Salut, ton Tofu Maléfique est toujours dispo ?";
const message = await metamob.conversations.send(username, text);
console.log(message.id, message.created_at);
```

:::note
L'envoi est fermé par défaut : Metamob l'ouvre compte par compte, sur demande, et l'API répond `FORBIDDEN` sans cela. Les règles sont celles du site : `FORBIDDEN` aussi quand l'un des deux joueurs a bloqué l'autre, `RATE_LIMITED` au-delà des limites anti-spam.
:::

Un message n'est jamais retenté, quel que soit l'échec : envoyé deux fois, il arriverait deux fois. Après un délai dépassé ou une coupure réseau, lisez la conversation avant de le renvoyer.

## Limites et erreurs

- Appliquer ou annuler une proposition se fait avec [`tradeProposals`](/resources/trade-proposals/).
- Un message vide, ou de plus de 1000 caractères, est refusé avant d'être envoyé.
- `markAsRead()` répond `NOT_FOUND` pour un pseudo qui n'existe pas.
- Un correspondant peut ne plus avoir de profil : un compte supprimé garde ses conversations lisibles pendant 30 jours, alors que `users.get()` répond `NOT_FOUND`.
- Les conversations appartiennent au compte de la clé. Rien ici n'est mis en cache par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | une liste de `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | une liste de `ConversationItem`, par curseur |
| `conversations.markAsRead(username, options?)` | `{ marked_count }` |
| `conversations.send(username, content, options?)` | `ConversationMessage` |

Une `Conversation` :

| Champ | Type |
| --- | --- |
| `username` | `string`, le correspondant |
| `message_count` | `number`, propositions comprises |
| `unread_count` | `number`, reçus et pas encore lus |
| `has_priority_unread` | `boolean`, un message prioritaire du staff de Metamob est non lu |
| `last_message_at` | `string` |

Un message :

| Champ | Type |
| --- | --- |
| `kind` | `"message"` |
| `id` | `number` |
| `content` | `string` |
| `sender` | `string`, un pseudo |
| `created_at` | `string` |
| `read_at` | `string \| null` |
| `is_priority` | `boolean`, un message prioritaire du staff de Metamob, que le site affiche dans une fenêtre dorée tant qu'il n'est pas lu |

Une proposition :

| Champ | Type |
| --- | --- |
| `kind` | `"proposal"` |
| `id` | `number` |
| `sender`, `recipient` | `string`, des pseudos |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null` |
| `quest_template` | `{ id, quest_type } \| null`, `null` quand la quête a été supprimée |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null` |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, qui a confirmé |
| `cancelled_at`, `cancelled_by` | `string \| null` |
| `created_at` | `string` |
| `read_at` | `string \| null` |
