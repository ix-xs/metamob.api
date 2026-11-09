---
title: Trade proposals
description: "Read the trade proposals sent and received, and send one."
sidebar:
  order: 8
---

A trade proposal goes from one of your quests to another player. The API lets you read them, apply your side or cancel them, and send them when sending is opened on the account. Each one also appears in the [conversation](/resources/conversations/#trade-proposals) with that player.

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
| `pending` | Nobody applied their side yet |
| `half_applied` | One of the two players applied their side: see `applications` |
| `completed` | Both sides are applied |
| `cancelled` | Cancelled by `cancelled_by`, or expired when `cancelled_by` is `null` |

## Reading one proposal

`tradeProposals.get()` takes an id, or a proposal taken from a list. The answer adds `viewer`, your side of the proposal: your role, whether you applied your side, what leaves your quest (`removed`) and what enters it (`added`).

```ts
const proposal = await metamob.tradeProposals.get(57);

proposal.viewer.role; // "sender" or "recipient"
proposal.viewer.applied; // you applied your side

for (const { monster_id, owned, quantity } of proposal.viewer.added) {
  const name = data.monster(monster_id)?.name.fr;
  console.log(name, `${owned ?? 0} owned, ${quantity} coming`);
}
```

Each monster of `removed` and `added` carries `owned`: the number of copies of it you own now. Once your side is applied, it already includes it. It is `null` when you have no quest of that kind on that server.

`create()`, `apply()` and `cancel()` answer the proposal in the same shape.

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

## Applying a proposal

`tradeProposals.apply()` applies your side of the proposal to your quest: what you give leaves it, what you receive enters it. It works for the sender and for the recipient, and the proposal becomes `completed` once both sides are applied. Unlike sending, it is open to every key:

```ts
const proposal = await metamob.tradeProposals.apply(57);

proposal.status; // "half_applied", or "completed" if the other side already was
proposal.viewer.applied; // true
```

When you lack copies of a monster you give, nothing changes and the API answers `CONFLICT`, with what you own and what is asked. With `allowPartial: true`, the proposal is applied anyway, each quantity reduced to what you own: `viewer.clamped` is then `true`, and `applied_quantity` gives what really moved for each monster. `clamped` is also `true` when a monster you receive would go over the maximum quantity.

```ts
const proposal = await metamob.tradeProposals.apply(57, { allowPartial: true });
const { clamped, removed } = proposal.viewer;

if (clamped) {
  for (const { monster_id, quantity, applied_quantity } of removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // what really moved
  }
}
```

Applying twice, or applying a cancelled proposal, also answers `CONFLICT`. `apply()` is never retried: after a timeout, read the proposal again with `get()` before trying again.

## Cancelling or declining

`tradeProposals.cancel()` cancels a proposal you sent, or declines one you received. It works as long as you have not applied your side, even when the other player applied theirs:

```ts
const proposal = await metamob.tradeProposals.cancel(57);

proposal.status; // "cancelled"
```

A proposal already cancelled, or already applied by you, answers `CONFLICT`. Like `apply()`, `cancel()` is never retried.

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

- `apply()` and `cancel()` answer `NOT_FOUND` for a proposal that does not exist or that you take no part in, and `CONFLICT` for a proposal already cancelled, already applied by you, or whose quest of yours was deleted.
- `create()` refuses before sending a proposal without any monster, a quantity outside 1 to 99, a monster named twice on the same side, or more than 200 monsters on one side.
- The API answers `BAD_REQUEST` for a monster that is not in the quest, for a monster you give more copies of than you own, or for two quests of different kinds or servers, and `NOT_FOUND` for a quest that does not exist or, for `sender_quest`, that is not yours.
- `NOT_FOUND` for a proposal that does not exist or that is not yours.
- `BAD_REQUEST` for a `quest` that is not one of your quests, and for a `direction` or a `status` the API does not know.
- An invalid id, quest or date is refused before being sent.
- Proposals belong to the account of the key. Nothing here is cached by default.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`TradeProposals`](/reference/trade-proposals/) | The trade proposals of the account: the ones you sent and the ones you received, on every quest. |
| [`ApplyProposalOptions`](/reference/apply-proposal-options/) | Options of [`TradeProposals.apply`](/reference/trade-proposals/). |
| [`ConversationProposal`](/reference/conversation-proposal/) | A trade proposal as it appears in a conversation, among the messages. |
| [`NewTradeProposal`](/reference/new-trade-proposal/) | What [`TradeProposals.create`](/reference/trade-proposals/) sends. |
| [`ProposalMonster`](/reference/proposal-monster/) | A quantity of a monster in a trade proposal. |
| [`ProposalMonsterDetail`](/reference/proposal-monster-detail/) | A monster that leaves or enters your quest with a trade proposal, with what you own of it now. |
| [`ProposalQuest`](/reference/proposal-quest/) | The quest of one side of a trade proposal. |
| [`ProposalQuestTemplate`](/reference/proposal-quest-template/) | The quest template of a trade proposal: which kind of quest, in which version of the game. |
| [`ProposalViewer`](/reference/proposal-viewer/) | Your side of a trade proposal. |
| [`TradeProposal`](/reference/trade-proposal/) | A trade proposal between two players. |
| [`TradeProposalDetail`](/reference/trade-proposal-detail/) | A trade proposal read on its own, with your side of it. |
| [`TradeProposalListParams`](/reference/trade-proposal-list-params/) | Filters of [`TradeProposals.list`](/reference/trade-proposals/). |
<!-- exports:end -->
