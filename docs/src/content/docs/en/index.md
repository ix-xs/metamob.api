---
title: Installation
description: "The JavaScript and TypeScript client of the Metamob API: its 43 endpoints, typed, with no dependency at all."
---

```bash
npm install @ix-xs/metamob.api
```

Or `pnpm add`, `yarn add`, `bun add`. The types are included.

| Requirement | |
| --- | --- |
| Node.js | 20 or newer |
| Modules | ES modules and CommonJS |
| Other runtimes | Bun, Deno, browsers, edge platforms: see [Runtimes](/help/runtimes/) |
| API key | A Metamob key, see [Your API key](/start/api-key/) |

## First call

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const quests = await metamob.quests.list();
const needed = await metamob.quests.monsters(quests[0]!.slug, { status: "needed" }).count();
```

In CommonJS:

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

Without `apiKey`, the client reads the environment variable `METAMOB_API_KEY`. [Configuration](/basics/configuration/) lists all its options.

## What the client takes care of

| | |
| --- | --- |
| Types | Every answer of the API is typed: see the [reference](/reference/) |
| Names | Monsters, zones and servers by their name, in the five languages of the site: [Names and ids](/basics/names-and-ids/) |
| Lists | Offset or cursor pagination, walked with `for await`: [Lists](/basics/lists/) |
| The rate limit | 60 requests a minute per key, calls over it wait their turn: [The rate limit](/basics/rate-limit/) |
| Errors | One stable `code` per case, and retries for passing errors: [Errors](/basics/errors/) |
| Caching | Reference data kept in memory, a replaceable store: [Caching](/basics/caching/) |
| Game data | Monsters, zones and servers included, searchable without a request: [The data in the package](/basics/embedded-data/) |

## Metamob

Everything rests on [Metamob](https://www.metamob.fr), the site of archmonster hunters, and on its API. This package only calls it: the [official API documentation](https://www.metamob.fr/help/api) remains the reference.
