---
title: Conversations
description: Read the private conversations of the account and, inside each one, the messages and the trade proposals exchanged with a player, see what is unread and mark it as read. The API does not send messages.
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
  console.log(conversation.username, `${conversation.unread_count} unread of ${conversation.message_count}`);
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

Messages are paged with a cursor, not an offset: each page comes with the cursor of the next one. Send it back as it is: it is not the id of a message. Iterating does it for you. By hand:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId: page.nextBeforeId });
  older.items;
}
```

There is no total for messages: `page.total` and `count()` are `undefined`. The number of items of a conversation is `message_count` in the list of conversations.

## Trade proposals

A proposal made on the site appears in the conversation as an item of kind `"proposal"`. To follow every proposal of the account at once, filtered by state, quest or date, see [Trade proposals](/resources/trade-proposals/).

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

When you are the recipient, you receive `monsters_given` and give `monsters_received`. A proposal has the same fields here as in [`tradeProposals.list()`](/resources/trade-proposals/), with `kind` on top.

## Unread messages

Each conversation counts what you received and did not read yet, trade proposals included, in `unread_count`. Inside a conversation, an item you did not open has `read_at` set to `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marking as read

`conversations.markAsRead()` marks as read every message received from a player, proposals included, as opening the conversation on the site would. It answers how many it marked: `0` when there was nothing unread.

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

It is the only write of conversations: the API does not send messages.

## Limits and errors

- The API does not send messages, and does not create, confirm or cancel proposals.
- `markAsRead()` answers `NOT_FOUND` for a username that does not exist.
- A correspondent may have no profile left: a deleted account keeps its conversations readable for 30 days, while `users.get()` answers `NOT_FOUND`.
- Conversations belong to the account of the key. Nothing here is cached by default.

## Reference

| Method | Returns |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | a list of `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | a list of `ConversationItem`, by cursor |
| `conversations.markAsRead(username, options?)` | `{ marked_count }` |

A `Conversation`:

| Field | Type |
| --- | --- |
| `username` | `string`, the correspondent |
| `message_count` | `number`, proposals included |
| `unread_count` | `number`, received and not read yet |
| `last_message_at` | `string` |

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
| `server` | `Server \| null` |
| `quest_template` | `{ id, quest_type } \| null`, `null` when the quest was deleted |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null` |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, who confirmed |
| `cancelled_at`, `cancelled_by` | `string \| null` |
| `created_at` | `string` |
| `read_at` | `string \| null` |

## See also

- [Lists](/basics/lists/)
- [Trade proposals](/resources/trade-proposals/)
- [Trading](/resources/trading/)
- [Other players](/resources/users/)
- [The data in the package](/basics/embedded-data/)
