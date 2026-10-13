---
title: A trade finder
description: A script that finds who can give you a monster you are missing, and what you could give them in return, ready to paste in a message.
sidebar:
  order: 3
---

## What you get

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## The script

```ts
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const [slug, ...words] = process.argv.slice(2);
const wanted = data.monster(words.join(" "));
if (!slug || !wanted) {
  const close = data.suggest("monster", words.join(" "));
  throw new Error(close.length ? `Did you mean ${close.join(", ")}?` : "Usage: node trade.mjs <slug> <monster>");
}

console.log(`Looking for ${wanted.name.fr}\n`);

let found = 0;
// Partners with whom something can go both ways, best match first.
for await (const match of metamob.quests.matches(slug, { onlyPossibleTrades: true })) {
  const offer = match.matches.they_have_you_want.find((monster) => monster.id === wanted.id);
  if (!offer) continue;

  console.log(`${match.user.username} (score ${match.match_score}, seen ${match.user.last_active.slice(0, 10)})`);
  console.log(`  has ${offer.available} available`);
  console.log(`  wants from you: ${match.matches.you_have_they_want.map((monster) => monster.name.fr).join(", ")}`);
  console.log(`  ${urls.profile(match.user)}\n`);

  // Leaving the loop stops the requests: only the pages that were read were fetched.
  if (++found === 5) break;
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
METAMOB_API_KEY=your-key node trade.mjs 21b0a742 bouflet le pueril
```

## How it stays cheap

The monster is found in [the data in the package](/basics/embedded-data/), with no request, and a typo is caught before anything is sent.

Matches come 50 per page. The loop reads them in order and stops at the fifth partner, so a common monster costs one request and a rare one a few. Without the `break`, every page would be read.

## Checking a partner before writing to them

A match says what a player offers today. Their public quest says the rest: how many they own, and what else they look for.

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const theirs = await metamob.users.quest(match.user.username, match.quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Everything you could get in one pass

Turn the question around: for each monster you miss, who has it.

```ts
const sources = new Map<string, string[]>();

for await (const match of metamob.quests.matches(slug, { onlyPossibleTrades: true }).pages({ limit: 100 })) {
  for (const partner of match.items) {
    for (const monster of partner.matches.they_have_you_want) {
      const players = sources.get(monster.name.fr) ?? [];
      players.push(partner.user.username);
      sources.set(monster.name.fr, players);
    }
  }
}

// The rarest first: the monsters only one or two players offer.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` stops after the pages that hold 100 partners: two requests.

## Keeping a monster for a friend

Once a trade is agreed, keep the monster out of other trades with an override, and release it afterwards.

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... the trade happens in game ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```

## See also

- [Trading](/resources/trading/)
- [Other players](/resources/users/)
- [Lists](/basics/lists/)
- [Conversations](/resources/conversations/)
