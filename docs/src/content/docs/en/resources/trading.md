---
title: Trading
description: "Find trade partners for a quest, and set monster by monster what it offers and looks for."
sidebar:
  order: 3
---

## How a quest trades

For each monster, a quest offers some copies and looks for some. By default, the site computes both from what you own and from `parallel_quests`: spare copies are offered, what is missing is looked for. Three settings change this computation:

1. The trade mode of the quest. In expert mode, two thresholds say from which quantity a monster is offered and up to which quantity it is looked for.
2. The filters by kind: never offer, or never look for, monsters, bosses or archmonsters.
3. A manual setting on one monster, which wins over everything else.

The first two are changed with [`quests.update()`](/resources/quests/#changing-settings), the third is described below. The result is what other players see: `want` and `offer` on each monster.

## Finding partners

`quests.matches()` ranks the players you could trade with, like the "Best matching" option of the Community page of the site: same server, same kind of quest, active in the last two months. Balanced trades, with as many monsters each way, come first. The API looks at the 500 most recently active players at most.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Each match lists the monsters both ways, with the quantities:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available`);
  console.log(`you need ${monster.needed}`, monster.covers_need ? "(covered)" : "");
}
```

Two filters narrow the list:

```ts
// A trade possible both ways.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// At least two quests done in parallel.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

It is a [list](/basics/lists/), of 50 partners per page at most.

## Who has one monster

For a single monster, filter the partners yourself:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  const offers = match.matches.they_have_you_want;
  if (offers.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Looking at someone's quest

The quest of a partner is public. `status` narrows it to what they offer or what they look for:

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted" }).all();
```

See [Other players](/resources/users/).

## Overriding one monster

`setTrade` forces the number of copies of a monster the quest offers, looks for, or both:

```ts
// Offer a single one, however many spare copies there are.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// Offer none: keep them all.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Look for two, whatever the computation gives.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // what the quest now looks for
```

`0` and `null` do not mean the same thing: `0` forces "none", `null` removes the manual setting and gives the value back to the computation.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Both at once.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

A field you leave out is not touched.

## Seeing your overrides

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, monster.trade_offer, monster.trade_want);
}
```

`trade_offer` and `trade_want` are the manual settings, `null` when there is none. `offer` and `want` are the result.

## Proposals

The proposals sent and received are read with [`tradeProposals.list()`](/resources/trade-proposals/), and also appear in your [conversations](/resources/conversations/#trade-proposals). [`tradeProposals.create()`](/resources/trade-proposals/#making-a-proposal) sends one, when sending is opened on the account. `apply()` applies your side, and `cancel()` cancels or declines it.

## Limits and errors

- `trade_offer` goes from 0 to the quantity you own. Beyond, the API answers `BAD_REQUEST`.
- `trade_want` starts at 0. Keep it within what a quest can need: the API does not refuse a large value.
- `NOT_FOUND` for a quest that is not yours.
- An empty manual setting, with neither field, is refused before being sent.

## Reference

| Method | Returns |
| --- | --- |
| `quests.matches(slug, { minParallelQuests, onlyPossibleTrades, limit, offset }, options?)` | a list of `TradeMatch` |
| `quests.setTrade(slug, monster, { trade_offer, trade_want }, options?)` | `TradeOverrideResult` |
| `quests.resetTrade(slug, monster, options?)` | `TradeOverrideResult` |

A `TradeMatch`:

| Field | Meaning |
| --- | --- |
| `user` | `username`, `avatar`, `last_active` |
| `quest` | `slug`, `character_name`, `parallel_quests` of their quest |
| `matches.they_have_you_want` | What they can give you |
| `matches.you_have_they_want` | What you can give them |
| `match_score` | The number of different monsters you can give, plus those you can receive. The ranking favours balance, not this sum |

Each monster of a match has `id`, `name`, `available`, `needed` and `covers_need`.
