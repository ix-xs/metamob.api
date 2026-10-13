// Checks the built CommonJS files the way a user's `require` sees them.
// Plain Node, no test runner, so it also runs on the oldest supported version.
const assert = require("node:assert/strict");
const api = require("../../dist/index.js");

const calls = [];
const fetch = async (url, init) => {
  calls.push({ url: String(url), init });
  return new Response(JSON.stringify({ data: { id: 20, name: { fr: "Tofu", en: "Tofu", es: "Tofu" }, zones: [] } }), { headers: { "content-type": "application/json" } });
};

(async () => {
  const metamob = new api.Metamob({ apiKey: "key", fetch });
  const monster = await metamob.monsters.get("tofu");
  assert.equal(monster.name.fr, "Tofu");
  assert.equal(calls[0].url, "https://www.metamob.fr/api/v1/monsters/20");
  assert.equal(calls[0].init.headers.authorization, "Bearer key");
  assert.equal(metamob.rateLimit.remaining, 59);

  for (const name of ["Metamob", "Dataset", "data", "METHODS", "VERSION", "MemoryCache", "ListRequest", "Page", "MetamobError", "MetamobApiError", "MetamobRequestError", "MetamobArgumentError", "isMetamobError", "normalizeName", "urls"]) {
    assert.ok(api[name], `missing export ${name}`);
  }
  assert.equal(api.VERSION, require("../../package.json").version);
  assert.equal(Object.keys(api.METHODS).length, 35);
  assert.equal(api.data.monster("Aboudbra le Porteur").id, 472);
  assert.equal(api.data.server("draconiros").name, "Draconiros");
  assert.equal(api.urls.monsterImage(monster.image || "tofu.png"), "https://www.metamob.fr/img/monsters/tofu.png");
  assert.ok(new api.MetamobApiError({ status: 404, message: "x", method: "users.get", url: "u" }) instanceof api.MetamobError);
  console.log(`cjs ok on Node ${process.versions.node} (${Object.keys(api).length} exports)`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
