// Checks the built ES module files the way a user's `import` sees them.
import assert from "node:assert/strict";
import * as api from "../../dist/index.mjs";

const monsters = Array.from({ length: 450 }, (_, index) => ({ id: index + 1 }));
const calls = [];
const fetch = async (url) => {
  const { searchParams, pathname } = new URL(url);
  calls.push(pathname + (searchParams.size ? `?${searchParams}` : ""));
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);
  return new Response(JSON.stringify({ data: monsters.slice(offset, offset + limit), pagination: { total: monsters.length, limit, offset } }), { headers: { "content-type": "application/json" } });
};

const metamob = new api.Metamob({ apiKey: "key", fetch });

// One page when awaited, every item when iterated, with the largest page size.
const page = await metamob.monsters.list({ type: "archimonstre" });
assert.equal(page.items.length, 50);
assert.equal(page.total, 450);
let seen = 0;
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) seen += monster.id > 0 ? 1 : 0;
assert.equal(seen, 450);
assert.deepEqual(calls, ["/api/v1/monsters?type=3", "/api/v1/monsters?type=3&limit=200", "/api/v1/monsters?type=3&limit=200&offset=200", "/api/v1/monsters?type=3&limit=200&offset=400"]);

// An unknown name fails before anything is sent to the write endpoint.
const error = await metamob.quests.setMonster("slug", "Tofu Malefik", 1).catch((caught) => caught);
assert.ok(api.isMetamobError(error, "UNKNOWN_NAME"));
assert.ok(error.suggestions.includes("Tofu Maléfique"));

assert.equal(api.data.monstersNamed("Crognan le Barbare").length, 2);
assert.equal(api.normalizeName("  Tofu MALÉFIQUE "), "tofu malefique");
console.log(`esm ok on Node ${process.versions.node} (${Object.keys(api).length} exports)`);
