<div align="center">

# @ix-xs/metamob.api

A JavaScript and TypeScript client for the [Metamob](https://www.metamob.fr) API.

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentation](https://ix-xs.github.io/metamob.api/en/)** ·
[Français](./README.md) ·
[Español](./README.es.md) ·
[Changelog](./CHANGELOG.md)

</div>

## Installation

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 or newer. It also runs on Bun, Deno, in a browser and on edge platforms. The package has no dependency.

## Example

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const [quest] = await metamob.quests.list();

if (quest) {
  // The monsters the quest still needs.
  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  // Record a monster, by its name or its id.
  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
}
```

The API key is created on metamob.fr, in **Settings > API key**.

## What the package covers

- **The 42 endpoints of the API**, typed: account, quests, trade partners, trade proposals, private messages, monsters, zones, players, Kralamoure events and reference data.
- **Names**: a monster, a zone, a server or a kind of monster is given by its id or by its name, in French, English or Spanish. An unknown name throws an error that suggests the closest names.
- **Lists**: a paginated method is awaited for one page, or walked with `for await`.
- **The rate limit**: the client counts the 60 requests a minute per key, and makes the next calls wait.
- **Retries** after a 429, a server error or a network failure. Sending a message or a proposal is never retried.
- **A cache** for reference data, which can be tuned or turned off.
- **`data`**: the monsters, zones, servers and quest templates included in the package, to search without a request.
- **`withKey()`**: act with another player's key, for a bot or a site that serves several players.

```ts
import { data, isMetamobError } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 5 }); // no request

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
}
```

## Documentation

The full guide is at **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/en/)**, in English, [French](https://ix-xs.github.io/metamob.api/) and [Spanish](https://ix-xs.github.io/metamob.api/es/):

- [Quick start](https://ix-xs.github.io/metamob.api/en/start/quick-start/)
- [Every method](https://ix-xs.github.io/metamob.api/en/reference/methods/)
- [Examples](https://ix-xs.github.io/metamob.api/en/recipes/discord-command/): a Discord command, a progress report, a trade finder
- [Coming from version 4](https://ix-xs.github.io/metamob.api/en/start/migrating-from-v4/)

## Metamob

[Metamob](https://www.metamob.fr) is the site where Dofus players track their archmonster quests and find someone to trade with. The site, its data and its API are its own work: this library only calls it. The [official API documentation](https://www.metamob.fr/help/api) remains the reference.

## License

[MIT](./LICENSE). An independent project, not affiliated with Metamob or Ankama. Dofus is a trademark of Ankama Games. The data included in the package comes from the Metamob API; using the API means following [its rules](https://www.metamob.fr/help/api), starting with the rate limit.
