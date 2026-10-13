---
title: The rate limit
description: Metamob allows 60 requests a minute per API key. The client counts them and makes the next call wait its turn, so a long loop slows down instead of failing. This page shows how to watch the limit, tune it and spend fewer requests.
sidebar:
  order: 4
---

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## What the API allows

60 requests a minute, counted per API key. Beyond that the API answers 429 with a `Retry-After` header.

Metamob is a free service run by one person. The limit is what keeps it available for everyone: stay under it, and do not look for ways around it.

## What the client does

The limiter is on by default. It keeps, for each key, the time of the requests sent in the last minute. When 60 were sent, the next call waits until the oldest one is a minute old, then goes. Calls keep their order.

Nothing fails and nothing is dropped: a loop of 300 requests takes about four minutes instead of throwing after the 60th.

If a 429 arrives anyway, because another program uses the same key for instance, the client holds every call of that key for the time the API asks, then retries. See [what is retried](/basics/errors/#what-is-retried).

## Watching it

`metamob.rateLimit` says where the key of the client stands, as counted by this client: it does not know about requests made elsewhere with the same key.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

The `rateLimit` event fires each time a call had to wait, with how long.

## Spending fewer requests

The limit counts requests, not items. Most of the savings are already made for you:

- Walking a list uses the largest page the API accepts, see [Lists](/basics/lists/).
- `count()` and `first()` ask for one item instead of a page.
- Reference data is [cached](/basics/caching/), and two identical calls in flight share one request.
- Names are resolved from [the data in the package](/basics/embedded-data/), with no request.
- `quests.setMonsters()` writes up to 200 monsters in one request, where `setMonster()` in a loop would send 200.

What is left to you:

```ts
import { data } from "@ix-xs/metamob.api";

// Reading reference data: ask the package, not the API.
const monster = data.monster("Tofu Maléfique"); // no request
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 request, with the zones

// Many quantities: one batch, not a loop.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## Tuning it

```ts
// Stay well under the limit, to leave room for another program on the same key.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Off. A burst then gets 429s, which are retried after the wait the API asks for.
const unlimited = new Metamob({ rateLimit: false });
```

Raising `requests` above 60 does not raise what the API allows: it only moves the waiting from the client to 429 answers.

## Several keys

Each key has its own window. A client made with [`withKey()`](/basics/many-keys/) shares the limiter of the client it comes from, which keeps one window per key. A bot that serves ten players therefore never mixes their counts.

## Cancelling a wait

A call waiting for its turn can be cancelled with a `signal`. It throws an error with the code `ABORTED` and frees its place.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

## Reference

| Option | Default | Meaning |
| --- | --- | --- |
| `rateLimit` | on | `false` turns the limiter off |
| `rateLimit.requests` | `60` | Requests allowed per window, per key |
| `rateLimit.per` | `"1m"` | Length of the window |

| `metamob.rateLimit` | Meaning |
| --- | --- |
| `limit` | Requests allowed per window |
| `remaining` | Requests left in the current window |
| `resetsIn` | Milliseconds until a request is free again, 0 when one already is |

## See also

- [Caching](/basics/caching/)
- [Errors](/basics/errors/)
- [Acting for other players](/basics/many-keys/)
- [Lists](/basics/lists/)
