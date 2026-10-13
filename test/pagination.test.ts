import { describe, expect, it } from "vitest";
import { ListRequest, Page } from "../src/index.js";
import { type Call, client, monsters, page } from "./helpers.js";

/** Serves `total` monsters, honouring `limit` and `offset` like the API. */
const catalogue = (total: number, defaultLimit = 50) => (call: Call) => {
  const limit = Number(call.url.searchParams.get("limit") ?? defaultLimit);
  const offset = Number(call.url.searchParams.get("offset") ?? 0);
  return page(monsters(Math.max(0, Math.min(limit, total - offset)), offset + 1), total, offset, limit);
};

describe("offset pagination", () => {
  it("resolves to the first page when awaited, with the API's default size", async () => {
    const { metamob, calls } = client(catalogue(120), { cache: false });
    const first = await metamob.monsters.list();
    expect(first).toBeInstanceOf(Page);
    expect(first.items).toHaveLength(50);
    expect(first.total).toBe(120);
    expect(first.limit).toBe(50);
    expect(first.offset).toBe(0);
    expect(first.hasNext).toBe(true);
    expect([...first].length).toBe(50);
    expect(calls[0]!.url.search).toBe("");

    const second = await first.next();
    expect(second?.offset).toBe(50);
    const third = await second?.next();
    expect(third?.items).toHaveLength(20);
    expect(third?.hasNext).toBe(false);
    expect(await third?.next()).toBeNull();
  });

  it("walks every item with the largest page the endpoint accepts", async () => {
    const { metamob, calls } = client(catalogue(450), { cache: false });
    const ids: number[] = [];
    for await (const monster of metamob.monsters.list()) ids.push(monster.id);
    expect(ids).toHaveLength(450);
    expect(ids[449]).toBe(450);
    expect(calls.map((call) => call.url.search)).toEqual(["?limit=200", "?limit=200&offset=200", "?limit=200&offset=400"]);
  });

  it("keeps the caller's page size and starting point", async () => {
    const { metamob, calls } = client(catalogue(100), { cache: false });
    const all = await metamob.monsters.list({ limit: 30, offset: 40 }).all();
    expect(all.map((monster) => monster.id)).toEqual(Array.from({ length: 60 }, (_, index) => 41 + index));
    expect(calls.map((call) => call.url.search)).toEqual(["?limit=30&offset=40", "?limit=30&offset=70"]);
  });

  it("stops at a limit without fetching more than it needs", async () => {
    const { metamob, calls } = client(catalogue(1000), { cache: false });
    expect(await metamob.monsters.list().take(5)).toHaveLength(5);
    expect(calls.map((call) => call.url.search)).toEqual(["?limit=5"]);

    expect(await metamob.monsters.list().all({ limit: 250 })).toHaveLength(250);
    expect(calls.slice(1).map((call) => call.url.search)).toEqual(["?limit=200", "?limit=200&offset=200"]);
    expect(await metamob.monsters.list().take(0)).toEqual([]);
  });

  it("gives the first item and the count with a single small request each", async () => {
    const { metamob, calls } = client(catalogue(337), { cache: false });
    expect((await metamob.monsters.list({ type: 3 }).first())?.id).toBe(1);
    expect(await metamob.monsters.list({ type: 3, offset: 100 }).count()).toBe(337);
    expect(calls.map((call) => call.url.search)).toEqual(["?type=3&limit=1", "?type=3&limit=1"]);

    const none = client(page([], 0), { cache: false });
    expect(await none.metamob.monsters.list().first()).toBeUndefined();
    expect(await none.metamob.monsters.list().all()).toEqual([]);
  });

  it("yields whole pages", async () => {
    const { metamob } = client(catalogue(90), { cache: false });
    const sizes: number[] = [];
    for await (const chunk of metamob.monsters.list({ limit: 40 }).pages()) sizes.push(chunk.items.length);
    expect(sizes).toEqual([40, 40, 10]);
  });

  it("is lazy and behaves like a promise", async () => {
    const { metamob, calls } = client(catalogue(3), { cache: false });
    const request = metamob.monsters.list();
    expect(request).toBeInstanceOf(ListRequest);
    expect(calls).toHaveLength(0);
    let settled = false;
    await request.finally(() => (settled = true));
    expect(settled).toBe(true);

    const failing = client(new Response("{}", { status: 404 }), { cache: false });
    await expect(failing.metamob.monsters.list().catch((error: unknown) => (error as { code: string }).code)).resolves.toBe("NOT_FOUND");
  });

  it("stops on a page that comes back empty, whatever the total says", async () => {
    const { metamob, calls } = client([page(monsters(2), 10, 0, 2), page([], 10, 2, 2)], { cache: false });
    expect(await metamob.monsters.list({ limit: 2 }).all()).toHaveLength(2);
    expect(calls).toHaveLength(2);
  });
});

describe("pages that carry more than items", () => {
  it("exposes the quest next to the monsters of a public quest", async () => {
    const quest = { slug: "a1b2c3d4", character_name: "Perso", current_step: 4, parallel_quests: 2 };
    const { metamob, calls } = client({ data: { ...quest, monsters: monsters(2), pagination: { total: 2, limit: 50, offset: 0 } } });
    const result = await metamob.users.quest("Ix-xs", "a1b2c3d4", { status: "wanted", type: "archimonstre", step: 4 });
    expect(result.quest).toEqual(quest);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(calls[0]!.path).toBe("/users/Ix-xs/quests/a1b2c3d4");
    expect(calls[0]!.url.search).toBe("?monster_type=3&status=wanted&step=4");
  });

  it("exposes the slug of your own quest and the template of a template page", async () => {
    const own = client({ data: { slug: "a1b2c3d4", monsters: monsters(1), pagination: { total: 1, limit: 50, offset: 0 } } });
    expect((await own.metamob.quests.monsters("a1b2c3d4")).slug).toBe("a1b2c3d4");

    const header = { id: 1, quest_type: { id: 1, slug: "ocre", name: { fr: "Ocre", en: "Ochre", es: "Ocre" } }, game_version: { id: 1, name: "Dofus (Unity)" } };
    const template = client({ data: { ...header, monsters: monsters(3), pagination: { total: 3, limit: 50, offset: 0 } } });
    const result = await template.metamob.questTemplates.monsters(1, { step: 4 });
    expect(result.template).toEqual(header);
    expect(template.calls[0]!.url.href).toBe("https://www.metamob.fr/api/v1/quest-templates/1?step=4");
  });
});

describe("cursor pagination", () => {
  const message = (id: number) => ({ kind: "message", id, content: `m${id}`, sender: "a", created_at: "2026-01-27T14:22:00Z", read_at: null });
  const thread = (call: Call) => {
    const before = Number(call.url.searchParams.get("before_id") ?? 10);
    const limit = Number(call.url.searchParams.get("limit") ?? 30);
    const ids = Array.from({ length: Math.min(limit, before - 1) }, (_, index) => before - 1 - index);
    const last = ids[ids.length - 1] ?? 0;
    return { data: ids.map(message), pagination: { has_more: last > 1, next_before_id: last > 1 ? last : null } };
  };

  it("walks back in time with the cursor the API hands out", async () => {
    const { metamob, calls } = client(thread);
    const first = await metamob.conversations.messages("Ix-xs", { limit: 4 });
    expect(first.items.map((item) => item.id)).toEqual([9, 8, 7, 6]);
    expect(first.total).toBeUndefined();
    expect(first.nextBeforeId).toBe(6);
    expect(first.hasNext).toBe(true);
    const second = await first.next();
    expect(second?.items.map((item) => item.id)).toEqual([5, 4, 3, 2]);
    const third = await second?.next();
    expect(third?.items.map((item) => item.id)).toEqual([1]);
    expect(third?.hasNext).toBe(false);
    expect(third?.nextBeforeId).toBeUndefined();
    expect(calls.map((call) => call.url.search)).toEqual(["?limit=4", "?limit=4&before_id=6", "?limit=4&before_id=2"]);
  });

  it("iterates a whole conversation 50 items at a time, and resumes from a cursor", async () => {
    const { metamob, calls } = client(thread);
    const ids: number[] = [];
    for await (const item of metamob.conversations.messages("Ix-xs")) ids.push(item.id);
    expect(ids).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(calls[0]!.url.search).toBe("?limit=50");

    const resumed = await metamob.conversations.messages("Ix-xs", { beforeId: 4 }).all();
    expect(resumed.map((item) => item.id)).toEqual([3, 2, 1]);
  });
});
