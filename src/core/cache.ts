import type { MethodId } from "../generated/methods.js";
import type { Duration } from "./time.js";

/** What the client stores for one cached response. */
export interface CacheEntry {
  /** Parsed response body. */
  value: unknown;
  /** Timestamp (ms) after which the entry is stale. */
  expires: number;
}

/**
 * Where cached responses live. The built-in store keeps them in memory;
 * implement this interface to back the cache with Redis, a KV namespace or a
 * file. Methods may be synchronous or return promises.
 */
export interface CacheStore {
  /** The entry stored under `key`, expired or not: the client checks `expires`. */
  get(key: string): CacheEntry | undefined | Promise<CacheEntry | undefined>;
  /** Stores an entry. */
  set(key: string, entry: CacheEntry): void | Promise<void>;
  /** Removes one entry. Optional: the client never calls it, it is there for your own invalidation. */
  delete?(key: string): void | Promise<void>;
  /** Removes everything. Called by `metamob.clearCache()` when present. */
  clear?(): void | Promise<void>;
}

/** Cache settings of the client. */
export interface CacheOptions {
  /**
   * How long reference data stays fresh: monsters, zones, servers, game
   * versions, monster types, quest types and quest templates. These change
   * only when the game does. Default `"10m"`.
   */
  ttl?: Duration | undefined;
  /** Entries kept by the in-memory store before the least recently used is dropped. Default 500. */
  max?: number | undefined;
  /** Custom storage. */
  store?: CacheStore | undefined;
  /**
   * Freshness per method, for example
   * `{ "monsters.get": "1d", "users.get": "30s", "zones.list": false }`.
   *
   * Reference data follows `ttl` unless listed here. Everything tied to an
   * account (users, quests, conversations, Kralamoure events) is not cached
   * unless listed here; its entries are kept apart per API key and are
   * dropped as soon as that key changes a quest.
   */
  methods?: Partial<Record<MethodId, Duration | false>> | undefined;
}

/** In-memory store that drops the least recently used entry once full. */
export class MemoryCache implements CacheStore {
  readonly #entries = new Map<string, CacheEntry>();
  readonly #max: number;

  constructor(max = 500) {
    this.#max = Math.max(1, max);
  }

  /** Entries currently held, expired ones included until they are replaced or evicted. */
  get size(): number {
    return this.#entries.size;
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;
    // Re-insert to mark the entry as recently used.
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry;
  }

  set(key: string, entry: CacheEntry): void {
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    if (this.#entries.size > this.#max) {
      const oldest = this.#entries.keys().next().value;
      if (oldest !== undefined) this.#entries.delete(oldest);
    }
  }

  delete(key: string): void {
    this.#entries.delete(key);
  }

  clear(): void {
    this.#entries.clear();
  }
}
