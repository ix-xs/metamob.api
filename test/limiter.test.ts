import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiter } from "../src/core/limiter.js";
import { Metamob } from "../src/index.js";
import { apiError, mockFetch } from "./helpers.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("RateLimiter", () => {
  it("lets the first requests through and holds the next ones until the window slides", async () => {
    const limiter = new RateLimiter({ requests: 3, per: 1000 });
    const sent: number[] = [];
    const start = Date.now();
    const all = Promise.all(Array.from({ length: 7 }, (_, index) => limiter.acquire("key").then(() => sent.push(index) && Date.now() - start)));
    await vi.advanceTimersByTimeAsync(0);
    expect(sent).toEqual([0, 1, 2]);
    await vi.advanceTimersByTimeAsync(999);
    expect(sent).toEqual([0, 1, 2]);
    await vi.advanceTimersByTimeAsync(1);
    expect(sent).toEqual([0, 1, 2, 3, 4, 5]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await all).toEqual([0, 0, 0, 1000, 1000, 1000, 2000]);
  });

  it("gives each key its own window", async () => {
    const limiter = new RateLimiter({ requests: 1, per: "1s" });
    const done: string[] = [];
    void limiter.acquire("a").then(() => done.push("a1"));
    void limiter.acquire("a").then(() => done.push("a2"));
    void limiter.acquire("b").then(() => done.push("b1"));
    await vi.advanceTimersByTimeAsync(0);
    expect(done.sort()).toEqual(["a1", "b1"]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(done).toContain("a2");
  });

  it("reports where a key stands", async () => {
    const limiter = new RateLimiter({ requests: 2, per: 1000 });
    expect(limiter.state("key")).toEqual({ limit: 2, remaining: 2, resetsIn: 0 });
    await limiter.acquire("key");
    expect(limiter.state("key")).toEqual({ limit: 2, remaining: 1, resetsIn: 0 });
    await limiter.acquire("key");
    expect(limiter.state("key")).toEqual({ limit: 2, remaining: 0, resetsIn: 1000 });
    await vi.advanceTimersByTimeAsync(400);
    expect(limiter.state("key").resetsIn).toBe(600);
    await vi.advanceTimersByTimeAsync(600);
    expect(limiter.state("key")).toEqual({ limit: 2, remaining: 2, resetsIn: 0 });
  });

  it("holds a key back when told to", async () => {
    const limiter = new RateLimiter({ requests: 10, per: 1000 });
    limiter.block("key", 5000);
    expect(limiter.state("key")).toMatchObject({ remaining: 0, resetsIn: 5000 });
    let through = false;
    void limiter.acquire("key").then(() => (through = true));
    await vi.advanceTimersByTimeAsync(4999);
    expect(through).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(through).toBe(true);
  });

  it("frees the queue when a waiter is cancelled", async () => {
    const limiter = new RateLimiter({ requests: 1, per: 1000 });
    await limiter.acquire("key");
    const controller = new AbortController();
    const cancelled = limiter.acquire("key", controller.signal).catch((reason: unknown) => reason);
    let next = false;
    void limiter.acquire("key").then(() => (next = true));
    controller.abort(new Error("stop"));
    expect(await cancelled).toMatchObject({ message: "stop" });
    await vi.advanceTimersByTimeAsync(1000);
    expect(next).toBe(true);
  });
});

describe("the client's rate limiter", () => {
  it("is on by default at 60 a minute and reports waits", async () => {
    const { fetch, calls } = mockFetch({ data: [] });
    const metamob = new Metamob({ apiKey: "k", fetch, cache: false });
    expect(metamob.rateLimit).toEqual({ limit: 60, remaining: 60, resetsIn: 0 });
    const waits: number[] = [];
    metamob.on("rateLimit", ({ delay }) => waits.push(delay));

    const all = Promise.all(Array.from({ length: 61 }, (_, index) => metamob.quests.get(`slug-${index}`)));
    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toHaveLength(60);
    expect(metamob.rateLimit).toMatchObject({ remaining: 0 });
    await vi.advanceTimersByTimeAsync(60_000);
    await all;
    expect(calls).toHaveLength(61);
    expect(waits).toEqual([60_000]);
  });

  it("can be tuned or turned off", async () => {
    const { fetch, calls } = mockFetch({ data: [] });
    const slow = new Metamob({ apiKey: "k", fetch, cache: false, rateLimit: { requests: 1, per: "10s" } });
    void slow.quests.list();
    void slow.quests.get("a");
    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(calls).toHaveLength(2);

    const off = new Metamob({ apiKey: "k", fetch, rateLimit: false });
    expect(off.rateLimit).toBeUndefined();
  });

  it("holds every call of a key after a 429, and leaves other keys alone", async () => {
    const { fetch, calls } = mockFetch((call) => (calls.length === 1 ? apiError(429, "Too many requests", { "retry-after": "30" }) : { data: { url: call.path } }));
    const metamob = new Metamob({ apiKey: "k", fetch, cache: false });
    const first = metamob.quests.get("a");
    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toHaveLength(1);

    const second = metamob.quests.get("b");
    const other = metamob.quests.get("c", { apiKey: "other" });
    await vi.advanceTimersByTimeAsync(0);
    // The other key went through; the blocked key waits for the 30 seconds asked.
    expect(calls.map((call) => call.path)).toEqual(["/quests/a", "/quests/c"]);
    await other;
    await vi.advanceTimersByTimeAsync(30_000);
    await Promise.all([first, second]);
    expect(calls.map((call) => call.path)).toEqual(["/quests/a", "/quests/c", "/quests/a", "/quests/b"]);
  });
});
