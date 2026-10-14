---
title: Acting for other players
description: A bot or a website often works for players who each gave it their own API key. This page shows how to use those keys with one client, what they share and what stays separate.
sidebar:
  order: 7
---

```ts
const theirs = metamob.withKey(theirKey);

const account = await theirs.me();
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

## What this is for

An API key acts as its owner: it reads their quests and messages, and writes to their quests. A tool that manages the quests of several players therefore needs the key of each of them, given willingly.

That is the only purpose of what follows. Each key has its own 60 requests a minute, and using several keys to send more requests for yourself is exactly what the limit is there to prevent. See [The rate limit](/basics/rate-limit/).

## A client per player

`withKey()` returns a client that uses another key. It is cheap to create: make one when a player's request comes in, and let it go afterwards.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

The new client shares, with the one it comes from:

- the options: timeout, retries, base URL, headers;
- the cache: reference data fetched for one player serves all the others;
- the listeners: `metamob.on("retry", ...)` hears every client;
- the rate limiter, which keeps one window per key.

It does not share the account. What depends on a key is cached apart for each key, so two players can never see each other's quests.

## A key for one call

For a single call, the key goes in the options, as last argument.

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Finding out whose key it is

A key says nothing about its owner until you ask. `me()` answers with the username, which you need for the public endpoints.

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

It is also how to validate a key when a player submits it:

```ts
async function register(playerKey: string) {
  try {
    const { username } = await metamob.withKey(playerKey).me();
    await db.players.save({ username, key: playerKey });
    return username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined; // not a valid key
    throw error;
  }
}
```

## A client without a key of its own

A service that only ever acts for players does not need a key of its own. Create the client without one and derive from it. Make sure `METAMOB_API_KEY` is not set, or it would be used.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Calling `base` directly then throws `MISSING_API_KEY`, which is what you want: nothing can run without saying for whom.

## Storing keys

A key is a password for a Metamob account.

- Store it encrypted, and never log it. The library keeps it out of URLs, errors and events.
- Ask for it over HTTPS, in a form or a private command, never in a public channel.
- Delete it when the player leaves, and tell them they can revoke it at any time on metamob.fr, in Settings > API key.
- A `401` on a key that used to work means it was revoked: stop using it.

## Reference

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | A client for that key, sharing options, cache, listeners and limiter |
| `{ apiKey }` as last argument | The key for one call |
| `metamob.me()` | The account of the key in use |

## See also

- [Your API key](/start/api-key/)
- [The rate limit](/basics/rate-limit/)
- [Account](/resources/account/)
- [A Discord command with autocomplete](/recipes/discord-command/)
