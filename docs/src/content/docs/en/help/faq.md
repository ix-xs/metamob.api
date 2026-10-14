---
title: FAQ
description: Short answers to the questions that come up before and after installing the library, each with a link to the page that covers the subject.
---

## Is it official?

No. `@ix-xs/metamob.api` is an independent open-source project under the MIT license. It is not affiliated with Metamob or with Ankama. It follows the [public API of Metamob](https://www.metamob.fr/help/api) and is updated when the API changes.

## What is Metamob?

[Metamob](https://www.metamob.fr) is a free site where Dofus players track the monsters of the Ochre Dofus and Dokille quests and find each other to trade them. It covers Dofus (Unity), Dofus Retro and Dofus Touch.

## Does it cover the whole API?

Yes, the 35 endpoints. [Every method](/reference/methods/) lists them next to the method that calls each one.

## Do I need an API key?

For every call to the API, yes: see [Your API key](/start/api-key/). The [data in the package](/basics/embedded-data/) needs none.

## Is it free?

The library is, and so is the API. The API is limited to 60 requests a minute per key, which the client respects for you: see [The rate limit](/basics/rate-limit/).

## Can I raise the rate limit?

No, and please do not try to get around it with several keys. Metamob is run by one person and the limit keeps it up for everyone. The library helps you need fewer requests instead: larger pages, a cache, batches, and reference data read from the package.

## Does it work with TypeScript? With plain JavaScript?

Both. It is written in TypeScript and ships its types. In JavaScript, your editor still shows the documentation and completes the names of monsters.

## ES modules or CommonJS?

Both: `import { Metamob }` and `const { Metamob } = require(...)`. See [Runtimes](/reference/runtimes/).

## Can I use it in a browser?

Yes, with care for the key: see [Runtimes](/reference/runtimes/#browsers). The `data` object alone is safe anywhere.

## In which language are the names?

French, English and Spanish. Every monster, zone and subzone has a `name` with `fr`, `en` and `es`, and all three are accepted wherever you write a name: see [Names and ids](/basics/names-and-ids/).

## How current is the data in the package?

`data.fetchedAt` says when it was read from the API. Each release refreshes it. A monster newer than your version still works by name in calls, because the library asks the API when a name is unknown: see [The data in the package](/basics/embedded-data/#when-the-game-changes).

## Can it create a quest, send a message or propose a trade?

No: the API does not offer it. Through the API you read almost everything, and you write to your own quests: settings, quantities and trade overrides. The rest is done on the site.

## Can I manage the quests of other players?

With their own key, given willingly: see [Acting for other players](/basics/many-keys/). Without it you can read what they made public.

## How do I add one to a quantity?

Read it, then set it: `setMonster` sets a quantity. The snippet is in [Troubleshooting](/help/troubleshooting/#setmonster-did-not-add-one).

## Does it retry on its own?

Yes: rate limits, server errors on reads, timeouts and network failures, up to 3 times with growing delays. See [Errors](/basics/errors/#what-is-retried).

## I used version 4. What changes?

The way to call things, not what they do. [Coming from version 4](/start/migrating-from-v4/) maps every method.

## Where do I report a bug or ask for something?

On [GitHub](https://github.com/ix-xs/metamob.api/issues). For a problem with the API itself or with the site, Metamob has its own contact on [metamob.fr](https://www.metamob.fr).

## See also

- [Quick start](/start/quick-start/)
- [Troubleshooting](/help/troubleshooting/)
- [Every method](/reference/methods/)
- [The changelog](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
