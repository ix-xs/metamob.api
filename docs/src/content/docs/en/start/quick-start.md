---
title: Quick start
description: "Install the package, create a client and make your first calls: read your quests, see what they still need and record a monster."
---

## Install

```bash
npm install @ix-xs/metamob.api
```

It needs Node.js 20 or newer. The package has no dependency, and can be imported with both module systems:

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Create the client

Every call to the API needs a key. Create yours on [metamob.fr](https://www.metamob.fr), in **Settings > API key**, then put it in the `METAMOB_API_KEY` environment variable:

```bash title=".env"
METAMOB_API_KEY=your-key
```

The client reads this variable when you pass it no key:

```ts title="index.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

:::note
Node.js does not read `.env` files on its own: run the script with `node --env-file=.env index.js`, or pass the key with `new Metamob({ apiKey })`. [Your API key](/start/api-key/) gives the details.
:::

## Read your quests

A quest is designated by its slug, the short identifier at the end of the address of its page. `quests.list()` returns the quests of the account, with their slug:

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Find what a quest still needs

`quests.monsters()` lists the monsters of a quest. With `status: "needed"`, it keeps only those still missing:

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  console.log(`step ${monster.step}: ${monster.name.fr}`);
}

const left = await needed.count();
```

`for await` walks every page of the list, one request per page. `count()` only asks for the total. [Lists](/basics/lists/) explains the other ways to read a list.

## Record a monster

`quests.setMonster()` sets the number of copies you own. The monster can be given by its id or by its name, in French, English or Spanish:

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
```

If the name matches no monster, the call throws an `UNKNOWN_NAME` error that suggests the closest names, and nothing is sent:

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Names and ids](/basics/names-and-ids/) details what is accepted, and [Errors](/basics/errors/) what can be thrown.

## Look something up without a request

The monsters, zones and servers are included in the package. `data` searches them directly, without calling the API:

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Mind the rate limit

Metamob accepts 60 requests a minute per key. The client counts them: beyond that, it makes the next calls wait instead of sending them. [The rate limit](/basics/rate-limit/) shows how to follow where you stand.
