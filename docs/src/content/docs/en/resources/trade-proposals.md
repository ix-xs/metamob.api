---
title: Trade proposals
description: "Read the trade proposals sent and received, and send one."
sidebar:
  order: 8
---

A trade proposal goes from one of your quests to another player. The API lets you read them, and send them when sending is opened on the account. Confirming or cancelling them is done on the site. Each one also appears in the [conversation](/resources/conversations/#trade-proposals) with that player.

## Listing proposals

`tradeProposals.list()` gives the proposals of the account, the most recent first. It is a [list](/basics/lists/) of 50 per page at most, paged with a cursor like messages:

```ts
const pending = { direction: "received", status: "pending" } as const;

const waiting = await metamob.tradeProposals.list(pending).all();
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const done = await metamob.tradeProposals.list({ quest: slug, status: "completed" });
```

| Filter | Values |
| --- | --- |
| `direction` | `"received"`: made to you. `"sent"`: made by you. `"all"`, the default: both |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"` |
| `quest` | The slug of one of your quests |
| `since` | A `Date`, or an ISO 8601 date with its time zone such as `"2026-01-27T14:00:00Z"`: only the proposals created from that moment on, included |

A date without a time zone, or one the API could not read, is refused before any request.

## Who gives what

`monsters_given` is what the sender gives, `monsters_received` what the sender receives. When you are the recipient, read them the other way round: you receive `monsters_given` and give `monsters_received`.

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

A proposal names its monsters by id: [`data.monster()`](/basics/embedded-data/) turns an id into a monster without a request.

| `status` | Meaning |
| --- | --- |
| `pending` | Nobody confirmed yet |
| `half_applied` | One of the two players confirmed: see `applications` |
| `completed` | Both players confirmed |
| `cancelled` | Cancelled by `cancelled_by`, or expired when `cancelled_by` is `null` |

## Reading one proposal

`tradeProposals.get()` takes an id, or a proposal taken from a list. Read on its own, each monster of the proposal carries `owned`: the number of copies of it you own now in your quest concerned.

```ts
const proposal = await metamob.tradeProposals.get(57);

for (const { monster_id, owned, quantity } of proposal.monsters_given) {
  console.log(data.monster(monster_id)?.name.fr, `${owned ?? 0} owned, ${quantity} more`);
}
```

`owned` is the current quantity, not the one of the day the proposal was made: once the trade is applied, it already includes it. It is `null` when you have no quest of that kind on that server.

## Making a proposal

`tradeProposals.create()` sends a proposal from one of your quests. Its fields have the same names as when reading: `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` and `monsters_received`. The monsters are written as for [`quests.setMonsters()`](/resources/quests/#recording-many-monsters), by id or by name:

```ts
// A partner and their quest, as matches() finds them.
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

`recipient`, `sender_quest` and `recipient_quest` are required. `recipient_quest` is the slug of the quest of the other player, which `quests.matches()` gives for each partner. Both quests must be of the same kind and on the same server. At least one monster is needed, on one side or the other, and 200 at most on each side.

:::note
Sending is closed by default: Metamob opens it account by account, on request, and the API answers `FORBIDDEN` without it. The rules are the ones of the site: `FORBIDDEN` when one of the two players blocked the other, `RATE_LIMITED` past the anti-spam limits.
:::

A proposal is never retried, whatever the failure: sent twice, it would exist twice. After a timeout or a network failure, look at `list({ direction: "sent" })` before sending it again.

## Watching for new proposals

Asked regularly with `since`, the list gives what arrived since the last time, for example for a bot that warns you:

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

`read_at` stays `null` until the recipient opens the proposal on the site.

## Limits and errors

- Confirming or cancelling a proposal is done on the site.
- `create()` refuses before sending a proposal without any monster, a quantity outside 1 to 99, a monster named twice on the same side, or more than 200 monsters on one side.
- The API answers `BAD_REQUEST` for a monster that is not in the quest, for a monster you give more copies of than you own, or for two quests of different kinds or servers, and `NOT_FOUND` for a quest that does not exist or, for `sender_quest`, that is not yours.
- `NOT_FOUND` for a proposal that does not exist or that is not yours.
- `BAD_REQUEST` for a `quest` that is not one of your quests, and for a `direction` or a `status` the API does not know.
- An invalid id, quest or date is refused before being sent.
- Proposals belong to the account of the key. Nothing here is cached by default.

## Reference

| Method | Returns |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | a list of `TradeProposal`, by cursor |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |
| `tradeProposals.create({ recipient, sender_quest, recipient_quest, monsters_given, monsters_received }, options?)` | `TradeProposal` |

A `TradeProposal`:

| Field | Type |
| --- | --- |
| `id` | `number` |
| `sender`, `recipient` | `string`, usernames |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null`, with its version of the game |
| `quest_template` | `{ id, quest_type } \| null`, `null` when the quest was deleted |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null`, `null` when it is not visible |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, who confirmed |
| `cancelled_at` | `string \| null` |
| `cancelled_by` | `string \| null`, `null` when it expired |
| `created_at` | `string` |
| `read_at` | `string \| null`, `null` while the recipient has not read it |

A `TradeProposalDetail` is the same, with `owned: number | null` on each monster.
