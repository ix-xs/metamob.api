---
title: All exports
description: "Everything the package exports, values and types."
---

The package has a single entry point, `@ix-xs/metamob.api`, for ES modules as for CommonJS. The types are exported from it too:

```ts
import { Metamob, data, urls, isMetamobError } from "@ix-xs/metamob.api";
import type { Monster, OwnQuest, MonsterLike } from "@ix-xs/metamob.api";
```

## Values

| Export | What it is | Page |
| --- | --- | --- |
| `Metamob` | The client | [Configuration](/basics/configuration/) |
| `data` | The reference data delivered with the package | [The data in the package](/basics/embedded-data/) |
| `Dataset` | The class of `data` | [The data in the package](/basics/embedded-data/) |
| `urls` | Addresses on metamob.fr: pictures and profiles | below |
| `MetamobError` | The base class of every error | [Error codes](/reference/errors/) |
| `MetamobApiError` | The API answered with an error status | [Error codes](/reference/errors/#metamobapierror) |
| `MetamobRequestError` | Timeout, network failure, abort, invalid JSON | [Error codes](/reference/errors/#metamobrequesterror) |
| `MetamobArgumentError` | Refused before being sent | [Error codes](/reference/errors/#metamobargumenterror) |
| `isMetamobError` | Type guard for the errors of the library | [Errors](/basics/errors/#testing-an-error) |
| `ListRequest` | What a paginated method returns | [Lists](/basics/lists/) |
| `Page` | One page of a list | [Lists](/basics/lists/#one-page) |
| `MemoryCache` | The built-in cache store | [Caching](/basics/caching/) |
| `normalizeName` | The name comparison the library uses | [Names and ids](/basics/names-and-ids/#how-a-name-is-matched) |
| `METHODS` | The 42 endpoints, by method name | [Every method](/reference/methods/) |
| `VERSION` | The version of the package | |

## urls

Builds addresses on metamob.fr from what the API returns, without a request:

```ts
const monster = await metamob.monsters.get("Tofu Maléfique");

urls.monsterImage(monster); // from a monster, an avatar or a file name
urls.questTypeImage("ocre.png"); // from a kind of quest or a file name
urls.profile("Ix-xs"); // from a user or a username
urls.site; // "https://www.metamob.fr"
```

## normalizeName

The comparison applied to names: accents removed, case ignored, apostrophes and dashes unified, spaces collapsed. It serves to compare a typed text with a name, the way the library does:

```ts
normalizeName("Tofu  MALÉFIQUE"); // "tofu malefique"
normalizeName(monsters[0]?.name.fr ?? "") === normalizeName("tofu malefique");
```

## METHODS

The description of each endpoint, under the name of its method. The keys of `cache.methods` are checked against it.

```ts
METHODS["quests.setMonster"].path; // "/quests/{slug}/monsters/{monsterId}"
Object.keys(METHODS).length; // 42
```

## Types of the client

| Type | What it describes |
| --- | --- |
| `MetamobOptions` | The options of the client |
| `RequestOptions` | The options of a call |
| `RetryOptions` | `{ attempts, delay, maxDelay }` |
| `CacheOptions`, `CacheStore`, `CacheEntry` | The cache and its store |
| `RateLimitOptions`, `RateLimitState` | The limiter and `metamob.rateLimit` |
| `ClientEvents` | The events and the data they carry |
| `Duration` | A number of milliseconds or a string such as `"10m"` |
| `MethodId`, `MethodSpec` | A method name, and its description in `METHODS` |
| `MetamobErrorCode` | The error codes |
| `CollectOptions`, `PageParams` | `{ limit }` of `all()` and `pages()`, `{ limit, offset }` of a list |

## Types of what you pass

| Type | What it accepts |
| --- | --- |
| `MonsterLike`, `ZoneLike`, `SubzoneLike`, `ServerLike` | An id, a name, an object with an `id` |
| `GameVersionLike`, `MonsterTypeLike`, `QuestTypeLike` | An id, a name, an object with an `id` |
| `QuestTemplateLike` | An id, `{ id }`, `{ questType, gameVersion }` |
| `MonsterHint`, `MonsterSearchOptions` | What tells apart two monsters of the same name; the options of `data.searchMonsters()` |
| `MonsterListParams`, `TemplateMonstersParams` | The filters of `monsters.list()` and of `questTemplates.monsters()` |
| `SubzoneParams` | `{ zone }` |
| `KraloveListParams` | The filters of `kralove.list()` |
| `UserSearchParams`, `PublicQuestParams` | The filters of `users.search()` and of `users.quest()` |
| `ConversationListParams`, `MessagesParams` | The filters of the conversations |
| `TradeProposalListParams`, `NewTradeProposal` | The filters of `tradeProposals.list()`, what `tradeProposals.create()` takes |
| `OwnQuestMonstersParams`, `MatchesParams`, `QuestZonesParams` | The filters of `quests.monsters()`, `quests.matches()`, `quests.zones()` |
| `QuestUpdate`, `TradeOverride`, `MonsterQuantities` | What `quests.update()`, `quests.setTrade()` and `quests.setMonsters()` take |

## Types of what comes back

| Type | Where from |
| --- | --- |
| `Account` | `me()` |
| `GameVersion`, `Server`, `MonsterType`, `QuestType`, `QuestTemplate` | The reference lists |
| `Monster`, `MonsterDetail`, `MonsterReference`, `TemplateMonster` | Monsters |
| `Zone`, `ZoneDetail`, `Subzone`, `SubzoneRef` | Zones |
| `KraloveEvent`, `KraloveEventDetail`, `KraloveParticipant`, `KraloveMessage` | Kralamoure events |
| `UserSummary`, `UserProfile`, `Avatar` | Players |
| `PublicQuest`, `PublicQuestSummary`, `QuestMonster` | Public quests |
| `OwnQuest`, `QuestSettings`, `OwnQuestMonster`, `TypeFilter`, `TypeFilters` | Your quests |
| `QuestUpdateResult`, `MonsterQuantityResult`, `MonstersUpdateResult`, `TradeOverrideResult` | The answers to writes |
| `TradeMatch`, `MatchMonster` | Matches |
| `ZoneProgress`, `SubzoneProgress`, `ZoneProgressMonster` | Progress by zone |
| `Conversation`, `ConversationItem`, `ConversationMessage`, `ConversationProposal`, `MarkAsReadResult` | Conversations |
| `TradeProposal`, `TradeProposalDetail`, `ProposalMonster`, `ProposalMonsterDetail`, `ProposalQuest`, `ProposalQuestTemplate` | Trade proposals |
| `LocalizedName`, `Language` | `{ fr, en, es }` and its keys |
| `QuestBase`, `QuestTemplateRef`, `QuestTypeRef`, `TemplateHeader` | The parts shared by the types above |

The classes of the resources are also exported as types, to annotate a parameter: `Quests`, `Monsters`, `Zones`, `Users`, `Conversations`, `TradeProposals`, `Kralove`, `GameVersions`, `Servers`, `MonsterTypes`, `QuestTypes`, `QuestTemplates`.

## Names as types

The names known when the package was published are also literal types: they are what lets your editor complete `"Tofu Maléfique"`.

| Type | Values |
| --- | --- |
| `MonsterNameFr`, `MonsterNameEn`, `MonsterNameEs` | The names of monsters |
| `ZoneNameFr`, `ZoneNameEn`, `ZoneNameEs` | The names of zones |
| `SubzoneNameFr`, `SubzoneNameEn`, `SubzoneNameEs` | The names of subzones |
| `MonsterTypeNameFr`, `MonsterTypeNameEn`, `MonsterTypeNameEs` | The kinds of monsters |
| `QuestTypeNameFr`, `QuestTypeNameEn`, `QuestTypeNameEs`, `QuestTypeSlug` | The kinds of quests |
| `ServerName`, `GameVersionName` | The servers and the versions of the game |
| `QuestTemplateId` | The ids of the quest templates |

```ts
function isArchmonsterName(name: MonsterNameFr) {
  return data.monster(name)?.type?.id === 3;
}

isArchmonsterName("Bouflet le Puéril");
```
