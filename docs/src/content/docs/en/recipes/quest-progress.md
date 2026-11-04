---
title: A progress report
description: "A script that prints where a quest stands and which zones to hunt in next, in three requests."
sidebar:
  order: 2
---

## What you get

A script that prints the progress of a quest and the zones where the most monsters are missing:

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 64 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## The script

```ts title="progress.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 request: the quest itself.
const quest = await metamob.quests.get(slug);
const steps = quest.quest_template.step_count;
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${steps}`);

// 1 request: how many monsters are still missing.
const total = quest.quest_template.monster_count;
const needed = metamob.quests.monsters(slug, { status: "needed" });
const missing = (await needed.count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 request: everything, by zone.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // A monster is in each subzone it lives in: a Set counts it once.
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
  const count = String(names.length).padStart(3);
  console.log(`  ${zone.padEnd(24)} ${count} missing   ${shown}`);
}
```

Run it with the slug of a quest, or with no argument for the first quest of the account:

```bash
node --env-file=.env progress.js 21b0a742
```

## Why three requests

- `count()` only asks for the total, not the list of monsters.
- `quests.zones()` returns the whole quest in one answer, already grouped by zone.
- The names of zones and monsters are in the answers.

Listing every monster and grouping them yourself would work too, with more requests: 600 monsters make three pages of 200.

## Only archmonsters, only one zone

`quests.zones()` accepts filters, which make the answer smaller:

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## What you can trade away

The same quest, on the trading side: what you own in excess, and what the quest offers of it once your settings are applied:

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}, keeps ${kept}`);
}
```

## For someone else

With the key a player gave you, the same script runs on their behalf:

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Without their key, [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest) still shows what a public quest is looking for.
