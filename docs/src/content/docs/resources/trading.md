---
title: Trading
description: Find the players who have what one of your quests needs and want what it has in spare, and decide monster by monster how many you offer and look for.
sidebar:
  order: 3
---

```ts
const page = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

for (const match of page.items) {
  const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
  const wants = match.matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(match.user.username, { gives, wants });
}
```

## How a quest trades

For each monster, a quest offers some and looks for some. By default the site calculates both from what you own and from `parallel_quests`: spares are offered, what is missing is wanted. Three settings bend that calculation:

1. The trade mode of the quest. In expert mode, two thresholds say from which quantity a monster is offered and up to which it is wanted.
2. The filters by kind: never offer, or never look for, monsters, bosses or archmonsters.
3. A manual override on one monster, which wins over the rest.

The first two are settings of the quest, changed with [`quests.update()`](/resources/quests/#changing-settings). The third is below. What comes out of all three is what other players see: `want` and `offer` on each monster.

## Finding partners

`quests.matches()` ranks the players you could trade with, like the "Best matching" order of the Community page of the site: same server, same kind of quest, active in the last two months.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Each match lists the monsters both ways, with quantities:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available, you need ${monster.needed}`);
  if (monster.covers_need) console.log("  covers everything you need");
}
```

Two filters:

```ts
// Only partners with whom something can go both ways.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Only partners doing at least two quests in parallel.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

It is a [list](/basics/lists/), 50 partners per page at most.

## Who has one monster

To look for a single monster rather than the best overall partner, filter the matches yourself:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  if (match.matches.they_have_you_want.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Looking at someone's quest

Once you have a partner, their quest is public. `status` narrows it to what they offer or what they look for.

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();
```

See [Other players](/resources/users/).

## Overriding one monster

`setTrade` forces how many of a monster the quest offers, looks for, or both.

```ts
// Offer a single one, however many spares there are.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// Offer none: keep them all.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Look for two, whatever the calculation says.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // what the quest now looks for
```

`null` is not 0. `0` forces "none". `null` removes the override and hands the value back to the calculation.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Both at once.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

A field you leave out is not touched.

## Seeing your overrides

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, { offer: monster.trade_offer, want: monster.trade_want });
}
```

`trade_offer` and `trade_want` are the overrides, `null` when there is none. `offer` and `want` are the result.

## Proposals

A trade proposal between two players is made on the site. The API shows the ones you sent and received, inside your [conversations](/resources/conversations/#trade-proposals), but does not create or confirm them.

## Limits and errors

- `trade_offer` goes from 0 to the quantity you own, `trade_want` from 0 to 30. Outside, the API answers `BAD_REQUEST`.
- `NOT_FOUND` for a quest that is not yours.
- An empty override, with neither field, is refused before being sent.

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
| `match_score` | How many different monsters you can give, plus how many you can receive |

Each monster of a match has `id`, `name`, `available`, `needed` and `covers_need`.

## See also

- [Your quests](/resources/quests/)
- [Other players](/resources/users/)
- [Conversations](/resources/conversations/)
- [A trade finder](/recipes/trade-finder/)
