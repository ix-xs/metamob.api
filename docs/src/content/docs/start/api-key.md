---
title: Your API key
description: Where a Metamob API key comes from, what it gives access to, how to hand it to the client and how to keep it safe.
---

```ts
// Reads the METAMOB_API_KEY environment variable.
const metamob = new Metamob();

// Or pass it yourself.
const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);
```

## Creating a key

Sign in on [metamob.fr](https://www.metamob.fr), open **Settings**, then **API key**. The key is a long string of letters and digits. It belongs to your account, and every call made with it is made as you.

A key cannot be limited to reading: it always gives full access.

## What a key gives access to

| With any key | Only with the key of the account |
| --- | --- |
| Monsters, zones, servers, quest templates | `metamob.me()` |
| Public profiles and public quests of any player | `metamob.quests`: settings, monsters, matches, progress, and every write |
| Kralamoure events | `metamob.conversations`: private messages and trade proposals |

There is no call without a key, not even for public data.

## Giving the key to the client

In order of preference:

1. The `METAMOB_API_KEY` environment variable. Nothing to write, nothing to leak in a commit.
2. The `apiKey` option of the client.
3. `{ apiKey }` as last argument of one call, or [`metamob.withKey()`](/basics/many-keys/), when you act for another player.

```bash
# .env, kept out of git
METAMOB_API_KEY=your-key
```

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
```

Without a key anywhere, the first call throws an error with the code `MISSING_API_KEY`.

## Checking a key

`metamob.me()` is the cheapest way to know whether a key works and whose it is.

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key is not valid, or was revoked.");
  else throw error;
}
```

## Keeping it safe

- Never commit a key, paste it in an issue or log it. The library never puts it in a URL, an error or an event.
- A key in a browser is visible to whoever opens the page. Call the API from your server unless the page is only ever used by the owner of the key.
- When players give you their key, store it like a password: encrypted, and deleted when they leave.
- If a key leaks, create a new one on the same page of metamob.fr. The old one stops working.

## The rate limit goes with the key

Each key has its own 60 requests a minute. That is what makes a bot for many players possible, each with their key. It is not an invitation to collect keys to go faster: the limit protects a server run by one person. See [The rate limit](/basics/rate-limit/).

## See also

- [Quick start](/start/quick-start/)
- [Acting for other players](/basics/many-keys/)
- [Account](/resources/account/)
- [Errors](/basics/errors/)
