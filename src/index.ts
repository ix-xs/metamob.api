export { Metamob, type MetamobOptions } from "./client.js";

// Core
export { type CacheEntry, type CacheOptions, type CacheStore, MemoryCache } from "./core/cache.js";
export { MetamobApiError, MetamobArgumentError, MetamobError, type MetamobErrorCode, MetamobRequestError, isMetamobError } from "./core/errors.js";
export type { RateLimitOptions, RateLimitState } from "./core/limiter.js";
export { type CollectOptions, ListRequest, Page } from "./core/pagination.js";
export type { PageParams } from "./core/resource.js";
export type { ClientEvents, MethodSpec, RequestOptions, RetryOptions } from "./core/rest.js";
export type { Duration } from "./core/time.js";

// The embedded reference data
export {
  Dataset,
  data,
  type GameVersionLike,
  type MonsterHint,
  type MonsterLike,
  type MonsterSearchOptions,
  type MonsterTypeLike,
  type QuestTemplateLike,
  type QuestTypeLike,
  type ServerLike,
  type SubzoneLike,
  type ZoneLike,
} from "./data/dataset.js";
export { normalizeName } from "./data/text.js";
export { METHODS, type MethodId } from "./generated/methods.js";
export type * from "./generated/names.js";
export { VERSION } from "./generated/version.js";

// Resources
export type { ConversationListParams, Conversations, MessagesParams } from "./resources/conversations.js";
export type { Kralove, KraloveListParams } from "./resources/kralove.js";
export type { MonsterListParams, Monsters } from "./resources/monsters.js";
export type { MatchesParams, MonsterQuantities, OwnQuestMonstersParams, Quests, QuestZonesParams } from "./resources/quests.js";
export type { GameVersions, MonsterTypes, QuestTemplates, QuestTypes, Servers, TemplateHeader, TemplateMonstersParams } from "./resources/reference.js";
export type { PublicQuestParams, UserSearchParams, Users } from "./resources/users.js";
export type { TradeProposalListParams, TradeProposals } from "./resources/trade-proposals.js";
export type { SubzoneParams, Zones } from "./resources/zones.js";

// What the API answers with
export type * from "./types.js";

// Helpers
export { urls } from "./utils/urls.js";
