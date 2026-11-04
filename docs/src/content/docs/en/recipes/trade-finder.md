---
title: A trade finder
description: "A script that finds who can give you a monster, and what you could give them in return."
sidebar:
  order: 3
---

## What you get

A script that takes a monster you are missing, and lists the players who offer it:

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## The script

```ts title="trade.ts"
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const [slug, ...words] = process.argv.slice(2);
const wanted = data.monster(words.join(" "));
if (!slug || !wanted) {
  const close = data.suggest("monster", words.join(" "));
  if (close.length) throw new Error(`Did you mean ${close.join(", ")}?`);
  throw new Error("Usage: node trade.js <slug> <monster>");
}

console.log(`Looking for ${wanted.name.fr}\n`);

let found = 0;
const partners = metamob.quests.matches(slug, { onlyPossibleTrades: true });

for await (const { user, matches, match_score } of partners) {
  const offer = matches.they_have_you_want.find((monster) => monster.id === wanted.id);
  if (!offer) continue;

  const wants = matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(`${user.username} (score ${match_score}, seen ${user.last_active.slice(0, 10)})`);
  console.log(`  has ${offer.available} available`);
  console.log(`  wants from you: ${wants.join(", ")}`);
  console.log(`  ${urls.profile(user)}\n`);

  if (++found === 5) break; // no more pages are requested
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
node --env-file=.env trade.js 21b0a742 bouflet le pueril
```

## How it stays cheap

The monster is looked up in [the data in the package](/basics/embedded-data/), without a request: a typo is caught before anything is sent.

Partners come in pages of 50, and the loop stops at the fifth one found. A common monster therefore costs one request, a rare one a few.

## Checking a partner before writing to them

The public quest of a partner says what else they are looking for:

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const { user, quest } = match;
  const theirs = await metamob.users.quest(user.username, quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Everything you could get in one pass

The other way around: for each monster you are missing, who offers it.

```ts
const sources = new Map<string, string[]>();

const partners = metamob.quests.matches(slug, { onlyPossibleTrades: true });

for await (const page of partners.pages({ limit: 100 })) {
  for (const partner of page.items) {
    for (const monster of partner.matches.they_have_you_want) {
      const players = sources.get(monster.name.fr) ?? [];
      players.push(partner.user.username);
      sources.set(monster.name.fr, players);
    }
  }
}

// The rarest first: those few players offer.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` stops after 100 partners, which is two requests.

## Keeping a monster for a friend

Once a trade is agreed, take the monster out of other trades with a manual setting, then give it back to the computation:

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... the trade happens in game ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```
