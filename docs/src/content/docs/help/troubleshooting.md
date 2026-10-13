---
title: Troubleshooting
description: The problems that come up most, each with what it means and how to fix it. Start from the error code or from what you see.
---

## MISSING_API_KEY

No key reached the client. Check, in this order:

- The `METAMOB_API_KEY` environment variable is set in the process that runs your code. A `.env` file is not read by Node.js on its own: start with `node --env-file=.env app.mjs`, or load it with your framework.
- You passed `apiKey` and it is not `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` with a misspelled variable is the usual cause.
- On an edge platform there may be no environment variable: pass the key yourself, see [Runtimes](/reference/runtimes/#the-api-key).

## UNAUTHORIZED

The API does not accept the key. It was mistyped, cut when copied, or revoked because a new one was created. Create a key again on metamob.fr, in Settings > API key, and check it with `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND on one of my quests

The API answers 404 for what is not yours, exactly as for what does not exist.

- The slug belongs to a quest of another account. `quests.list()` gives the slugs of the key in use.
- You are using the key of another player with your slug, or the reverse. With [`withKey()`](/basics/many-keys/), slugs go with their key.
- Through `users.quest()`, the quest is hidden from the public profile. Its owner still reads it with `quests.monsters()`.

## UNKNOWN_NAME for a name that exists

- Check the spelling against `error.suggestions`. Accents and case are forgiven, a missing or extra letter is not.
- The monster may be newer than your version of the package. The library then asks the API, which works for everything but a subzone given alone: the API only looks subzones up inside a zone. Pass `{ zone }`, see [Zones](/resources/zones/#subzones).
- Update the package: each release ships the current names.

## The wrong monster for a shared name

Ten archmonsters have the same name in two versions of the game. `monsters.get("Crognan le Barbare")` returns the one whose quest template has the lowest id. Add `{ gameVersion }`, or use the id. Writes to a quest are not affected: they pick the monster of that quest. See [Names and ids](/basics/names-and-ids/#monsters-that-share-a-name).

## My script is slow

It is waiting for the rate limit: 60 requests a minute. Listen to the `rateLimit` event to confirm it.

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Then spend fewer requests: one `setMonsters()` instead of many `setMonster()`, `count()` instead of counting pages, [`data`](/basics/embedded-data/) instead of reference calls. See [The rate limit](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED although the limiter is on

The limiter counts what this client sends. The key is also used elsewhere: another process, another instance of your server, a second client created in the same program. Create one client and share it, or lower the limit of each with `rateLimit: { requests: 30 }`.

## A value I just wrote reads back unchanged

Reads tied to the account are not cached unless you asked. If you gave `quests.get` or `quests.monsters` a freshness in `cache.methods`, a write made with the same client clears it, but a write made elsewhere, on the site for instance, does not. Pass `{ cache: false }` on the read, or shorten the freshness.

## setMonster did not add one

It sets the quantity, it does not add to it. Read, then write:

```ts
const tofu = data.monster("Tofu Maléfique");
const owned = (await metamob.quests.monsters(slug).all()).find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT or NETWORK

The request did not get through, after 3 retries. Check the connection of the machine, then whether metamob.fr itself answers. Behind a proxy, give the client a `fetch` that uses it, see [Configuration](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

The API failed on its side. Reads were retried. If it lasts, the site may be under maintenance: wait rather than loop.

## It works on my server and fails in the browser

A page may only call an API that allows its origin. Call Metamob from your server and have the page talk to your server. It also keeps the key out of the page. See [Runtimes](/reference/runtimes/#browsers).

## require() returns something without Metamob

Version 5 has named exports. `const MetamobAPI = require("@ix-xs/metamob.api")` is now `const { Metamob } = require("@ix-xs/metamob.api")`. See [Coming from version 4](/start/migrating-from-v4/).

## Still stuck

Open an issue on [GitHub](https://github.com/ix-xs/metamob.api/issues) with the version of the package, your runtime, `error.code` and the smallest code that shows the problem. Remove your API key from anything you paste.

## See also

- [Error codes](/reference/errors/)
- [Errors](/basics/errors/)
- [FAQ](/help/faq/)
- [Runtimes](/reference/runtimes/)
