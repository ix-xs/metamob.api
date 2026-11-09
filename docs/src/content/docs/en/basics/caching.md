---
title: Caching
description: "What is cached, for how long, and how to tune it."
sidebar:
  order: 5
---

## What is cached by default

Only reference data: game versions, servers, kinds of monsters, kinds of quests, quest templates, monsters, zones and subzones. It only changes with the game. An answer is kept for 10 minutes in memory, and shared by every key, since it is the same for everyone.

The rest (profiles, quests, matches, conversations, trade proposals, Kralamoure events) is read from the API on every call.

Two identical reads sent at the same moment always share one request, with or without a cache.

## Caching more

`ttl` changes the freshness of reference data, and `methods` gives a freshness to any method, by its name as listed in [Every method](/resources/methods/):

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h",
    methods: {
      "users.get": "1m",
      "quests.matches": "5m",
      "monsters.get": "1d",
      "zones.list": false, // never cached
    },
  },
});
```

What depends on the account is kept apart for each key: a player never sees the answers of another. The entries of a key are dropped as soon as that key writes something, so a read after a write is up to date.

## For one call

```ts
// Skip the cache for this call.
const fresh = await metamob.servers.list({ cache: false });

// Keep this answer for five minutes, whatever the client says.
const profile = await metamob.users.get(username, { cache: "5m" });
```

## Emptying it

```ts
await metamob.clearCache();
```

## Turning it off

```ts
const metamob = new Metamob({ cache: false });
```

## A cache that outlives the process

By default, the cache lives in memory and holds 500 entries. To share it between several processes, give it a store: an object with `get` and `set`, which can be asynchronous, and optionally `delete` and `clear`. For example with Redis:

```ts
import type { CacheEntry, CacheStore } from "@ix-xs/metamob.api";

const store: CacheStore = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : undefined;
  },
  async set(key, entry) {
    const seconds = Math.ceil((entry.expires - Date.now()) / 1000);
    if (seconds > 0) await redis.set(key, JSON.stringify(entry), "EX", seconds);
  },
  async delete(key) {
    await redis.del(key);
  },
};

const metamob = new Metamob({ cache: { store } });
```

The keys of the store never contain an API key, only a digest of it. If the store fails, the call goes on without the cache and the failure is emitted as an `error` event.

## Cache or embedded data

Reference data is also included in the package: [`data`](/basics/embedded-data/) reads it without a request. Go through the API when you want today's data, for example right after a game update.

## Durations

Wherever a duration is expected, write a number of milliseconds or a string with a unit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`MemoryCache`](/reference/memory-cache/) | In-memory store that drops the least recently used entry once full. |
| [`CacheEntry`](/reference/cache-entry/) | What the client stores for one cached response. |
| [`CacheOptions`](/reference/cache-options/) | Cache settings of the client. |
| [`CacheStore`](/reference/cache-store/) | Where cached responses live. |
| [`Duration`](/reference/duration/) | A length of time: milliseconds as a number, or a short string such as `"30s"`, `"5m"`, `"2h"` or `"1d"`. |
<!-- exports:end -->
