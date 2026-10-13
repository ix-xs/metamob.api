import { VERSION } from "../generated/version.js";
import { type CacheEntry, type CacheOptions, type CacheStore, MemoryCache } from "./cache.js";
import { Emitter } from "./emitter.js";
import { MetamobApiError, MetamobArgumentError, MetamobRequestError } from "./errors.js";
import { type RateLimitOptions, type RateLimitState, RateLimiter } from "./limiter.js";
import { type Duration, sleep, toMs } from "./time.js";

/** Static description of one endpoint. The table of all of them is generated. */
export interface MethodSpec {
  /** Name of the method, for example `monsters.get`. */
  readonly id: string;
  readonly verb: "GET" | "PATCH";
  /** Path under the base URL, with `{placeholders}`. */
  readonly path: string;
  /**
   * `public` when the answer is the same for every API key (reference data),
   * `account` when it depends on the key.
   */
  readonly scope: "public" | "account";
  /** For a list the API paginates: its largest page, and whether it walks with a cursor. */
  readonly paged?: { readonly max: number; readonly cursor?: boolean };
}

/** Retry policy. */
export interface RetryOptions {
  /** Retries after the first attempt. Default 3. Use 0 to turn retries off. */
  attempts?: number | undefined;
  /** First delay, doubled on each retry. Default `"500ms"`. */
  delay?: Duration | undefined;
  /**
   * Upper bound of a single delay. Default `"60s"`, enough to sit out a full
   * rate limit window. When the API asks to wait longer (`Retry-After`), the
   * call is not retried: the error is thrown with its `retryAfter`.
   */
  maxDelay?: Duration | undefined;
}

/** Options accepted as the last argument of every API call. */
export interface RequestOptions {
  /**
   * Sends this call with another API key than the client's: the key of a
   * user who entrusted it to you, to act on their account. Each key has its
   * own rate limit window; do not rotate keys to get around the limit.
   */
  apiKey?: string | undefined;
  /** Cancels the call. */
  signal?: AbortSignal | undefined;
  /** Overrides the client's timeout for this call. */
  timeout?: Duration | undefined;
  /** Overrides the client's retry policy. `false` turns retries off. */
  retry?: RetryOptions | false | undefined;
  /** `false` skips the cache for this call, a duration overrides the freshness. */
  cache?: Duration | false | undefined;
  /** Extra headers. */
  headers?: Record<string, string> | undefined;
}

/** Events emitted by the client, see `metamob.on()`. */
export interface ClientEvents {
  /** A request is about to be sent. Fires once per attempt. */
  request: { method: string; verb: string; url: string; attempt: number };
  /** A call finished successfully. `cached` calls did not touch the network. */
  response: { method: string; status: number; duration: number; cached: boolean };
  /** A failed attempt will be retried after `delay` milliseconds. */
  retry: { method: string; attempt: number; delay: number; error: Error };
  /** The rate limiter held a call back for `delay` milliseconds to stay under the limit. */
  rateLimit: { method: string; delay: number };
  /** A listener of yours threw, or the cache store failed. Neither stops the call that was running. */
  error: unknown;
}

export interface RestOptions {
  apiKey?: string | undefined;
  fetch?: typeof fetch | undefined;
  baseUrl?: string | undefined;
  timeout?: Duration | undefined;
  retry?: RetryOptions | false | undefined;
  cache?: boolean | CacheOptions | undefined;
  rateLimit?: boolean | RateLimitOptions | undefined;
  headers?: Record<string, string> | undefined;
}

/** What a call sends: values of the path placeholders, query parameters and a JSON body. */
export interface RequestInput {
  path?: Record<string, string | number> | undefined;
  query?: Record<string, string | number | undefined> | undefined;
  body?: unknown;
}

export const DEFAULT_BASE_URL = "https://www.metamob.fr/api/v1";
const USER_AGENT = `metamob.api/${VERSION} (+https://github.com/ix-xs/metamob.api)`;

interface ResolvedRetry {
  attempts: number;
  delay: number;
  maxDelay: number;
}

interface ResolvedCache {
  store: CacheStore;
  ttl: number;
  methods: Record<string, Duration | false | undefined>;
}

/** What a client and the clients derived from it have in common. */
interface Shared {
  fetch: typeof fetch;
  events: Emitter<ClientEvents>;
  limiter: RateLimiter | undefined;
  cache: ResolvedCache | undefined;
  /** Identical reads in flight, so they share one request. */
  inflight: Map<string, Promise<unknown>>;
  /** Digest of each API key seen, for cache keys. */
  identities: Map<string, string>;
  /** Bumped when a key changes a quest: its cached account data is left behind. */
  generations: Map<string, number>;
}

function resolveRetry(base: ResolvedRetry, override: RetryOptions | false | undefined): ResolvedRetry {
  if (override === false) return { ...base, attempts: 0 };
  if (!override) return base;
  return {
    attempts: override.attempts ?? base.attempts,
    delay: override.delay !== undefined ? toMs(override.delay) : base.delay,
    maxDelay: override.maxDelay !== undefined ? toMs(override.maxDelay) : base.maxDelay,
  };
}

/** Seconds to wait according to a `Retry-After` header: a number of seconds or an HTTP date. */
export function retryAfterSeconds(header: string | null, now: number = Date.now()): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds > 0 ? seconds : undefined;
  const date = Date.parse(header);
  if (Number.isNaN(date)) return undefined;
  const wait = Math.ceil((date - now) / 1000);
  return wait > 0 ? wait : undefined;
}

/** Combines the caller's signal with a timeout. */
function withTimeout(signal: AbortSignal | undefined | null, ms: number): { signal: AbortSignal; timedOut: () => boolean; done: () => void } {
  const controller = new AbortController();
  let timedOut = false;
  const timer = ms > 0 && Number.isFinite(ms) ? setTimeout(() => ((timedOut = true), controller.abort()), ms) : undefined;
  const onAbort = () => controller.abort(signal!.reason);
  if (signal?.aborted) controller.abort(signal.reason);
  else signal?.addEventListener("abort", onAbort, { once: true });
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    done: () => {
      if (timer) clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

/** The API key of the environment, where there is one. */
function envKey(): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.METAMOB_API_KEY || undefined;
}

/**
 * The request pipeline shared by every resource: credentials, cache, rate
 * limit, timeout, retries and error mapping.
 *
 * @internal
 */
export class Rest {
  readonly options: RestOptions;
  readonly #shared: Shared;
  readonly #base: string;
  readonly #timeout: number;
  readonly #retry: ResolvedRetry;

  constructor(options: RestOptions, from?: Rest) {
    this.options = options;
    this.#base = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#timeout = toMs(options.timeout ?? "30s");
    this.#retry = resolveRetry({ attempts: 3, delay: 500, maxDelay: 60_000 }, options.retry);

    if (from) {
      // A derived client keeps the same rate limit windows, cache and listeners.
      this.#shared = from.#shared;
      return;
    }
    const custom = options.fetch;
    if (typeof (custom ?? globalThis.fetch) !== "function") {
      throw new MetamobArgumentError("No fetch implementation found. Use Node.js 20 or newer, or pass one with the `fetch` option.");
    }
    let cache: ResolvedCache | undefined;
    if (options.cache !== false) {
      const config: CacheOptions = options.cache === true || options.cache === undefined ? {} : options.cache;
      cache = { store: config.store ?? new MemoryCache(config.max), ttl: toMs(config.ttl ?? "10m"), methods: config.methods ?? {} };
    }
    this.#shared = {
      // Always called as a plain function: a native fetch refuses to run as a method of another object.
      fetch: custom ? (input, init) => custom(input, init) : (input, init) => globalThis.fetch(input, init),
      events: new Emitter<ClientEvents>(),
      limiter: options.rateLimit === false ? undefined : new RateLimiter(options.rateLimit === true || options.rateLimit === undefined ? {} : options.rateLimit),
      cache,
      inflight: new Map(),
      identities: new Map(),
      generations: new Map(),
    };
  }

  get events(): Emitter<ClientEvents> {
    return this.#shared.events;
  }

  get cacheStore(): CacheStore | undefined {
    return this.#shared.cache?.store;
  }

  /** The key a call goes out with: the call's, the client's, or the environment's. */
  apiKey(options?: RequestOptions): string {
    const key = options?.apiKey ?? this.options.apiKey ?? envKey();
    if (typeof key !== "string" || !key.trim()) {
      throw new MetamobArgumentError("No API key. Pass `apiKey` to the client or to the call, or set the METAMOB_API_KEY environment variable. A key is created on metamob.fr, in Settings > API key.", {
        code: "MISSING_API_KEY",
      });
    }
    return key.trim();
  }

  /** Where the key of a call stands against its rate limit. */
  rateLimit(options?: RequestOptions): RateLimitState | undefined {
    return this.#shared.limiter?.state(this.apiKey(options));
  }

  url(spec: MethodSpec, input: RequestInput): string {
    let url =
      this.#base +
      spec.path.replace(/\{(\w+)\}/g, (_, name: string) => {
        const value = input.path?.[name];
        if (value === undefined || value === "") throw new MetamobArgumentError(`${spec.id}: missing required parameter "${name}".`);
        return encodeURIComponent(String(value));
      });
    if (input.query) {
      let separator = "?";
      for (const name in input.query) {
        const value = input.query[name];
        if (value === undefined || value === "") continue;
        url += `${separator}${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`;
        separator = "&";
      }
    }
    return url;
  }

  #ttlFor(spec: MethodSpec, options: RequestOptions | undefined): number | false {
    const cache = this.#shared.cache;
    if (!cache || options?.cache === false) return false;
    if (options?.cache !== undefined) return toMs(options.cache);
    const own = cache.methods[spec.id];
    if (own === false) return false;
    if (own !== undefined) return toMs(own);
    return spec.scope === "public" ? cache.ttl : false;
  }

  /**
   * Who a cached answer belongs to: a digest of the API key, so two accounts
   * can never share an entry and no key reaches the store. Undefined when the
   * runtime cannot hash, in which case account data is not cached.
   */
  async #identity(key: string): Promise<string | undefined> {
    const { identities, generations } = this.#shared;
    let id = identities.get(key);
    if (!id) {
      const subtle = globalThis.crypto?.subtle;
      if (!subtle) return undefined;
      const digest = await subtle.digest("SHA-256", new TextEncoder().encode(key));
      id = [...new Uint8Array(digest).subarray(0, 12)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      if (identities.size >= 1_000) identities.clear();
      identities.set(key, id);
    }
    return `${id}.${generations.get(key) ?? 0}`;
  }

  /** A cache that fails must never fail the call it was meant to speed up. */
  async #cacheGet(key: string): Promise<CacheEntry | undefined> {
    try {
      return await this.#shared.cache!.store.get(key);
    } catch (error) {
      this.#shared.events.emit("error", error);
      return undefined;
    }
  }

  async #cacheSet(key: string, entry: CacheEntry): Promise<void> {
    try {
      await this.#shared.cache!.store.set(key, entry);
    } catch (error) {
      this.#shared.events.emit("error", error);
    }
  }

  /** Runs one endpoint and resolves to its parsed JSON body. */
  async request<T>(spec: MethodSpec, input: RequestInput = {}, options?: RequestOptions): Promise<T> {
    const key = this.apiKey(options);
    const url = this.url(spec, input);
    const shared = this.#shared;

    if (spec.verb !== "GET") {
      const result = await this.#send<T>(spec, url, key, input.body, options);
      // The account just changed: what was cached for it is out of date.
      shared.generations.set(key, (shared.generations.get(key) ?? 0) + 1);
      return result;
    }

    const ttl = this.#ttlFor(spec, options);
    let cacheKey: string | undefined;
    if (ttl !== false) {
      const identity = spec.scope === "public" ? "public" : await this.#identity(key);
      if (identity !== undefined) {
        cacheKey = `${identity}:${url}`;
        const entry = await this.#cacheGet(cacheKey);
        if (entry && entry.expires > Date.now()) {
          shared.events.emit("response", { method: spec.id, status: 200, duration: 0, cached: true });
          return entry.value as T;
        }
      }
    }

    // Identical reads fired at the same time share one request. Reference
    // data is the same for every key, so it is shared across keys too.
    const shareable = !options?.signal;
    const flight = `${spec.scope === "public" ? "" : key}\n${url}`;
    if (shareable) {
      const pending = shared.inflight.get(flight);
      if (pending) return pending as Promise<T>;
    }

    const sent = this.#send<T>(spec, url, key, undefined, options);
    const run = cacheKey === undefined ? sent : sent.then(async (value) => (await this.#cacheSet(cacheKey, { value, expires: Date.now() + (ttl as number) }), value));
    if (shareable) {
      shared.inflight.set(flight, run);
      const clear = () => shared.inflight.delete(flight);
      run.then(clear, clear);
    }
    return run;
  }

  #headers(key: string, hasBody: boolean, options: RequestOptions | undefined): Record<string, string> {
    const headers: Record<string, string> = { accept: "application/json", "user-agent": USER_AGENT };
    if (hasBody) headers["content-type"] = "application/json";
    // Lower-cased, so a header given by the caller and one set here are the same key.
    for (const source of [this.options.headers, options?.headers]) {
      if (source) for (const name in source) headers[name.toLowerCase()] = source[name]!;
    }
    headers.authorization = `Bearer ${key}`;
    return headers;
  }

  async #pause(ms: number, signal: AbortSignal | undefined, method: string): Promise<void> {
    try {
      await sleep(ms, signal);
    } catch (cause) {
      throw new MetamobRequestError("ABORTED", method, "the request was aborted.", { cause });
    }
  }

  async #send<T>(spec: MethodSpec, url: string, key: string, body: unknown, options: RequestOptions | undefined): Promise<T> {
    const { events, limiter } = this.#shared;
    const retry = resolveRetry(this.#retry, options?.retry);
    const timeout = options?.timeout !== undefined ? toMs(options.timeout) : this.#timeout;
    const headers = this.#headers(key, body !== undefined, options);
    const payload = body === undefined ? null : JSON.stringify(body);
    const signal = options?.signal;

    for (let attempt = 0; ; attempt++) {
      if (signal?.aborted) throw new MetamobRequestError("ABORTED", spec.id, "the request was aborted.", { cause: signal.reason });
      if (limiter) {
        let waited: number;
        try {
          waited = await limiter.acquire(key, signal);
        } catch (cause) {
          throw new MetamobRequestError("ABORTED", spec.id, "the request was aborted.", { cause });
        }
        if (waited > 0) events.emit("rateLimit", { method: spec.id, delay: waited });
      }

      events.emit("request", { method: spec.id, verb: spec.verb, url, attempt });
      const started = Date.now();
      const timer = withTimeout(signal, timeout);
      let response: Response;
      let text: string;
      try {
        response = await this.#shared.fetch(url, { method: spec.verb, headers, body: payload, signal: timer.signal });
        text = await response.text();
      } catch (cause) {
        timer.done();
        if (signal?.aborted) throw new MetamobRequestError("ABORTED", spec.id, "the request was aborted.", { cause });
        const error = timer.timedOut()
          ? new MetamobRequestError("TIMEOUT", spec.id, `no answer after ${timeout} ms.`, { cause })
          : new MetamobRequestError("NETWORK", spec.id, cause instanceof Error ? cause.message : String(cause), { cause });
        if (attempt >= retry.attempts) throw error;
        const delay = Math.min(retry.maxDelay, retry.delay * 2 ** attempt);
        events.emit("retry", { method: spec.id, attempt: attempt + 1, delay, error });
        await this.#pause(delay, signal, spec.id);
        continue;
      }
      timer.done();

      if (response.ok) {
        let value: unknown;
        if (text) {
          try {
            value = JSON.parse(text);
          } catch (cause) {
            throw new MetamobRequestError("PARSE_ERROR", spec.id, "the response is not valid JSON.", { cause });
          }
        }
        events.emit("response", { method: spec.id, status: response.status, duration: Date.now() - started, cached: false });
        return value as T;
      }

      const error = apiError(spec, url, response, text);
      const status = response.status;
      // Every write of this API sets a value, so sending one twice is harmless.
      // A plain 500 on a write is not retried: it is more likely to be the request itself.
      const retryable = status === 429 || status === 502 || status === 503 || status === 504 || (status === 500 && spec.verb === "GET");
      let delay = Math.min(retry.maxDelay, retry.delay * 2 ** attempt);
      let held = false;
      if (status === 429) {
        const asked = error.retryAfter !== undefined ? error.retryAfter * 1000 : delay;
        // The limiter holds this key back, for this call and for every other one.
        limiter?.block(key, asked);
        held = limiter !== undefined;
        if (asked > retry.maxDelay) throw error;
        delay = asked;
      }
      if (!retryable || attempt >= retry.attempts) throw error;
      events.emit("retry", { method: spec.id, attempt: attempt + 1, delay, error });
      if (!held) await this.#pause(delay, signal, spec.id);
    }
  }
}

/** Builds the error for a non-2xx answer. The API has several body shapes; all of them are read. */
function apiError(spec: MethodSpec, url: string, response: Response, text: string): MetamobApiError {
  let body: unknown = text || undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON: an HTML error page from a proxy, for instance. Kept as text.
    }
  }
  const messages: Record<string, string> = {};
  let message: string | undefined;
  if (body && typeof body === "object") {
    const record = body as { message?: unknown; messages?: unknown; error?: unknown };
    if (record.messages && typeof record.messages === "object") {
      for (const [field, value] of Object.entries(record.messages as Record<string, unknown>)) {
        if (typeof value === "string" && value) messages[field] = value;
      }
    }
    if (typeof record.message === "string" && record.message) message = record.message;
    else if (messages.error) message = messages.error;
    else if (Object.keys(messages).length) message = Object.entries(messages).map(([field, value]) => `${field}: ${value}`).join("; ");
    else if (typeof record.error === "string" && record.error) message = record.error;
  }
  return new MetamobApiError({
    status: response.status,
    message: message ?? (response.statusText || `HTTP ${response.status}`),
    method: spec.id,
    url,
    messages,
    retryAfter: retryAfterSeconds(response.headers.get("retry-after")),
    body,
  });
}
