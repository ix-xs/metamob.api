---
title: Runtimes
description: The library needs fetch and nothing else. It runs on Node.js 20 and newer, Bun, Deno, edge platforms and browsers, as an ES module or as CommonJS.
---

```ts
import { Metamob } from "@ix-xs/metamob.api"; // ES modules
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

## What it needs

`fetch`, `AbortController` and `URL`, which every current runtime has. No dependency is installed with the package, and nothing in it is specific to Node.js.

| Runtime | Works | Notes |
| --- | --- | --- |
| Node.js 20 and newer | Yes | ES modules and CommonJS |
| Bun | Yes | |
| Deno | Yes | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Yes | See the note on state below |
| Browsers | Yes | See the note on keys below |

## The API key

When you pass no `apiKey`, the client reads the `METAMOB_API_KEY` environment variable, where the runtime has one. Elsewhere, pass the key.

```ts
// Cloudflare Workers: the key is a secret of the worker.
export default {
  async fetch(request: Request, env: { METAMOB_API_KEY: string }) {
    const metamob = new Metamob({ apiKey: env.METAMOB_API_KEY });
    const servers = await metamob.servers.list();
    return Response.json(servers);
  },
};
```

## Browsers

Everything works in a page, but a key in a page can be read by whoever opens it. Two cases are fine:

- A tool each player uses with their own key, typed in and kept on their device.
- [`data`](/basics/embedded-data/) alone, which needs no key: search, autocomplete, "where does this monster live".

For anything else, call the API from your server.

Whether the browser may call the API from your domain is up to the CORS policy of metamob.fr. If a call fails in a page and works on a server, that is the reason: go through your server.

## State on serverless platforms

The rate limiter and the cache live in the client, in memory. On a platform that starts a fresh instance per request, each instance starts counting from zero.

- Create the client outside the handler, so warm instances reuse it.
- Give the cache a store that outlives the instance, see [Caching](/basics/caching/#a-cache-that-outlives-the-process).
- Keep bursts small. When several instances share one key, the API may still answer 429: the client waits the time it asks and retries.

## Bundle size

The package is one file per module system, about 160 kB before compression. More than half of it is the reference data. With a bundler, importing only `data` leaves the client out, and importing only `Metamob` keeps the data, which the client uses to resolve names.

## Types

The declarations ship with the package, for ES modules and for CommonJS. They resolve under every `moduleResolution` setting of TypeScript. TypeScript 5 or newer is recommended.

The names of monsters are large union types. They only feed completion: if your editor slows down on a very old machine, annotating a variable as `string` skips them.

## Testing your code

Give the client a `fetch` of your own to test without the network.

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () => Response.json({ data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14 09:12:45" } }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```

## See also

- [Configuration](/basics/configuration/)
- [The data in the package](/basics/embedded-data/)
- [Your API key](/start/api-key/)
- [Troubleshooting](/help/troubleshooting/)
