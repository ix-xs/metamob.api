---
title: Conversations
description: Read the private conversations of the account and, inside each one, the messages and the trade proposals exchanged with a player. The API reads them, it does not send any.
sidebar:
  order: 7
---

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind === "message") console.log(`${item.sender}: ${item.content}`);
  else console.log(`${item.sender} proposed a trade (${item.status})`);
}
```

## Listing conversations

There is one conversation per correspondent, the most recent first. It is a [list](/basics/lists/), 50 per page at most.

```ts
const page = await metamob.conversations.list();

for (const conversation of page.items) {
  console.log(conversation.username, conversation.message_count, conversation.last_message_at);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Without `status`, the active conversations are listed.

## Reading a conversation

`conversations.messages()` gives what was exchanged with a player, from the most recent to the oldest. Two kinds of items come mixed, told apart by `kind`.

```ts
const latest = await metamob.conversations.messages(username).take(10);

for (const item of latest) {
  if (item.kind === "message") {
    item.content;
    item.sender;
    item.read_at; // null while it is unread
  }
}
```

To show them in reading order, reverse what you collected:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Going back in time

Messages are paged with a cursor, not an offset: each page ends with the id from which the next one starts. Iterating does it for you. By hand:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId: page.nextBeforeId });
  older.items;
}
```

There is no total for messages: `page.total` and `count()` are `undefined`. The number of items of a conversation is `message_count` in the list of conversations.

## Trade proposals

A proposal made on the site appears in the conversation as an item of kind `"proposal"`.

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

A proposal names its monsters by id: [`data.monster()`](/basics/embedded-data/) turns an id into a monster without a request.

| `status` | Meaning |
| --- | --- |
| `pending` | Nobody confirmed yet |
| `half_applied` | One side confirmed: see `applications` |
| `completed` | Both sides confirmed |
| `cancelled` | Cancelled, at `cancelled_at` |

## Unread messages

The API has no unread counter. A message you received and did not open has `read_at` set to `null`:

```ts
const me = await metamob.me();
const recent = await metamob.conversations.messages(username).take(50);

const unread = recent.filter((item) => item.kind === "message" && item.sender !== me.username && item.read_at === null);
```

## Limits and errors

- The API does not send messages, and does not create, confirm or cancel proposals.
- A correspondent may have no profile left: a deleted account keeps its conversations readable for 30 days, while `users.get()` answers `NOT_FOUND`.
- Conversations belong to the account of the key. Nothing here is cached by default.

## Reference

| Method | Returns |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | a list of `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | a list of `ConversationItem`, by cursor |

A message:

| Field | Type |
| --- | --- |
| `kind` | `"message"` |
| `id` | `number` |
| `content` | `string` |
| `sender` | `string`, a username |
| `created_at` | `string` |
| `read_at` | `string \| null` |

A proposal:

| Field | Type |
| --- | --- |
| `kind` | `"proposal"` |
| `id` | `number` |
| `sender`, `recipient` | `string`, usernames |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server_id` | `number` |
| `quest_type` | `{ id, slug } \| null`, `null` when the quest was deleted |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, who confirmed |
| `cancelled_at` | `string \| null` |
| `created_at` | `string` |

## See also

- [Lists](/basics/lists/)
- [Trading](/resources/trading/)
- [Other players](/resources/users/)
- [The data in the package](/basics/embedded-data/)
