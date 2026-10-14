---
title: A progress report
description: A script that prints where one of your quests stands, what is left to find in each zone, and which zone to hunt in next. Three requests, whatever the size of the quest.
sidebar:
  order: 2
---

## What you get

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 64 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## The script

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 request: the quest itself.
const quest = await metamob.quests.get(slug);
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${quest.quest_template.step_count}`);

// 1 request: how many monsters are still missing.
const total = quest.quest_template.monster_count;
const missing = (await metamob.quests.monsters(slug, { status: "needed" }).count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 request: everything by zone.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // A monster shows up in each subzone it lives in: count it once per zone.
    const names = new Set();
    for (const subzone of zone.subzones) {
      for (const monster of subzone.monsters) {
        if (monster.status === "incomplete") names.add(monster.name.fr);
      }
    }
    return { zone: zone.name.fr, names: [...names] };
  })
  .filter((entry) => entry.names.length > 0)
  .sort((a, b) => b.names.length - a.names.length);

console.log("Hunt next:");
for (const { zone, names } of report.slice(0, 5)) {
  const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
  console.log(`  ${zone.padEnd(24)} ${String(names.length).padStart(3)} missing   ${shown}`);
}
```

Run it with the slug of a quest, or with nothing to take the first quest of the account:

```bash
METAMOB_API_KEY=your-key node progress.mjs 21b0a742
```

## Why three requests

- `count()` asks for one item and reads the total, instead of paging through hundreds of monsters to count them.
- `quests.zones()` answers the whole quest at once, already grouped.
- The names of zones and monsters come back in the answers. Nothing has to be looked up.

Listing every monster and grouping them yourself would work too, in more requests: a quest of 600 monsters is three pages of 200.

## Only archmonsters, only one zone

`quests.zones()` filters on the server side, which makes the answer smaller.

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## What you can trade away

The same quest, seen from the other side: what you own in excess, and what the quest really offers after your trade settings.

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}`, kept > 0 ? `(keeps ${kept} back)` : "");
}
```

## For someone else

With the key of a player who gave it to you, the same script runs as them:

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Without their key, a public quest still shows what its owner looks for, through [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest).

## See also

- [Your quests](/resources/quests/)
- [Lists](/basics/lists/)
- [Trading](/resources/trading/)
- [The rate limit](/basics/rate-limit/)
