---
title: FAQ
description: "Short answers to common questions."
---

## Is it official?

No. `@ix-xs/metamob.api` is an independent open-source project, under the MIT license, affiliated with neither Metamob nor Ankama. It follows the [public API of Metamob](https://www.metamob.fr/help/api), and it is updated when the API changes.

## What is Metamob?

[Metamob](https://www.metamob.fr) is a free site where Dofus players track the monsters of the Ochre Dofus and Dokille quests, and find each other to trade them. It covers Dofus (Unity), Dofus Retro and Dofus Touch.

## Does it cover the whole API?

Yes, the 42 endpoints. [Every method](/resources/methods/) lists them, with the method that calls each one.

## Do I need an API key?

For every call to the API, yes: see [Your API key](/start/api-key/). The [data in the package](/basics/embedded-data/) needs none.

## Is it free?

The library is, and so is the API. The API accepts 60 requests a minute per key, and the client stays under it: see [The rate limit](/basics/rate-limit/).

## Can I raise the rate limit?

No, and do not try to get around it with several keys: the limit keeps the site available for everyone. To make fewer requests, see [The rate limit](/basics/rate-limit/#spending-fewer-requests).

## Does it work with TypeScript? With plain JavaScript?

Both. It is written in TypeScript and includes its types. In JavaScript, your editor still shows the documentation and completes the names of monsters.

## ES modules or CommonJS?

Both: `import { Metamob }` and `const { Metamob } = require(...)`. See [Runtimes](/help/runtimes/).

## Can I use it in a browser?

Yes, with care for the key: see [Runtimes](/help/runtimes/#browsers). The `data` object alone is safe anywhere.

## In which language are the names?

French, English and Spanish. Every monster, zone and subzone has a `name` with `fr`, `en` and `es`, and all three are accepted wherever a name is: see [Names and ids](/basics/names-and-ids/).

## How current is the data in the package?

`data.fetchedAt` gives the date it was read from the API, and each release of the package refreshes it. A monster newer than your version still works by name in calls: the library then looks for the name in the API. See [The data in the package](/basics/embedded-data/#when-the-game-changes).

## Can it create a quest, send a message or propose a trade?

It can send a message and propose a trade, once Metamob has opened sending on your account: see [Conversations](/resources/conversations/#sending-a-message) and [Trade proposals](/resources/trade-proposals/#making-a-proposal). It also writes to your quests: settings, quantities and manual trade settings. It can also apply or cancel a proposal. Creating a quest is done on the site.

## Can I manage the quests of other players?

With their own key, given willingly: see [Acting for other players](/basics/many-keys/). Without it, you can read what they made public.

## How do I add one to a quantity?

Read it, then set it: `setMonster` sets a quantity. The snippet is in [Troubleshooting](/help/troubleshooting/#setmonster-did-not-add-one).

## Does it retry on its own?

Yes: rate limits, server errors on reads, timeouts and network failures, up to 3 times with growing delays. Except sending a message or a proposal, which is never retried. See [Errors](/basics/errors/#what-is-retried).

## I used version 4. What changes?

The way to call the methods, not what they do. [Coming from version 4](/help/migrating-from-v4/) gives the replacement of each method.

## Where do I report a bug or ask for something?

On [GitHub](https://github.com/ix-xs/metamob.api/issues). For a problem with the API itself or with the site, Metamob has its own contact on [metamob.fr](https://www.metamob.fr).
