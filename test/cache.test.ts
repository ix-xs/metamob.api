import { describe, expect, it } from "vitest";
import { type CacheEntry, type CacheStore, MemoryCache } from "../src/index.js";
import { client, json } from "./helpers.js";

const SERVERS = { data: [{ id: 12, name: "Draconiros", community: "World", game_version: { id: 1, name: "Dofus (Unity)" } }] };
const QUESTS = { data: [{ slug: "a1b2c3d4" }] };

describe("cache", () => {
  it("keeps reference data by default and marks cached responses", async () => {
    const { metamob, calls } = client(SERVERS);
    const cached: boolean[] = [];
    metamob.on("response", (event) => cached.push(event.cached));
    await metamob.servers.list();
    await metamob.servers.list();
    expect(calls).toHaveLength(1);
    expect(cached).toEqual([false, true]);
  });

  it("shares reference data across API keys, since it is the same for all", async () => {
    const { metamob, calls } = client(SERVERS);
    await metamob.servers.list();
    await metamob.servers.list({ apiKey: "another-key" });
    await metamob.withKey("a-third-key").servers.list();
    expect(calls).toHaveLength(1);
  });

  it("does not cache account data unless asked", async () => {
    const { metamob, calls } = client(QUESTS);
    await metamob.quests.list();
    await metamob.quests.list();
    expect(calls).toHaveLength(2);
  });

  it("caches account data per key when a method is listed, and drops it after a write", async () => {
    const { metamob, calls } = client((call) => (call.method === "PATCH" ? { data: { slug: "a1b2c3d4" } } : QUESTS), { cache: { methods: { "quests.list": "1m" } } });
    await metamob.quests.list();
    await metamob.quests.list();
    expect(calls).toHaveLength(1);

    // Another account never reads the first one's entries.
    await metamob.quests.list({ apiKey: "their-key" });
    expect(calls).toHaveLength(2);

    await metamob.quests.update("a1b2c3d4", { current_step: 3 });
    await metamob.quests.list();
    expect(calls).toHaveLength(4);
    // The other account wrote nothing: its entry is still good.
    await metamob.quests.list({ apiKey: "their-key" });
    expect(calls).toHaveLength(4);
  });

  it("follows per-method settings and per-call overrides", async () => {
    const { metamob, calls } = client(SERVERS, { cache: { methods: { "servers.list": false } } });
    await metamob.servers.list();
    await metamob.servers.list();
    expect(calls).toHaveLength(2);

    await metamob.servers.list({ cache: "1m" });
    await metamob.servers.list({ cache: "1m" });
    expect(calls).toHaveLength(3);

    const fresh = client(SERVERS);
    await fresh.metamob.servers.list();
    await fresh.metamob.servers.list({ cache: false });
    expect(fresh.calls).toHaveLength(2);
  });

  it("expires entries and can be cleared or turned off", async () => {
    const short = client(SERVERS, { cache: { ttl: 15 } });
    await short.metamob.servers.list();
    await new Promise((resolve) => setTimeout(resolve, 30));
    await short.metamob.servers.list();
    expect(short.calls).toHaveLength(2);

    const cleared = client(SERVERS);
    await cleared.metamob.servers.list();
    await cleared.metamob.clearCache();
    await cleared.metamob.servers.list();
    expect(cleared.calls).toHaveLength(2);

    const off = client(SERVERS, { cache: false });
    await off.metamob.servers.list();
    await off.metamob.servers.list();
    expect(off.calls).toHaveLength(2);
    await expect(off.metamob.clearCache()).resolves.toBeUndefined();
  });

  it("does not cache failures", async () => {
    const { metamob, calls } = client([json({ message: "down" }, 503), SERVERS], { retry: false });
    await expect(metamob.servers.list()).rejects.toMatchObject({ status: 503 });
    await expect(metamob.servers.list()).resolves.toHaveLength(1);
    expect(calls).toHaveLength(2);
  });

  it("shares one request between identical reads in flight", async () => {
    const { metamob, calls } = client(async () => (await new Promise((resolve) => setTimeout(resolve, 10)), QUESTS));
    const [a, b, other] = await Promise.all([metamob.quests.list(), metamob.quests.list(), metamob.quests.list({ apiKey: "their-key" })]);
    expect(a).toBe(b);
    expect(other).not.toBe(a);
    expect(calls).toHaveLength(2);
  });

  it("uses a custom store, and a store that fails never fails the call", async () => {
    const entries = new Map<string, CacheEntry>();
    const store: CacheStore = { get: (key) => entries.get(key), set: (key, entry) => void entries.set(key, entry) };
    const custom = client(SERVERS, { cache: { store } });
    await custom.metamob.servers.list();
    await custom.metamob.servers.list();
    expect(custom.calls).toHaveLength(1);
    expect([...entries.keys()]).toEqual(["public:https://www.metamob.fr/api/v1/servers"]);
    // No key ever reaches the store.
    expect(JSON.stringify([...entries])).not.toContain("test-key");

    const broken: CacheStore = {
      get: () => {
        throw new Error("redis is down");
      },
      set: () => Promise.reject(new Error("redis is down")),
    };
    const failing = client(SERVERS, { cache: { store: broken } });
    const errors: unknown[] = [];
    failing.metamob.on("error", (error) => errors.push(error));
    await expect(failing.metamob.servers.list()).resolves.toHaveLength(1);
    expect(errors).toHaveLength(2);
  });
});

describe("MemoryCache", () => {
  it("drops the least recently used entry once full", () => {
    const cache = new MemoryCache(2);
    cache.set("a", { value: 1, expires: 0 });
    cache.set("b", { value: 2, expires: 0 });
    cache.get("a");
    cache.set("c", { value: 3, expires: 0 });
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")?.value).toBe(1);
    expect(cache.size).toBe(2);
    cache.delete("a");
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
