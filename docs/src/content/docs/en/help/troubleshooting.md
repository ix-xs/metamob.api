---
title: Troubleshooting
description: "The most common problems, what they mean and how to fix them."
---

## MISSING_API_KEY

No key reached the client. Check, in this order:

- The `METAMOB_API_KEY` environment variable is set in the process that runs your code. Node.js does not read a `.env` file on its own: start with `node --env-file=.env app.mjs`, or load it with your framework.
- You passed `apiKey` and it is not `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` with a misspelled variable is the usual cause.
- On an edge platform there may be no environment variable: pass the key yourself, see [Runtimes](/help/runtimes/#the-api-key).

## UNAUTHORIZED

The API does not accept the key: badly copied, or revoked because a new one was created. Generate one on metamob.fr, in Settings > API key, and check it with `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND on one of my quests

The API answers 404 for what is not yours, as for what does not exist.

- The slug belongs to a quest of another account. `quests.list()` gives the slugs of the key in use.
- You are using the key of another player with your slug, or the reverse. With [`withKey()`](/basics/many-keys/), slugs go with their key.
- With `users.quest()`, the quest is hidden from the public profile. Its owner still reads it with `quests.monsters()`.

## UNKNOWN_NAME for a name that exists

- Check the spelling with `error.suggestions`. Accents and case are forgiven, a missing or extra letter is not.
- The name may be newer than your version of the package. The library then looks for it in the API, except for a subzone given alone, which the API only looks for inside a zone: pass `{ zone }`, see [Zones](/resources/zones/#subzones).
- Update the package: each release includes the current names.

## The wrong monster for a shared name

Six pairs of monsters, mostly archmonsters, share a name in at least one language, across two versions of the game. `monsters.get("Crognan le Barbare")` returns the one whose quest template has the lowest id. Add `{ gameVersion }`, or use the id. Writes to a quest are not affected: they take the monster of that quest. See [Names and ids](/basics/names-and-ids/#monsters-that-share-a-name).

## My script is slow

It is probably waiting because of the limit of 60 requests a minute. The `rateLimit` event confirms it:

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

To send fewer requests: one `setMonsters()` rather than several `setMonster()`, `count()` rather than counting pages, [`data`](/basics/embedded-data/) rather than the reference calls. See [The rate limit](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED although the limiter is on

The client only counts its own requests. The key is probably also used elsewhere: another process, another instance of the server, a second client in the same program. Share a single client, or lower the limit of each with `rateLimit: { requests: 30 }`.

## A value I just wrote reads back unchanged

Reads tied to the account are only cached if you asked for it. With a freshness for `quests.get` or `quests.monsters` in `cache.methods`, a write made with the same client empties the cache, but not a write made elsewhere, on the site for example. Pass `{ cache: false }` on the read, or shorten the freshness.

## setMonster did not add one

It sets the quantity, it does not add to it. Read, then write:

```ts
const tofu = data.monster("Tofu Maléfique");
const monsters = await metamob.quests.monsters(slug).all();
const owned = monsters.find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT or NETWORK

The request did not get through, even after 3 retries. Check the connection of the machine, then that metamob.fr answers. Behind a proxy, give the client a `fetch` that uses it, see [Configuration](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

The API failed on its side, and reads were already retried. If it lasts, the site may be under maintenance: wait rather than loop.

A message or a proposal is not retried: after a `SERVER_ERROR`, look at the conversation or at `tradeProposals.list()` before sending it again, it may have gone through.

## It works on my server and fails in the browser

A page can only call an API that allows its origin. Call Metamob from your server, and have the page call your server: the key also stays out of the page. See [Runtimes](/help/runtimes/#browsers).

## require() returns something without Metamob

Version 5 has named exports. `const MetamobAPI = require("@ix-xs/metamob.api")` becomes `const { Metamob } = require("@ix-xs/metamob.api")`. See [Coming from version 4](/help/migrating-from-v4/).

## Still stuck

Open an issue on [GitHub](https://github.com/ix-xs/metamob.api/issues) with the version of the package, your runtime, `error.code` and the smallest code that shows the problem. Remove your API key from anything you paste.
