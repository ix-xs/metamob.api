import { afterEach, describe, expect, it, vi } from "vitest";
import { Metamob, MetamobApiError, MetamobArgumentError, MetamobRequestError, VERSION, isMetamobError } from "../src/index.js";
import { apiError, client, json, mockFetch } from "./helpers.js";

const ACCOUNT = { data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-01-27T14:22:00Z" } };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("credentials", () => {
  it("sends the key as a bearer token, never in the URL", async () => {
    const { metamob, calls } = client(ACCOUNT);
    const me = await metamob.me();
    expect(me.username).toBe("Ix-xs");
    expect(calls[0]!.headers.get("authorization")).toBe("Bearer test-key");
    expect(calls[0]!.url.href).toBe("https://www.metamob.fr/api/v1/me");
    expect(calls[0]!.headers.get("accept")).toBe("application/json");
    expect(calls[0]!.headers.get("user-agent")).toContain(`metamob.api/${VERSION}`);
  });

  it("accepts the key alone as a string", async () => {
    const { fetch, calls } = mockFetch(ACCOUNT);
    await new Metamob({ apiKey: "  spaced-key  ", fetch, rateLimit: false }).me();
    expect(calls[0]!.headers.get("authorization")).toBe("Bearer spaced-key");
  });

  it("falls back on METAMOB_API_KEY", async () => {
    vi.stubEnv("METAMOB_API_KEY", "env-key");
    const { fetch, calls } = mockFetch(ACCOUNT);
    await new Metamob({ fetch, rateLimit: false }).me();
    expect(calls[0]!.headers.get("authorization")).toBe("Bearer env-key");
  });

  it("refuses to send anything without a key", async () => {
    vi.stubEnv("METAMOB_API_KEY", "");
    const { fetch, calls } = mockFetch(ACCOUNT);
    const error = await new Metamob({ fetch }).me().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(MetamobArgumentError);
    expect(isMetamobError(error, "MISSING_API_KEY")).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it("rejects an empty key at construction", () => {
    expect(() => new Metamob({ apiKey: " " })).toThrow(MetamobArgumentError);
    expect(() => new Metamob(null as never)).toThrow(MetamobArgumentError);
  });

  it("lets one call bring its own key", async () => {
    const { metamob, calls } = client(ACCOUNT);
    await metamob.me({ apiKey: "their-key" });
    await metamob.me();
    expect(calls.map((call) => call.headers.get("authorization"))).toEqual(["Bearer their-key", "Bearer test-key"]);
  });

  it("derives a client for another key that shares listeners", async () => {
    const { metamob, calls } = client(ACCOUNT);
    const seen: string[] = [];
    metamob.on("request", ({ method }) => seen.push(method));
    const theirs = metamob.withKey("their-key");
    await theirs.me();
    await theirs.quests.list();
    expect(calls.every((call) => call.headers.get("authorization") === "Bearer their-key")).toBe(true);
    expect(seen).toEqual(["me.get", "quests.list"]);
  });

  it("uses a custom base URL and custom headers", async () => {
    const { metamob, calls } = client(ACCOUNT, { baseUrl: "https://staging.example/api/v9/", headers: { "X-Trace": "a" } });
    await metamob.me({ headers: { "x-trace": "b", Authorization: "Bearer nope" } });
    expect(calls[0]!.url.href).toBe("https://staging.example/api/v9/me");
    expect(calls[0]!.headers.get("x-trace")).toBe("b");
    // The key always wins over a header of the same name.
    expect(calls[0]!.headers.get("authorization")).toBe("Bearer test-key");
  });

  it("drops any number of trailing slashes from the base URL, in linear time", async () => {
    const slashes = "/".repeat(100_000);
    const started = performance.now();
    const { metamob, calls } = client(ACCOUNT, { baseUrl: `https://staging.example/api${slashes}` });
    expect(performance.now() - started).toBeLessThan(200);
    await metamob.me();
    expect(calls[0]!.url.href).toBe("https://staging.example/api/me");
  });
});

describe("errors", () => {
  it("maps a 404 and reads the message of the API", async () => {
    const { metamob } = client(apiError(404, "Quest not found"));
    const error = (await metamob.quests.get("nope").catch((caught: unknown) => caught)) as MetamobApiError;
    expect(error).toBeInstanceOf(MetamobApiError);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.isNotFound).toBe(true);
    expect(error.status).toBe(404);
    expect(error.method).toBe("quests.get");
    expect(error.message).toBe("quests.get: Quest not found");
    expect(error.messages).toEqual({ error: "Quest not found" });
    expect(error.url).toBe("https://www.metamob.fr/api/v1/quests/nope");
  });

  it("reads the other body shapes: a plain message, field messages, nothing", async () => {
    const unauthorized = (await client(json({ message: "The access token is invalid." }, 401))
      .metamob.me()
      .catch((caught: unknown) => caught)) as MetamobApiError;
    expect(unauthorized.isUnauthorized).toBe(true);
    expect(unauthorized.message).toContain("The access token is invalid.");

    const refused = (await client(json({ status: 400, error: 400, messages: { quantity: "must be between 0 and 30", current_step: "too high" } }, 400))
      .metamob.quests.setMonster("slug", 20, 5)
      .catch((caught: unknown) => caught)) as MetamobApiError;
    expect(refused.code).toBe("BAD_REQUEST");
    expect(refused.messages.quantity).toBe("must be between 0 and 30");
    expect(refused.message).toContain("quantity: must be between 0 and 30; current_step: too high");

    const empty = (await client(new Response('""', { status: 500, statusText: "Internal Server Error" }), { retry: false })
      .metamob.questTypes.list()
      .catch((caught: unknown) => caught)) as MetamobApiError;
    expect(empty.code).toBe("SERVER_ERROR");
    expect(empty.message).toBe("questTypes.list: Internal Server Error");

    const html = (await client(new Response("<html>Bad gateway</html>", { status: 502 }), { retry: false })
      .metamob.servers.list()
      .catch((caught: unknown) => caught)) as MetamobApiError;
    expect(html.status).toBe(502);
    expect(html.body).toBe("<html>Bad gateway</html>");
  });

  it("reports a body that is not JSON", async () => {
    const error = await client(new Response("not json", { status: 200 }))
      .metamob.me()
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(MetamobRequestError);
    expect(isMetamobError(error, "PARSE_ERROR")).toBe(true);
  });
});

describe("retries", () => {
  it("retries a rate limit after the delay the API asks for", async () => {
    const { metamob, calls } = client([apiError(429, "Too many requests", { "retry-after": "0.01" }), ACCOUNT], { retry: { delay: 1, maxDelay: 1000 } });
    const retries: number[] = [];
    metamob.on("retry", ({ delay }) => retries.push(delay));
    await expect(metamob.me()).resolves.toMatchObject({ username: "Ix-xs" });
    expect(calls).toHaveLength(2);
    expect(retries).toEqual([10]);
  });

  it("gives up when the API asks to wait longer than maxDelay, with the delay on the error", async () => {
    const { metamob, calls } = client(apiError(429, "Too many requests", { "retry-after": "120" }), { retry: { maxDelay: "1s" } });
    const error = (await metamob.me().catch((caught: unknown) => caught)) as MetamobApiError;
    expect(error.isRateLimited).toBe(true);
    expect(error.retryAfter).toBe(120);
    expect(calls).toHaveLength(1);
  });

  it("retries server errors on reads, up to the configured attempts", async () => {
    const { metamob, calls } = client([apiError(503, "down"), apiError(500, "oops"), ACCOUNT]);
    await metamob.me();
    expect(calls).toHaveLength(3);

    const failing = client(apiError(503, "down"), { retry: { attempts: 2, delay: 1 } });
    await expect(failing.metamob.me()).rejects.toMatchObject({ code: "SERVER_ERROR" });
    expect(failing.calls).toHaveLength(3);
  });

  it("does not replay a write on a plain 500, but does on a 503", async () => {
    const plain = client(apiError(500, "oops"));
    await expect(plain.metamob.quests.setMonster("slug", 20, 1)).rejects.toMatchObject({ status: 500 });
    expect(plain.calls).toHaveLength(1);

    const unavailable = client([apiError(503, "down"), { data: { monster_id: 20, quantity: 1 } }]);
    await unavailable.metamob.quests.setMonster("slug", 20, 1);
    expect(unavailable.calls).toHaveLength(2);
  });

  it("does not retry what cannot succeed", async () => {
    for (const status of [400, 401, 403, 404]) {
      const { metamob, calls } = client(apiError(status, "no"));
      await expect(metamob.me()).rejects.toBeInstanceOf(MetamobApiError);
      expect(calls).toHaveLength(1);
    }
  });

  it("retries network failures and reports them when they persist", async () => {
    let attempts = 0;
    const { metamob } = client(() => {
      if (attempts++ < 2) throw new TypeError("fetch failed");
      return ACCOUNT;
    });
    await expect(metamob.me()).resolves.toMatchObject({ username: "Ix-xs" });

    const down = client(
      () => {
        throw new TypeError("fetch failed");
      },
      { retry: false },
    );
    const error = (await down.metamob.me().catch((caught: unknown) => caught)) as MetamobRequestError;
    expect(error).toBeInstanceOf(MetamobRequestError);
    expect(error.code).toBe("NETWORK");
    expect(error.method).toBe("me.get");
    expect(error.cause).toBeInstanceOf(TypeError);
  });

  it("can turn retries off for one call", async () => {
    const { metamob, calls } = client(apiError(503, "down"));
    await expect(metamob.me({ retry: false })).rejects.toMatchObject({ status: 503 });
    expect(calls).toHaveLength(1);
  });
});

describe("timeouts and cancellation", () => {
  const hanging = (_: unknown, init: RequestInit = {}) =>
    new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal!.reason ?? new DOMException("Aborted", "AbortError")));
    });

  it("times out an attempt that hangs", async () => {
    const metamob = new Metamob({ apiKey: "k", fetch: hanging as typeof fetch, timeout: 20, retry: false, rateLimit: false });
    await expect(metamob.me()).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("stops when the caller aborts, without retrying", async () => {
    let calls = 0;
    const counting = ((input: unknown, init: RequestInit) => (calls++, hanging(input, init))) as typeof fetch;
    const metamob = new Metamob({ apiKey: "k", fetch: counting, rateLimit: false });
    const controller = new AbortController();
    const pending = metamob.me({ signal: controller.signal });
    setTimeout(() => controller.abort(), 10);
    await expect(pending).rejects.toMatchObject({ code: "ABORTED" });
    expect(calls).toBe(1);

    await expect(metamob.me({ signal: AbortSignal.abort() })).rejects.toMatchObject({ code: "ABORTED" });
    expect(calls).toBe(1);
  });
});

describe("events", () => {
  it("reports requests and responses, and survives a listener that throws", async () => {
    const { metamob } = client(ACCOUNT);
    const log: string[] = [];
    const errors: unknown[] = [];
    metamob.on("request", ({ method, verb, attempt }) => log.push(`${verb} ${method} #${attempt}`));
    metamob.on("response", ({ status, cached }) => log.push(`${status} cached=${cached}`));
    metamob.on("response", () => {
      throw new Error("listener bug");
    });
    metamob.on("error", (error) => errors.push(error));
    await expect(metamob.me()).resolves.toBeDefined();
    expect(log).toEqual(["GET me.get #0", "200 cached=false"]);
    expect(errors).toHaveLength(1);
  });

  it("stops listening with the returned function, off and once", async () => {
    const { metamob } = client(ACCOUNT);
    let count = 0;
    const listener = () => void count++;
    const stop = metamob.on("request", listener);
    metamob.once("request", listener);
    await metamob.me();
    expect(count).toBe(2);
    stop();
    await metamob.me();
    expect(count).toBe(2);
    metamob.on("request", listener);
    metamob.off("request", listener);
    await metamob.me();
    expect(count).toBe(2);
  });
});
