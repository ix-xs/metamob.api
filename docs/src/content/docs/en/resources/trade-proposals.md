---
title: Trade proposals
description: Follow the trade proposals you sent and received on every quest, filter them by direction, state, quest or date, and see what you own of each monster before answering.
sidebar:
  order: 8
---

```ts
const waiting = await metamob.tradeProposals.list({ direction: "received", status: "pending" }).all();

for (const proposal of waiting) {
  console.log(`${proposal.sender} proposes a trade on ${proposal.server?.name}`);
}
```

A trade proposal is made on the site, from a quest, to another player. The API reads them: it does not create, confirm or cancel any. Each one also appears in the [conversation](/resources/conversations/#trade-proposals) with that player.

## Listing proposals

`tradeProposals.list()` gives the proposals of the account, the most recent first. It is a [list](/basics/lists/), 50 per page at most, paged with a cursor like messages.

```ts
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const onQuest = await metamob.tradeProposals.list({ quest: slug, status: "completed" }).all();
```

| Filter | Values |
| --- | --- |
| `direction` | `"received"`: made to you. `"sent"`: made by you. `"all"`, the default: both |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"` |
| `quest` | The slug of one of your quests |
| `since` | A `Date`, or an ISO 8601 date with its time zone such as `"2026-01-27T14:00:00Z"`: only the proposals created from then on, included |

A date without time zone, or one the API would not read, is refused before any request.

## Who gives what

`monsters_given` is what the sender gives, `monsters_received` what the sender receives. When you are the recipient, read it the other way round: you receive `monsters_given` and give `monsters_received`.

```ts
const me = await metamob.me();

for await (const proposal of metamob.tradeProposals.list({ status: "pending" })) {
  const mine = proposal.recipient === me.username;
  const incoming = mine ? proposal.monsters_given : proposal.monsters_received;
  console.log(proposal.id, incoming.map((monster) => `${monster.quantity} x ${data.monster(monster.monster_id)?.name.fr}`));
}
```

A proposal names its monsters by id: [`data.monster()`](/basics/embedded-data/) turns an id into a monster without a request.

| `status` | Meaning |
| --- | --- |
| `pending` | Nobody confirmed yet |
| `half_applied` | One side confirmed: see `applications` |
| `completed` | Both sides confirmed |
| `cancelled` | Cancelled by `cancelled_by`, or expired when `cancelled_by` is `null` |

## Reading one proposal

`tradeProposals.get()` takes an id, or a proposal from a list. Read on its own, each monster comes with `owned`: how many of it you own now, in your quest the proposal is about.

```ts
const proposal = await metamob.tradeProposals.get(57);

for (const monster of proposal.monsters_given) {
  console.log(data.monster(monster.monster_id)?.name.fr, `${monster.owned ?? 0} owned, ${monster.quantity} in the proposal`);
}
```

`owned` is the count of now, not of the day the proposal was made: once the trade is applied, it already includes it. It is `null` when you have no quest of that kind on that server.

## Watching for new proposals

Asked every few minutes with `since`, the list tells you what arrived in between, for a bot that warns you for instance.

```ts
let lastCheck = new Date();

setInterval(async () => {
  const now = new Date();
  const fresh = await metamob.tradeProposals.list({ direction: "received", since: lastCheck }).all();
  lastCheck = now;
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` stays `null` until the recipient opens the proposal on the site.

## Limits and errors

- The API does not create, confirm or cancel proposals.
- `NOT_FOUND` for a proposal that does not exist or is not yours.
- An invalid id, quest or date is refused before being sent.
- Proposals belong to the account of the key. Nothing here is cached by default.

## Reference

| Method | Returns |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | a list of `TradeProposal`, by cursor |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |

A `TradeProposal`:

| Field | Type |
| --- | --- |
| `id` | `number` |
| `sender`, `recipient` | `string`, usernames |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null`, with its game version |
| `quest_template` | `{ id, quest_type } \| null`, `null` when the quest was deleted |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null`, `null` when it is not visible |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, who confirmed |
| `cancelled_at` | `string \| null` |
| `cancelled_by` | `string \| null`, `null` when it expired |
| `created_at` | `string` |
| `read_at` | `string \| null`, `null` while the recipient has not read it |

A `TradeProposalDetail` is the same, with `owned: number | null` on each monster.

## See also

- [Conversations](/resources/conversations/)
- [Trading](/resources/trading/)
- [Lists](/basics/lists/)
- [The data in the package](/basics/embedded-data/)
