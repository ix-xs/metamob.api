---
title: Caching
description: Monsters, zones and servers only change when the game does, so their answers are kept for ten minutes. Anything tied to an account is fetched every time unless you say otherwise. This page shows how to tune both.
sidebar:
  order: 5
---

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h", // reference data
    methods: { "users.get": "30s", "kralove.list": "1m" }, // and what you choose
  },
});
```

## What is cached by default

Reference data: game versions, servers, kinds of monsters, kinds of quests, quest templates, monsters, zones and subzones. An answer is kept for 10 minutes, in memory, and shared by every key: it is the same for everyone.

Nothing else. Profiles, quests, matches, conversations, trade proposals and Kralamoure events are read from the API on every call, because they change whenever someone plays.

Two identical reads sent at the same moment always share one request, cached or not.

## Caching more

`methods` gives a freshness to any method, by its name from [Every method](/reference/methods/).

```ts
const metamob = new Metamob({
  cache: {
    methods: {
      "users.get": "1m", // a profile page that gets many views
      "quests.matches": "5m", // matches do not move by the second
      "monsters.get": "1d", // even longer for reference data
      "zones.list": false, // never cache this one
    },
  },
});
```

What depends on the account is kept apart for each key: two players never see each other's answers. The entries of a key are dropped as soon as that key changes a quest or marks a conversation as read, so a read after a write is always fresh.

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

The default store lives in memory and holds 500 entries, the least recently used going first. A store is a `get` and a `set`, which can be asynchronous, plus an optional `delete` and `clear`: plug in Redis, a file, or the KV of an edge platform.

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

A key of the store never contains an API key: entries tied to an account are filed under a digest of it. A store that fails does not fail the call: the request is sent as if there were no cache, and the failure is emitted as an `error` event.

## Cache or embedded data

For reference data there is something faster than a cache: [the data in the package](/basics/embedded-data/), which needs no request at all. Use the API when you need what the package does not hold, such as the zones of a monster as the API lists them today, or when the game just changed.

## Durations

Wherever a duration is expected, write a number of milliseconds or a string with a unit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Reference

| Option | Default | Meaning |
| --- | --- | --- |
| `cache` | on | `false` turns it off |
| `cache.ttl` | `"10m"` | Freshness of reference data |
| `cache.methods` | none | Freshness per method, or `false` |
| `cache.max` | `500` | Entries the memory store holds |
| `cache.store` | memory | Your own `CacheStore` |
| `{ cache }` on a call | | A duration, or `false` |

## See also

- [The rate limit](/basics/rate-limit/)
- [The data in the package](/basics/embedded-data/)
- [Configuration](/basics/configuration/)
- [Every method](/reference/methods/)
