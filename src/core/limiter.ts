import { type Duration, sleep, toMs } from "./time.js";

/** Settings of the built-in rate limiter. */
export interface RateLimitOptions {
  /** Requests allowed per window, for each API key. Default 60, which is what the API allows. */
  requests?: number | undefined;
  /** Length of the window. Default `"1m"`. */
  per?: Duration | undefined;
}

/** Where an API key stands against its rate limit, as counted by this client. */
export interface RateLimitState {
  /** Requests allowed per window. */
  limit: number;
  /** Requests that can still be sent right now without waiting. */
  remaining: number;
  /** Milliseconds until the next request can leave. 0 when one can leave now. */
  resetsIn: number;
}

interface Bucket {
  /** Send times of the current window, oldest first. */
  sent: number[];
  /** No request leaves before this time. Set when the API answers 429. */
  blockedUntil: number;
  /** Waiters proceed in the order they arrived. */
  tail: Promise<unknown>;
}

const noop = () => {};

/**
 * A sliding-window limiter, one window per API key. It holds calls back so
 * the limit of the API is never reached, instead of letting them fail with
 * 429 and retrying.
 *
 * @internal
 */
export class RateLimiter {
  readonly limit: number;
  readonly window: number;
  readonly #buckets = new Map<string, Bucket>();

  constructor(options: RateLimitOptions = {}) {
    this.limit = Math.max(1, Math.floor(options.requests ?? 60));
    this.window = Math.max(1, toMs(options.per ?? "1m"));
  }

  #bucket(key: string): Bucket {
    let bucket = this.#buckets.get(key);
    if (!bucket) {
      // A long-running process that sees many keys does not keep them all forever.
      if (this.#buckets.size >= 1_000) this.#sweep();
      this.#buckets.set(key, (bucket = { sent: [], blockedUntil: 0, tail: Promise.resolve() }));
    }
    return bucket;
  }

  #sweep(): void {
    const now = Date.now();
    for (const [key, bucket] of this.#buckets) {
      const last = bucket.sent[bucket.sent.length - 1] ?? 0;
      if (last + this.window < now && bucket.blockedUntil < now) this.#buckets.delete(key);
    }
  }

  /** Time to wait before a request may leave, 0 when it may leave now. */
  #wait(bucket: Bucket, now: number): number {
    const floor = now - this.window;
    let stale = 0;
    while (stale < bucket.sent.length && bucket.sent[stale]! <= floor) stale++;
    if (stale) bucket.sent.splice(0, stale);
    if (bucket.blockedUntil > now) return bucket.blockedUntil - now;
    if (bucket.sent.length >= this.limit) return bucket.sent[0]! + this.window - now;
    return 0;
  }

  /**
   * Resolves when a request may be sent with `key`, and counts it. Resolves
   * to the milliseconds spent waiting. Rejects with the signal's reason if it
   * aborts first.
   */
  acquire(key: string, signal?: AbortSignal | null): Promise<number> {
    const bucket = this.#bucket(key);
    const turn = bucket.tail.then(async () => {
      let waited = 0;
      for (;;) {
        const now = Date.now();
        const wait = this.#wait(bucket, now);
        if (wait <= 0) {
          bucket.sent.push(now);
          return waited;
        }
        await sleep(wait, signal);
        waited += wait;
      }
    });
    bucket.tail = turn.then(noop, noop);
    return turn;
  }

  /** Holds every request of `key` back for `ms`. Called when the API says it had too many. */
  block(key: string, ms: number): void {
    const bucket = this.#bucket(key);
    bucket.blockedUntil = Math.max(bucket.blockedUntil, Date.now() + ms);
  }

  state(key: string): RateLimitState {
    const bucket = this.#buckets.get(key);
    if (!bucket) return { limit: this.limit, remaining: this.limit, resetsIn: 0 };
    const now = Date.now();
    const resetsIn = Math.max(0, this.#wait(bucket, now));
    const blocked = bucket.blockedUntil > now;
    return { limit: this.limit, remaining: blocked ? 0 : Math.max(0, this.limit - bucket.sent.length), resetsIn };
  }
}
