---
title: Acting for other players
description: "Using the keys players gave you, with one client."
sidebar:
  order: 7
---

## What this is for

An API key acts on behalf of its owner: it reads their quests and messages, and writes to their quests. A bot or a website that manages the quests of several players therefore needs the key of each of them, given willingly.

That is the only intended use. Each key has its own 60 requests a minute: using several keys to send more requests for yourself amounts to getting around the limit. See [The rate limit](/basics/rate-limit/).

## A client per player

`withKey()` returns a client that uses another key. It is light: create one on each request from a player.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

It shares with the client it comes from:

- the options: timeout, retries, base URL, headers;
- the cache of reference data;
- the listeners: `metamob.on("retry", ...)` hears every client;
- the rate limiter, which counts each key apart.

What depends on the account is cached apart for each key: a player never sees the quests of another.

## A key for one call

For a single call, the key goes in the options, as last argument:

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Finding out whose key it is

`me()` gives the username of the owner of the key, which is useful for the public endpoints:

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

It is also how to validate a key when a player provides it:

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

A service that only acts for players does not need a key of its own. Create the client without a key, then derive one per player from it. `METAMOB_API_KEY` must not be set, or it would be used.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

A call made directly with `base` then throws `MISSING_API_KEY`.

## Storing keys

A key is a password for a Metamob account.

- Store it encrypted, and never write it to a log. The library keeps it out of URLs, errors and events.
- Ask for it over HTTPS, in a form or a private command, never in a public channel.
- Delete it when the player leaves, and tell them they can revoke it at any time on metamob.fr, in Settings > API key.
- A `401` on a key that used to work means it was revoked: stop using it.

## Reference

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | A client for that key, sharing options, cache, listeners and limiter |
| `{ apiKey }` as last argument | The key for one call |
| `metamob.me()` | The account of the key in use |
