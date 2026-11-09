---
title: Configuration
description: "The options of the client and of a call, with their defaults."
sidebar:
  order: 8
---

Every option is optional. The defaults suit a script as well as a bot:

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

The key alone can also be passed as a string:

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Create one client and keep it: it holds the request count and the cache. Two clients for the same key count separately, and together they can go over the limit.

## One call

Every method takes its own arguments first, then an options object for that call only:

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

When a method has filters, they come before the options: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Listening to the client

The client emits an event at each step of a call. `on` returns a function that stops listening:

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
| `error` | A listener or a cache store threw an error | the error |

A URL in an event never contains the key.

## Durations

Wherever a duration is expected, write a number of milliseconds or a string with a unit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Another fetch, another host

`fetch` replaces the global fetch: to go through a proxy, to watch requests in tests, or on a runtime that has none.

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

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Metamob`](/reference/metamob/) | The Metamob API client. |
| [`VERSION`](/reference/version/) | Version of the package. |
| [`ClientEvents`](/reference/client-events/) | Events emitted by the client, see `metamob.on()`. |
| [`MetamobOptions`](/reference/metamob-options/) | Options of the [`Metamob`](/reference/metamob/) client. |
| [`RequestOptions`](/reference/request-options/) | Options accepted as the last argument of every API call. |
| [`RetryOptions`](/reference/retry-options/) | Retry policy. |
<!-- exports:end -->
