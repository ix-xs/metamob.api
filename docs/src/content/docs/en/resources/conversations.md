---
title: Conversations
description: "Read the private conversations of the account, mark them as read and send a message."
sidebar:
  order: 7
---

## Listing conversations

`conversations.list()` gives one conversation per correspondent, the most recent first. It is a [list](/basics/lists/) of 50 per page at most:

```ts
const page = await metamob.conversations.list();

for (const { username, unread_count } of page.items) {
  console.log(username, `${unread_count} unread`);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Without `status`, the active conversations are listed.

## Reading a conversation

`conversations.messages()` gives what was exchanged with a player, from the most recent to the oldest. Messages and trade proposals come together, and `kind` tells them apart:

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

To show them in reading order, reverse the array:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Going back in time

Messages are paged with a cursor: each page gives the one of the next, to send back as it is. `for await` takes care of it. By hand:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const beforeId = page.nextBeforeId;
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId });
}
```

There is no total for messages: `page.total` and `count()` are `undefined`. The number of items of a conversation is `message_count`, in the list of conversations.

## Trade proposals

A proposal appears in the conversation as an item whose `kind` is `"proposal"`. For every proposal of the account, filtered by state, quest or date, see [Trade proposals](/resources/trade-proposals/).

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const { monster_id, quantity } of item.monsters_given) {
    console.log("  given:", quantity, data.monster(monster_id)?.name.fr);
  }
}
```

A proposal names its monsters by id: [`data.monster()`](/basics/embedded-data/) turns an id into a monster without a request.

When you are the recipient, you receive `monsters_given` and give `monsters_received`. A proposal has the same fields here as in [`tradeProposals.list()`](/resources/trade-proposals/), with `kind` on top.

## Unread messages

`unread_count` counts what you received without reading it, proposals included. Inside a conversation, an unread item has `read_at` set to `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marking as read

`conversations.markAsRead()` marks as read everything received from a player, as opening the conversation on the site does. It returns the number of items marked, `0` when there was none:

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

## Sending a message

`conversations.send()` sends a private message of 1000 characters at most, and returns it as it appears in the conversation:

```ts
const text = "Salut, ton Tofu Maléfique est toujours dispo ?";
const message = await metamob.conversations.send(username, text);
console.log(message.id, message.created_at);
```

:::note
Sending is closed by default: Metamob opens it account by account, on request, and the API answers `FORBIDDEN` without it. The rules are the ones of the site: `FORBIDDEN` too when one of the two players blocked the other, `RATE_LIMITED` past the anti-spam limits.
:::

A message is never retried, whatever the failure: sent twice, it would arrive twice. After a timeout or a network failure, read the conversation before sending it again.

## Limits and errors

- Confirming or cancelling a proposal is done on the site.
- An empty message, or one longer than 1000 characters, is refused before being sent.
- `markAsRead()` answers `NOT_FOUND` for a username that does not exist.
- A correspondent may have no profile left: a deleted account keeps its conversations readable for 30 days, while `users.get()` answers `NOT_FOUND`.
- Conversations belong to the account of the key. Nothing here is cached by default.

## Reference

| Method | Returns |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | a list of `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | a list of `ConversationItem`, by cursor |
| `conversations.markAsRead(username, options?)` | `{ marked_count }` |
| `conversations.send(username, content, options?)` | `ConversationMessage` |

A `Conversation`:

| Field | Type |
| --- | --- |
| `username` | `string`, the correspondent |
| `message_count` | `number`, proposals included |
| `unread_count` | `number`, received and not read yet |
| `has_priority_unread` | `boolean`, a priority message from the Metamob staff is unread |
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
| `is_priority` | `boolean`, a priority message from the Metamob staff, shown by the site in a golden popup until it is read |

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
