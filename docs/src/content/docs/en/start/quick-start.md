---
title: Quick start
description: Install the package, get your API key, then read your quests, find what one of them still needs and record a monster you just caught.
---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

## Install

```bash
npm install @ix-xs/metamob.api
```

It needs Node.js 20 or newer and has no dependency. For Bun, Deno, browsers and edge runtimes, see [Runtimes](/reference/runtimes/).

Both module systems work:

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Get your API key

Every call needs a key. Create yours on [metamob.fr](https://www.metamob.fr), in **Settings > API key**.

Keep the key out of your code. Put it in an environment variable named `METAMOB_API_KEY`: the client reads it when you pass no `apiKey`.

```ts
const metamob = new Metamob(); // uses process.env.METAMOB_API_KEY
```

[Your API key](/start/api-key/) says what a key gives access to and how to store it.

## Read your quests

A quest is known by its slug, the short identifier in the address of its page. `quests.list()` gives the slugs of the account.

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Find what a quest still needs

A list can be awaited for one page, or walked to the end with `for await`. Pages are fetched as you go.

```ts
for await (const monster of metamob.quests.monsters(slug, { status: "needed" })) {
  console.log(`step ${monster.step}: ${monster.name.fr} (${monster.quantity} owned)`);
}

// Only the number, in one small request.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

[Lists](/basics/lists/) covers pages, limits and counting.

## Record a monster

A monster is designated by its name in French, English or Spanish, by its id, or by an object that has its id. Accents and case do not matter.

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
console.log(result.status); // owned minus parallel quests: 0 means "enough"
```

A name with a typo is not sent to your quest. The call throws, and the error lists the closest names:

```ts
try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Names and ids](/basics/names-and-ids/) explains what is accepted, and [Errors](/basics/errors/) what can be thrown.

## Look something up without a request

The monsters, zones and servers ship with the package. `data` answers from memory, which is what an autocomplete needs.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Mind the rate limit

Metamob allows 60 requests a minute per key. The client counts them and makes the next call wait instead of failing, so nothing has to be done. [The rate limit](/basics/rate-limit/) shows how to watch it.

## See also

- [Your quests](/resources/quests/)
- [Trading](/resources/trading/)
- [The data in the package](/basics/embedded-data/)
- [Coming from version 4](/start/migrating-from-v4/)
