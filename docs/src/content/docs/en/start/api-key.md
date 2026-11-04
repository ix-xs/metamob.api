---
title: Your API key
description: "Create a Metamob API key, give it to the client, check it and keep it safe."
---

## Creating a key

Sign in on [metamob.fr](https://www.metamob.fr), open **Settings** then the **API key** section, and generate a key. Copy it right away: the site shows it only once.

The key belongs to your account. Every call made with it is made on your behalf, and it always gives full access: there is no read-only key.

## What a key gives access to

| With any key | Only with the key of the account |
| --- | --- |
| Monsters, zones, servers, quest templates | `metamob.me()` |
| Public profiles and quests of any player | `metamob.quests`: settings, monsters, matches, progress and writes |
| Kralamoure events | `metamob.conversations` and `metamob.tradeProposals`. Sending messages and proposals is opened account by account by Metamob |

The API asks for a key on every call, even for public data.

## Giving the key to the client

The client looks for the key in three places, from the most general to the most specific:

1. the `METAMOB_API_KEY` environment variable;
2. the `apiKey` option of the client;
3. `{ apiKey }` as last argument of a call, or [`metamob.withKey()`](/basics/many-keys/), to act with the key of another player.

```bash title=".env"
METAMOB_API_KEY=your-key
```

```ts
const metamob = new Metamob(); // reads METAMOB_API_KEY

const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);

const quests = await metamob.quests.list({ apiKey: theirKey });
```

Without a key, the first call throws a `MISSING_API_KEY` error.

## Checking a key

`metamob.me()` is the simplest call to know whether a key works and whose it is:

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
  console.log("This key is not valid, or was revoked.");
}
```

## Keeping it safe

- Never publish a key: not in a commit, not in an issue, not in a log. The library never puts it in a URL, an error or an event.
- In a web page, a key is visible to everyone who opens the page. Call the API from a server, except for a page that only the owner of the key uses.
- If players give you their key, treat it like a password: encrypted, and deleted when they leave.
- If a key leaks, generate a new one on metamob.fr: the old one stops working.

## The rate limit goes with the key

Each key has its own 60 requests a minute. A bot can therefore act for several players, each with their key. Using several keys to go faster is not the point: the limit protects the Metamob server. See [The rate limit](/basics/rate-limit/).
