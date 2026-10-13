import { describe, expect, it } from "vitest";
import { methods as CONFIG } from "../scripts/api.config.mjs";
import { METHODS, type Metamob, MetamobArgumentError, type MethodId } from "../src/index.js";
import { type Call, client, monsters, page } from "./helpers.js";

const SLUG = "a1b2c3d4";

/** One call per endpoint: what is written, and what must go out. */
const CASES: Record<MethodId, { run: (metamob: Metamob) => PromiseLike<unknown>; path: string; query?: string; body?: unknown }> = {
  "me.get": { run: (m) => m.me(), path: "/me" },
  "gameVersions.list": { run: (m) => m.gameVersions.list(), path: "/game-versions" },
  "gameVersions.get": { run: (m) => m.gameVersions.get("Dofus Touch"), path: "/game-versions/3" },
  "servers.list": { run: (m) => m.servers.list(), path: "/servers" },
  "servers.get": { run: (m) => m.servers.get("draconiros"), path: "/servers/12" },
  "monsterTypes.list": { run: (m) => m.monsterTypes.list(), path: "/monster-types" },
  "monsterTypes.get": { run: (m) => m.monsterTypes.get("archmonster"), path: "/monster-types/3" },
  "questTypes.list": { run: (m) => m.questTypes.list(), path: "/quest-types" },
  "questTypes.get": { run: (m) => m.questTypes.get("dokille"), path: "/quest-types/2" },
  "questTemplates.list": { run: (m) => m.questTemplates.list(), path: "/quest-templates" },
  "questTemplates.monsters": { run: (m) => m.questTemplates.monsters({ questType: "ocre", gameVersion: "Dofus Touch" }, { step: 2, limit: 10, offset: 5 }), path: "/quest-templates/3", query: "?step=2&limit=10&offset=5" },
  "monsters.list": { run: (m) => m.monsters.list({ query: "tofu", type: "boss", limit: 20, offset: 40 }), path: "/monsters", query: "?q=tofu&type=2&limit=20&offset=40" },
  "monsters.get": { run: (m) => m.monsters.get("Tofu"), path: "/monsters/20" },
  "zones.list": { run: (m) => m.zones.list({ query: "ama" }), path: "/zones", query: "?q=ama" },
  "zones.get": { run: (m) => m.zones.get("Amakna"), path: "/zones/1" },
  "zones.subzones": { run: (m) => m.zones.subzones("Amakna", { query: "plaine" }), path: "/zones/1/subzones", query: "?q=plaine" },
  "zones.subzone": { run: (m) => m.zones.subzone("Akadémie des Gobs"), path: "/zones/1/subzones/48" },
  "zones.monsters": { run: (m) => m.zones.monsters(48), path: "/zones/1/subzones/48/monsters" },
  "kralove.list": { run: (m) => m.kralove.list({ server: "Draconiros", from: new Date("2026-01-27T23:30:00Z") }), path: "/kralove", query: "?server=12&from=2026-01-27" },
  "kralove.get": { run: (m) => m.kralove.get(42), path: "/kralove/42" },
  "users.search": { run: (m) => m.users.search("player", { server: 12, activeWithinDays: 30, limit: 10 }), path: "/users/search", query: "?q=player&server_id=12&active_within_days=30&limit=10" },
  "users.get": { run: (m) => m.users.get("Ix-xs"), path: "/users/Ix-xs" },
  "users.quests": { run: (m) => m.users.quests("Ix-xs"), path: "/users/Ix-xs/quests" },
  "users.quest": { run: (m) => m.users.quest("Ix-xs", SLUG, { status: "offered" }), path: `/users/Ix-xs/quests/${SLUG}`, query: "?status=offered" },
  "conversations.list": { run: (m) => m.conversations.list({ status: "archived", limit: 10, offset: 20 }), path: "/conversations", query: "?status=archived&limit=10&offset=20" },
  "conversations.messages": { run: (m) => m.conversations.messages("Ix-xs", { limit: 5, beforeId: 99 }), path: "/conversations/Ix-xs", query: "?limit=5&before_id=99" },
  "quests.list": { run: (m) => m.quests.list(), path: "/quests" },
  "quests.get": { run: (m) => m.quests.get(SLUG), path: `/quests/${SLUG}` },
  "quests.update": {
    run: (m) => m.quests.update(SLUG, { current_step: 12, show_trades: true, never_want_arch: true, never_offer_boss: false, trade_want_threshold: null, character_name: undefined }),
    path: `/quests/${SLUG}`,
    body: { current_step: 12, show_trades: true, never_want_arch: 1, never_offer_boss: 0, trade_want_threshold: null },
  },
  "quests.monsters": { run: (m) => m.quests.monsters(SLUG, { type: "archimonstre", status: "needed", trade: "manual", step: 4 }), path: `/quests/${SLUG}/monsters`, query: "?monster_type=3&status=needed&trade=manual&step=4" },
  "quests.setMonster": { run: (m) => m.quests.setMonster(SLUG, "Tofu", 5), path: `/quests/${SLUG}/monsters/20`, body: { quantity: 5 } },
  "quests.setMonsters": { run: (m) => m.quests.setMonsters(SLUG, { Tofu: 3, "472": 0 }), path: `/quests/${SLUG}/monsters`, body: { monsters: [{ monster_id: 472, quantity: 0 }, { monster_id: 20, quantity: 3 }] } },
  "quests.setTrade": { run: (m) => m.quests.setTrade(SLUG, { id: 20 }, { trade_offer: 1, trade_want: null }), path: `/quests/${SLUG}/monsters/20/trade`, body: { trade_offer: 1, trade_want: null } },
  "quests.matches": { run: (m) => m.quests.matches(SLUG, { minParallelQuests: 3, onlyPossibleTrades: true, limit: 10 }), path: `/quests/${SLUG}/matches`, query: "?min_parallel_quests=3&only_possible_trades=1&limit=10" },
  "quests.zones": { run: (m) => m.quests.zones(SLUG, { zone: "Amakna", subzone: "Gob Akademy", type: "monstre" }), path: `/quests/${SLUG}/zones`, query: "?zone_id=1&subzone_id=48&monster_type_id=1" },
};

/** A body most methods can read. The few that cannot fail after the request left, which is all that is checked. */
const ANSWER = { data: { slug: SLUG, monsters: [], pagination: { total: 0, limit: 50, offset: 0 } }, pagination: { total: 0, limit: 50, offset: 0 } };

describe("every endpoint", () => {
  it("is described once in the config, the generated table and these cases", () => {
    const ids = CONFIG.map((method) => method.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(METHODS).sort()).toEqual([...ids].sort());
    expect(Object.keys(CASES).sort()).toEqual([...ids].sort());
  });

  for (const config of CONFIG) {
    it(`${config.id}: ${config.verb} ${config.path}`, async () => {
      const scenario = CASES[config.id as MethodId];
      const { metamob, calls } = client(ANSWER);
      await Promise.resolve(scenario.run(metamob)).catch((error: unknown) => {
        if (error instanceof MetamobArgumentError) throw error;
      });
      const call = calls[calls.length - 1] as Call;
      expect(call.method).toBe(config.verb);
      expect(call.path).toBe(scenario.path);
      expect(call.url.search).toBe(scenario.query ?? "");
      expect(call.body).toEqual(scenario.body);
      if (config.verb === "PATCH") expect(call.headers.get("content-type")).toBe("application/json");
      else expect(call.headers.get("content-type")).toBeNull();
      expect(METHODS[config.id as MethodId].scope).toBe(config.scope);
    });
  }
});

describe("names and ids", () => {
  it("takes an id, a numeric string, a name in any language or an object, at no extra request", async () => {
    const { metamob, calls } = client({ data: {} }, { cache: false });
    await metamob.monsters.get(472);
    await metamob.monsters.get("472");
    await metamob.monsters.get("Aboudbra le Porteur");
    await metamob.monsters.get("abounteous the generous");
    await metamob.monsters.get("ABUBANERO EL NARANJA");
    await metamob.monsters.get({ id: 472 });
    expect(calls.map((call) => call.path)).toEqual(Array(6).fill("/monsters/472"));
  });

  it("passes an id the package does not know straight to the API", async () => {
    const { metamob, calls } = client({ data: {} });
    await metamob.monsters.get(987_654);
    await metamob.servers.get(999);
    expect(calls.map((call) => call.path)).toEqual(["/monsters/987654", "/servers/999"]);
  });

  it("asks the API about a name the package does not know", async () => {
    const fresh = { ...monsters(1, 9001)[0]!, name: { fr: "Nouveau Monstre", en: "Brand New Monster", es: "Monstruo Nuevo" } };
    const { metamob, calls } = client((call) => (call.path === "/monsters" ? page([fresh]) : { data: fresh }));
    const found = await metamob.monsters.get("brand new monster");
    expect(found.id).toBe(9001);
    expect(calls.map((call) => call.path + call.url.search)).toEqual(["/monsters?q=brand%20new%20monster&limit=200", "/monsters/9001"]);
  });

  it("fails with suggestions when a name exists nowhere, before the real call", async () => {
    const { metamob, calls } = client(page([]));
    const error = (await metamob.quests.setMonster(SLUG, "Tofu Malefik", 1).catch((caught: unknown) => caught)) as MetamobArgumentError;
    expect(error).toBeInstanceOf(MetamobArgumentError);
    expect(error.code).toBe("UNKNOWN_NAME");
    expect(error.suggestions).toContain("Tofu Maléfique");
    expect(error.message).toContain('Did you mean "Tofu Maléfique"');
    expect(calls.every((call) => call.method === "GET")).toBe(true);

    await expect(metamob.servers.get("Draconiro")).rejects.toMatchObject({ code: "UNKNOWN_NAME", suggestions: ["Draconiros"] });
    await expect(metamob.zones.get("Amakn")).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
    await expect(metamob.monsterTypes.get("dragon")).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
    await expect(metamob.questTypes.get("emeraude")).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
    await expect(metamob.gameVersions.get("Dofus 3")).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
    await expect(metamob.questTemplates.monsters({ questType: "dokille", gameVersion: "Dofus Touch" })).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
  });

  it("refuses what cannot be a reference", async () => {
    const { metamob, calls } = client();
    await expect(metamob.monsters.get(0)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.monsters.get(1.5)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.monsters.get("   ")).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.monsters.get(null as never)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.questTemplates.monsters(-1)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.questTemplates.monsters("1" as never)).rejects.toBeInstanceOf(MetamobArgumentError);
    expect(calls).toHaveLength(0);
  });

  it("resolves a quest template from the cached list when it is newer than the package", async () => {
    const list = { data: [{ id: 5, quest_type: { id: 2, slug: "dokille", name: { fr: "Dokille", en: "Grofus", es: "Dosaurio" } }, game_version: { id: 3, name: "Dofus Touch" }, monster_count: 40, step_count: 8 }] };
    const { metamob, calls } = client((call) => (call.path === "/quest-templates" ? list : { data: { id: 5, monsters: [], pagination: { total: 0, limit: 50, offset: 0 } } }));
    await metamob.questTemplates.monsters({ questType: "dokille", gameVersion: "Dofus Touch" });
    expect(calls.map((call) => call.path)).toEqual(["/quest-templates", "/quest-templates/5"]);
    await expect(metamob.questTemplates.get(5)).resolves.toMatchObject({ monster_count: 40 });
    await expect(metamob.questTemplates.get(77)).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
  });

  it("finds the zone of a subzone, and takes it from the caller for a subzone it does not know", async () => {
    const { metamob, calls } = client((call) => (call.url.search ? { data: [{ id: 900, name: { fr: "Nouvelle Zone", en: "New Area", es: "Zona Nueva" } }] } : { data: {} }));
    await metamob.zones.subzone("Gob Akademy");
    await metamob.zones.subzone(900, { zone: "Amakna" });
    await metamob.zones.monsters("New Area", { zone: 1 });
    expect(calls.map((call) => call.path + call.url.search)).toEqual(["/zones/1/subzones/48", "/zones/1/subzones/900", "/zones/1/subzones?q=New%20Area", "/zones/1/subzones/900/monsters"]);
    await expect(metamob.zones.subzone(900)).rejects.toThrow(/Pass the zone/);
    await expect(metamob.zones.subzone("Nowhere at all")).rejects.toMatchObject({ code: "UNKNOWN_NAME" });
  });
});

describe("argument checks", () => {
  it("refuses a search under 3 characters without spending a request", async () => {
    const { metamob, calls } = client();
    await expect(metamob.monsters.list({ query: "to" })).rejects.toThrow(/at least 3 characters/);
    await expect(metamob.users.search("ab")).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.zones.list({ query: " a " })).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.zones.subzones(1, { query: "" })).rejects.toBeInstanceOf(MetamobArgumentError);
    expect(calls).toHaveLength(0);
  });

  it("refuses empty slugs, usernames and bodies", async () => {
    const { metamob, calls } = client();
    await expect(metamob.quests.get("")).rejects.toThrow(/slug/);
    await expect(metamob.users.get("  ")).rejects.toThrow(/username/);
    await expect(metamob.users.quest("Ix-xs", "")).rejects.toThrow(/slug/);
    await expect(metamob.conversations.messages(undefined as never)).rejects.toThrow(/username/);
    await expect(metamob.quests.update(SLUG, {})).rejects.toThrow(/empty/);
    await expect(metamob.quests.update(SLUG, { current_step: undefined })).rejects.toThrow(/empty/);
    await expect(metamob.quests.update(SLUG, [] as never)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.quests.setMonsters(SLUG, [])).rejects.toThrow(/empty/);
    await expect(metamob.quests.setMonsters(SLUG, "Tofu" as never)).rejects.toBeInstanceOf(MetamobArgumentError);
    await expect(metamob.quests.setTrade(SLUG, 20, {})).rejects.toThrow(/trade_offer/);
    await expect(metamob.quests.setTrade(SLUG, 20, null as never)).rejects.toBeInstanceOf(MetamobArgumentError);
    expect(calls).toHaveLength(0);
  });

  it("refuses quantities that are not whole numbers from 0 up", async () => {
    const { metamob, calls } = client();
    for (const quantity of [-1, 1.5, Number.NaN, "3" as never]) await expect(metamob.quests.setMonster(SLUG, 20, quantity)).rejects.toThrow(/quantity/);
    await expect(metamob.quests.setMonsters(SLUG, [{ monster: 20, quantity: -2 }])).rejects.toThrow(/quantity/);
    await expect(metamob.quests.setTrade(SLUG, 20, { trade_offer: -1 })).rejects.toThrow(/trade_offer/);
    expect(calls).toHaveLength(0);
  });

  it("refuses dates and event ids it cannot send", async () => {
    const { metamob, calls } = client();
    await expect(metamob.kralove.list({ from: "27/01/2026" })).rejects.toThrow(/from/);
    await expect(metamob.kralove.list({ from: new Date("nope") })).rejects.toThrow(/from/);
    await expect(metamob.kralove.get("abc")).rejects.toThrow(/id/);
    expect(calls).toHaveLength(0);
  });
});

describe("quests", () => {
  it("accepts quantities as a list, an object or a Map, and keeps the last value of a monster given twice", async () => {
    const answer = { data: { updated_count: 2, monsters: [] } };
    const expected = { monsters: [{ monster_id: 20, quantity: 4 }, { monster_id: 472, quantity: 1 }] };
    for (const quantities of [
      [
        { monster: "Tofu", quantity: 9 },
        { monster: 472, quantity: 1 },
        { monster: 20, quantity: 4 },
      ],
      new Map<string | number, number>([
        ["Tofu", 4],
        [472, 1],
      ]),
    ]) {
      const { metamob, calls } = client(answer);
      await metamob.quests.setMonsters(SLUG, quantities);
      expect(calls[0]!.body).toEqual(expected);
    }
  });

  it("splits more than 200 monsters across requests and merges the answers", async () => {
    const { metamob, calls } = client((call) => {
      const sent = (call.body as { monsters: { monster_id: number; quantity: number }[] }).monsters;
      return { data: { updated_count: sent.length, monsters: sent.map((entry) => ({ ...entry, owned: entry.quantity, status: 0, effective_offer: 0, effective_want: 0 })) } };
    });
    const quantities = Array.from({ length: 450 }, (_, index) => ({ monster: index + 1, quantity: index % 5 }));
    const result = await metamob.quests.setMonsters(SLUG, quantities);
    expect(calls.map((call) => (call.body as { monsters: unknown[] }).monsters.length)).toEqual([200, 200, 50]);
    expect(result.updated_count).toBe(450);
    expect(result.monsters).toHaveLength(450);
    expect(result.monsters[449]).toMatchObject({ monster_id: 450, quantity: 4 });
  });

  it("asks the quest which monster is meant when a name is shared across versions of the game", async () => {
    const { metamob, calls } = client((call) => (call.method === "GET" ? { data: { slug: SLUG, quest_template: { id: 3 } } } : { data: {} }));
    await metamob.quests.setMonster(SLUG, "Crognan le Barbare", 1);
    // Template 3 is Dofus Touch, where the archmonster is #725, not #416.
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([`GET /quests/${SLUG}`, `PATCH /quests/${SLUG}/monsters/725`]);

    // The template is remembered: no second look-up, and none at all for a plain name or an id.
    await metamob.quests.setTrade(SLUG, "Crognan le Barbare", { trade_offer: 0 });
    await metamob.quests.setMonster(SLUG, "Tofu", 1);
    await metamob.quests.setMonster(SLUG, 416, 1);
    expect(calls.slice(2).map((call) => `${call.method} ${call.path}`)).toEqual([`PATCH /quests/${SLUG}/monsters/725/trade`, `PATCH /quests/${SLUG}/monsters/20`, `PATCH /quests/${SLUG}/monsters/416`]);

    // Each key has its own quests.
    await metamob.quests.setMonster("other", "Crognan le Barbare", 1, { apiKey: "their-key" });
    expect(calls[calls.length - 2]!.headers.get("authorization")).toBe("Bearer their-key");
  });

  it("does not remember a quest look-up that failed", async () => {
    let fail = true;
    const { metamob, calls } = client((call) => {
      if (call.method === "GET" && fail) return new Response(JSON.stringify({ messages: { error: "Quest not found" } }), { status: 404 });
      return call.method === "GET" ? { data: { quest_template: { id: 1 } } } : { data: {} };
    });
    await expect(metamob.quests.setMonster(SLUG, "Crognan le Barbare", 1)).rejects.toMatchObject({ code: "NOT_FOUND" });
    fail = false;
    await metamob.quests.setMonster(SLUG, "Crognan le Barbare", 1);
    expect(calls[calls.length - 1]!.path).toBe(`/quests/${SLUG}/monsters/416`);
  });

  it("hands both trade values back to the calculation with resetTrade", async () => {
    const { metamob, calls } = client({ data: {} });
    await metamob.quests.resetTrade(SLUG, "Tofu");
    expect(calls[0]!.body).toEqual({ trade_offer: null, trade_want: null });
    await metamob.quests.setTrade(SLUG, "Tofu", { trade_want: 0 });
    expect(calls[1]!.body).toEqual({ trade_want: 0 });
  });

  it("writes onlyPossibleTrades as 1 or 0 and leaves it out when unset", async () => {
    const { metamob, calls } = client(page([]));
    await metamob.quests.matches(SLUG, { onlyPossibleTrades: false });
    await metamob.quests.matches(SLUG);
    expect(calls.map((call) => call.url.search)).toEqual(["?only_possible_trades=0", ""]);
  });
});

describe("other resources", () => {
  it("reads Kralamoure ids as numbers even when the API writes strings, and keeps null usernames", async () => {
    const { metamob } = client((call) =>
      call.path === "/kralove"
        ? { data: [{ id: "2185", creator: null, server: null }] }
        : { data: { id: "2185", creator: null, participants: [{ username: null, character_count: 2 }], messages: [] } },
    );
    const [event] = await metamob.kralove.list({ from: "2026-01-01" });
    expect(event).toMatchObject({ id: 2185, creator: null });
    const detail = await metamob.kralove.get({ id: 2185 });
    expect(detail.id).toBe(2185);
    expect(detail.participants[0]!.username).toBeNull();
  });

  it("encodes usernames and slugs in the path", async () => {
    const { metamob, calls } = client({ data: {} });
    await metamob.users.get("a b/c");
    await metamob.quests.get("x?y");
    expect(calls.map((call) => call.url.pathname)).toEqual(["/api/v1/users/a%20b%2Fc", "/api/v1/quests/x%3Fy"]);
  });

  it("offers search as a shorthand of list", async () => {
    const { metamob, calls } = client(page([]));
    await metamob.monsters.search("dragon", { type: "boss" });
    expect(calls[0]!.url.search).toBe("?q=dragon&type=2");
  });
});
