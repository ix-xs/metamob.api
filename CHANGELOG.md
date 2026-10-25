# Changelog

All notable changes to `@ix-xs/metamob.api` are documented here. This project
adheres to [Semantic Versioning](https://semver.org).

## 5.1.0

Follows the update of the Metamob API of October 2026: 38 endpoints.

### Added

- `metamob.tradeProposals.list()`: the trade proposals the account sent and
  received, filtered by `direction`, `status`, `quest` and `since`, paged with
  a cursor.
- `metamob.tradeProposals.get(id)`: one proposal, with `owned` on each
  monster, what you own of it now in the quest concerned.
- `metamob.conversations.markAsRead(username)`: marks as read what a player
  sent you, and answers `marked_count`.
- `unread_count` on each conversation.
- New fields on trade proposals: `server`, `quest_template`, `sender_quest`,
  `recipient_quest`, `cancelled_by` and `read_at`.
- Types `TradeProposalDetail`, `ProposalMonsterDetail`, `ProposalQuest`,
  `ProposalQuestTemplate`, `ConversationProposal`, `MarkAsReadResult` and
  `TradeProposalListParams`.
- A documentation page for trade proposals, in French, English and Spanish.

### Removed

- `server_id` and `quest_type` from the type of a trade proposal: the API
  deprecated them. Read `server.id` and `quest_template.quest_type` instead.

## 5.0.2

- The READMEs and every page of the documentation site credit
  [Metamob](https://www.metamob.fr), the site this library exists for.

## 5.0.1

- The README is in French, the language of most players of Dofus, with an
  [English](./README.en.md) and a [Spanish](./README.es.md) version.
- The documentation site opens in French, keeps English under `/en/` and
  gains Spanish under `/es/`, the three languages of Metamob itself.
- The playground of the site has four trials: a name, an autocomplete, where
  a monster lives, and a quest step by step.
- Doc comments follow what the API really does: a quantity goes from 0 to 99,
  and a username is found whatever its case.

## 5.0.0

A rewrite from the ground up, in TypeScript. The same 35 endpoints of the
Metamob API, with a shorter way to call them, no dependency, and a
documentation site in English and French.

### Breaking changes

- The package exports a named `Metamob` class instead of a default class.
  `new MetamobAPI({ api_key })` becomes `new Metamob({ apiKey })`.
- Methods return the data itself and throw a `MetamobApiError` on failure,
  instead of resolving to `{ ok, status, statusText, data }`.
- Methods are grouped by resource: `getMonsters({ idOrName })` becomes
  `metamob.monsters.get(ref)`, `updateQuestMonster(slug, idOrName, quantity)`
  becomes `metamob.quests.setMonster(slug, ref, quantity)`, and so on. The
  [migration page](https://ix-xs.github.io/metamob.api/en/start/migrating-from-v4/)
  lists all of them.
- Paginated methods return a request to await or iterate instead of taking
  care of one page only. The page is `{ items, total, limit, offset }` instead
  of `{ data, pagination }`.
- The key of another player goes in `{ apiKey }` as last argument of a call,
  or through `metamob.withKey(apiKey)`, instead of `api_key` among the
  parameters.
- `client.cache` is replaced by the exported `data`, which is searchable.
- An unknown name throws `UNKNOWN_NAME`, with the closest names, instead of
  resolving to `{ ok: false }`.
- Node.js 20 or newer is required.
- `@ix-xs/node-comfort` is no longer installed with the package.

### Added

- **Lazy lists.** Every paginated method can be awaited for one page, iterated
  with `for await` across pages, or collected with `.all({ limit })`,
  `.take(n)`, `.first()` and `.count()`. Private messages, which the API
  paginates with a cursor, work the same way.
- **A rate limiter.** The 60 requests a minute the API allows are counted per
  key, and calls beyond them wait their turn instead of failing with a 429.
  `metamob.rateLimit` tells where the key stands.
- **Retries.** A 429, a 502, 503 or 504, a 500 on a read, a timeout and a
  network failure are retried with exponential backoff, honouring
  `Retry-After`.
- **Caching.** Reference data is cached for 10 minutes by default, identical
  calls in flight share one request, and any method can be given its own
  freshness. Entries tied to an account are kept apart per key and dropped
  when that key changes a quest. The store is pluggable.
- **Names everywhere.** Monsters, zones, subzones, servers, game versions,
  kinds of monsters and kinds of quests are designated by id, by name in
  French, English or Spanish (accents, case and the kind of dash ignored), or by an object that
  has the id. A name the package does not know is looked up through the API
  before giving up, and a misspelled one comes back with suggestions.
- **Searchable embedded data.** `data.monster()`, `data.searchMonsters()`,
  `data.zonesOf()`, `data.subzonesOf()`, `data.archmonstersOf()`,
  `data.monstersInSubzone()`, `data.monstersInZone()`, `data.templatesOf()`,
  `data.templateMonsters()`, `data.stepOf()`, `data.suggest()` and the plain
  lists, all answered from memory.
- **Monsters that share a name.** Ten archmonsters have the same name in two
  versions of the game. Writes to a quest pick the one of that quest; reads
  take `{ gameVersion }` or `{ template }`.
- **Subzones without their zone.** `zones.subzone()` and `zones.monsters()`
  find the zone themselves.
- **Batches of any size.** `quests.setMonsters()` takes a list, an object
  keyed by name or a `Map`, and splits it into requests of 200.
- **`quests.resetTrade()`**, to hand a monster back to the automatic trade
  calculation, and **`monsters.search()`**.
- **`metamob.withKey()`**, a client for the key of a player who entrusted it
  to you, sharing the settings, cache and listeners of the first.
- **Events**: `request`, `response`, `retry`, `rateLimit`, `error`.
- **Typed errors**: `MetamobApiError`, `MetamobRequestError`,
  `MetamobArgumentError`, each with a `code`, and `isMetamobError()`.
- **`urls`**: the picture of a monster or of a kind of quest, and the profile
  page of a player.
- **Cancellation and timeouts**: every call takes `{ signal, timeout }`.
- ES modules and CommonJS builds with their own type declarations, and
  support for Bun, Deno, browsers and edge runtimes.
- A [documentation site](https://ix-xs.github.io/metamob.api/), in English and
  in French.

### Fixed

- The embedded data held 50 of the 192 subzones, so most subzone names were
  not recognised. It is now rebuilt from the API by `npm run data:update`.
- A name shared by two monsters resolved to whichever came first in the data.

## 4.2.0

- Added `getMe`, `getMyQuests`, `getQuestMonsters` and `getQuestTypes`,
  following the API changes of 4 September 2026.
- `quest_template` now carries its `quest_type`.

## 4.1.1

- `creator` and `username` of Kralamoure events can be `null`, for accounts
  that were deleted.

## 4.1.0

- Added `getQuest`, and `type_filters` as input of `updateQuest`.
- Type declarations with the names of monsters, zones and servers.

## 4.0.0

- Coverage of the whole Metamob API v1, with an API key per call.
