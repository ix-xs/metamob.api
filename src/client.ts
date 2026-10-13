import type { CacheOptions } from "./core/cache.js";
import { MetamobArgumentError } from "./core/errors.js";
import type { RateLimitOptions, RateLimitState } from "./core/limiter.js";
import { Resolver } from "./core/resolve.js";
import type { Context } from "./core/resource.js";
import { type ClientEvents, type RequestOptions, Rest, type RetryOptions } from "./core/rest.js";
import type { Duration } from "./core/time.js";
import { type Dataset, data } from "./data/dataset.js";
import { METHODS } from "./generated/methods.js";
import { Conversations } from "./resources/conversations.js";
import { Kralove } from "./resources/kralove.js";
import { Monsters } from "./resources/monsters.js";
import { Quests } from "./resources/quests.js";
import { GameVersions, MonsterTypes, QuestTemplates, QuestTypes, Servers } from "./resources/reference.js";
import { Users } from "./resources/users.js";
import { Zones } from "./resources/zones.js";
import type { Account } from "./types.js";

/** Options of the {@link Metamob} client. */
export interface MetamobOptions {
  /**
   * Your API key, created on metamob.fr in Settings > API key. Left out, the
   * `METAMOB_API_KEY` environment variable is used. A call can also bring its
   * own key, see {@link RequestOptions.apiKey}.
   */
  apiKey?: string | undefined;
  /** Time allowed for one attempt of a request. Default `"30s"`. */
  timeout?: Duration | undefined;
  /**
   * Retry policy for rate limits, server errors and network failures. Default:
   * 3 retries with exponential backoff. `false` turns retries off.
   */
  retry?: RetryOptions | false | undefined;
  /**
   * Cache of reference data (monsters, zones, servers...), which changes only
   * when the game does. On by default, for 10 minutes, in memory. `false`
   * turns it off; an object tunes it or caches more.
   */
  cache?: boolean | CacheOptions | undefined;
  /**
   * Rate limiter. On by default at the limit of the API, 60 requests a minute
   * per key: calls beyond it wait instead of failing. `false` turns it off.
   */
  rateLimit?: boolean | RateLimitOptions | undefined;
  /** A `fetch` to use instead of the global one. */
  fetch?: typeof fetch | undefined;
  /** Base URL of the API. Default `https://www.metamob.fr/api/v1`. */
  baseUrl?: string | undefined;
  /** Headers added to every request. */
  headers?: Record<string, string> | undefined;
}

/**
 * The Metamob API client.
 *
 * @example
 * import { Metamob } from "@ix-xs/metamob.api";
 *
 * const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });
 *
 * const me = await metamob.me();
 * const monster = await metamob.monsters.get("Tofu Maléfique");
 * for (const quest of await metamob.quests.list()) console.log(quest.slug);
 */
export class Metamob {
  readonly #rest: Rest;

  /** The versions of the game. */
  readonly gameVersions: GameVersions;
  /** The game servers. */
  readonly servers: Servers;
  /** The kinds of monsters: monster, boss, archmonster. */
  readonly monsterTypes: MonsterTypes;
  /** The kinds of quests: Ochre, Grofus. */
  readonly questTypes: QuestTypes;
  /** The quest templates: what each kind of quest asks for in each version of the game. */
  readonly questTemplates: QuestTemplates;
  /** The monsters. */
  readonly monsters: Monsters;
  /** The zones and subzones, and the monsters that live there. */
  readonly zones: Zones;
  /** The Kralamoure events. */
  readonly kralove: Kralove;
  /** Other players: profiles and public quests. */
  readonly users: Users;
  /** The private messages of the account. */
  readonly conversations: Conversations;
  /** The quests of the account: settings, monsters, trade partners, progress. */
  readonly quests: Quests;

  /**
   * The reference data embedded in the package: monsters, zones, servers and
   * quest templates, answered from memory without a request.
   */
  readonly data: Dataset = data;

  /**
   * @param options - The options, or just the API key.
   * @param from - @internal A client to share the rate limit, cache and listeners with.
   */
  constructor(options: MetamobOptions | string = {}, from?: Metamob) {
    const resolved: MetamobOptions = typeof options === "string" ? { apiKey: options } : options;
    if (resolved === null || typeof resolved !== "object") throw new MetamobArgumentError("The options of the client must be an object, or the API key as a string.");
    if (resolved.apiKey !== undefined && (typeof resolved.apiKey !== "string" || !resolved.apiKey.trim())) throw new MetamobArgumentError("`apiKey` must be a non-empty string.");
    this.#rest = new Rest(resolved, from ? from.#rest : undefined);
    const context: Context = { rest: this.#rest, resolve: new Resolver(this.#rest) };
    this.gameVersions = new GameVersions(context);
    this.servers = new Servers(context);
    this.monsterTypes = new MonsterTypes(context);
    this.questTypes = new QuestTypes(context);
    this.questTemplates = new QuestTemplates(context);
    this.monsters = new Monsters(context);
    this.zones = new Zones(context);
    this.kralove = new Kralove(context);
    this.users = new Users(context);
    this.conversations = new Conversations(context);
    this.quests = new Quests(context);
  }

  /**
   * The account the API key belongs to: username, bio, avatar and last
   * activity. A key says nothing else about its owner, so call this when a
   * user hands you their key instead of asking for their username as well.
   *
   * @example
   * const me = await metamob.me();
   * const quests = await metamob.users.quests(me.username);
   */
  async me(options?: RequestOptions): Promise<Account> {
    return (await this.#rest.request<{ data: Account }>(METHODS["me.get"], {}, options)).data;
  }

  /**
   * A client that acts with another API key: the key of a user who entrusted
   * it to you. It shares this client's settings, cache, listeners and rate
   * limiter, and each key keeps its own window of 60 requests a minute.
   *
   * It is meant for bots and services that manage the quests of several
   * consenting players, not for getting around the rate limit.
   *
   * @example
   * const theirs = metamob.withKey(userApiKey);
   * const account = await theirs.me();
   * await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
   */
  withKey(apiKey: string): Metamob {
    return new Metamob({ ...this.#rest.options, apiKey }, this);
  }

  /**
   * Where the client's key stands against the rate limit, as counted by this
   * client. Undefined when the limiter is turned off.
   *
   * @example
   * const { remaining, resetsIn } = metamob.rateLimit ?? {};
   */
  get rateLimit(): RateLimitState | undefined {
    return this.#rest.rateLimit();
  }

  /**
   * Listens to what the client does: `request`, `response`, `retry`,
   * `rateLimit` and `error`. Returns a function that stops listening.
   *
   * @example
   * metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
   * metamob.on("retry", ({ method, attempt, error }) => console.warn(method, attempt, error.message));
   */
  on<K extends keyof ClientEvents>(event: K, listener: (payload: ClientEvents[K]) => void): () => void {
    return this.#rest.events.on(event, listener);
  }

  /** Like {@link Metamob.on}, for a single occurrence. */
  once<K extends keyof ClientEvents>(event: K, listener: (payload: ClientEvents[K]) => void): () => void {
    return this.#rest.events.once(event, listener);
  }

  /** Stops a listener added with {@link Metamob.on}. */
  off<K extends keyof ClientEvents>(event: K, listener: (payload: ClientEvents[K]) => void): void {
    this.#rest.events.off(event, listener);
  }

  /** Empties the cache, so the next reads go to the API. */
  async clearCache(): Promise<void> {
    await this.#rest.cacheStore?.clear?.();
  }
}
