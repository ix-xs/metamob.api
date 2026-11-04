---
title: The rate limit
description: "Metamob allows 60 requests a minute per key. How the client counts them, and how to watch and tune the limit."
sidebar:
  order: 4
---

## What the API allows

60 requests a minute, counted per API key. Beyond that, the API answers 429 with a `Retry-After` header.

The limit keeps the site available for everyone: stay under it, and do not try to get around it.

## What the client does

The client counts the requests sent with each key during the last minute. When 60 have gone out, the next call waits until the oldest one is a minute old, then goes. Calls keep their order.

A loop of 300 requests therefore takes about five minutes, without an error.

If a 429 arrives anyway, for example because another program uses the same key, the client waits for the time the API asks, then tries again. See [what is retried](/basics/errors/#what-is-retried).

## Watching it

`metamob.rateLimit` says where the key of the client stands, as counted by this client: it knows nothing of the requests made elsewhere with the same key.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

The `rateLimit` event is emitted each time a call had to wait, with the length of the wait:

```ts
metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Spending fewer requests

The limit counts requests, not items. The client already sends as few as it can:

- Walking a list uses the largest page the API accepts, see [Lists](/basics/lists/).
- `count()` and `first()` ask for one item instead of a page.
- Reference data is [cached](/basics/caching/), and two identical calls in progress share one request.
- Names are resolved from [the data in the package](/basics/embedded-data/), without a request.
- `quests.setMonsters()` writes up to 200 monsters in one request.

On your side:

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
// Under the limit, to leave room for another program.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Off: a burst gets 429s, retried after the wait the API asks for.
const unlimited = new Metamob({ rateLimit: false });
```

Raising `requests` above 60 does not raise what the API allows: it only moves the waiting from the client to 429 answers.

## Several keys

Each key has its own window. A client made with [`withKey()`](/basics/many-keys/) shares the limiter of the client it comes from, which counts each key apart.

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
