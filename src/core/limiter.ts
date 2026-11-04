import { type Duration, sleep, toMs } from "./time.js";

/** Settings of the built-in rate limiter. */
export interface RateLimitOptions {
  /** Requests allowed per window, for each API key. Default 60. */
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
  sent: number[];
  blockedUntil: number;
  tail: Promise<unknown>;
}

const noop = () => {};

/** @internal */
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

  #wait(bucket: Bucket, now: number): number {
    const floor = now - this.window;
    let stale = 0;
    while (stale < bucket.sent.length && bucket.sent[stale]! <= floor) stale++;
    if (stale) bucket.sent.splice(0, stale);
    if (bucket.blockedUntil > now) return bucket.blockedUntil - now;
    if (bucket.sent.length >= this.limit) return bucket.sent[0]! + this.window - now;
    return 0;
  }

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
