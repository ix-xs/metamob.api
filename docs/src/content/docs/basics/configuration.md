---
title: Configuration
description: Every option of the client and of a single call, with its default. Nothing is required but an API key, and the defaults suit a script as well as a bot.
sidebar:
  order: 8
---

```ts
const metamob = new Metamob({
  apiKey: process.env.METAMOB_API_KEY,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h" },
  rateLimit: { requests: 50 },
});
```

## The client

Every option is optional. The key alone can be passed as a string.

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Create one client and keep it: the rate limiter and the cache live in it. Two clients for the same key count their requests separately and can go over the limit together.

## One call

Every method takes its own arguments first, then an options object for that call only.

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

When a method has filters, they come before the options: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Listening to the client

The client emits what it does. `on` returns a function that stops listening.

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Event | When | Payload |
| --- | --- | --- |
| `request` | A request leaves | `method`, `verb`, `url`, `attempt` |
| `response` | An answer arrived, or came from the cache | `method`, `status`, `duration`, `cached` |
| `retry` | A request will be tried again | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | A call waited for its turn | `method`, `delay` |
| `error` | A listener or a cache store threw | the error |

A URL in an event never contains the key.

## Durations

Wherever a duration is expected, write a number of milliseconds or a string with a unit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Another fetch, another host

`fetch` replaces the global one: to go through a proxy, to record requests in tests, or on a runtime that has none.

```ts
const calls: string[] = [];

const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  fetch: async (input, init) => {
    calls.push(String(input));
    return fetch(input, init);
  },
});
```

`baseUrl` points the client at another host. The key is sent to that host: only use one you trust.

## Reference

Options of the client:

| Option | Default | Meaning |
| --- | --- | --- |
| `apiKey` | `METAMOB_API_KEY` | The key of the client |
| `timeout` | `"30s"` | Time allowed for one attempt |
| `retry` | 3 retries | `{ attempts, delay, maxDelay }`, or `false`. See [Errors](/basics/errors/#what-is-retried) |
| `cache` | on, `"10m"` | `{ ttl, methods, max, store }`, or `false`. See [Caching](/basics/caching/) |
| `rateLimit` | on, 60 a minute | `{ requests, per }`, or `false`. See [The rate limit](/basics/rate-limit/) |
| `fetch` | the global `fetch` | A `fetch` to use instead |
| `baseUrl` | `https://www.metamob.fr/api/v1` | Where the API is |
| `headers` | none | Headers added to every request |

Options of a call:

| Option | Meaning |
| --- | --- |
| `apiKey` | The key for this call. See [Acting for other players](/basics/many-keys/) |
| `signal` | An `AbortSignal` that cancels the call |
| `timeout` | Time allowed for one attempt of this call |
| `retry` | Retry policy of this call, or `false` |
| `cache` | Freshness of this answer, or `false` to skip the cache |
| `headers` | Headers added to this request |

Members of the client:

| Member | Meaning |
| --- | --- |
| `me()` | The account of the key |
| `quests`, `monsters`, `zones`, `users`, `conversations`, `kralove` | The resources |
| `gameVersions`, `servers`, `monsterTypes`, `questTypes`, `questTemplates` | The reference lists |
| `data` | [The data in the package](/basics/embedded-data/) |
| `withKey(apiKey)` | A client for another key |
| `rateLimit` | Where the key stands against the limit |
| `on`, `once`, `off` | Events |
| `clearCache()` | Empties the cache |

## See also

- [Errors](/basics/errors/)
- [Caching](/basics/caching/)
- [The rate limit](/basics/rate-limit/)
- [Runtimes](/reference/runtimes/)
