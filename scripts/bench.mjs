// Measures the parts of the library that run on every call, against the
// built files. Nothing touches the network: `fetch` is a stub.
//
//   npm run build && npm run bench

import { performance } from "node:perf_hooks";

const started = performance.now();
const { Metamob, data, normalizeName } = await import("../dist/index.mjs");
const imported = performance.now() - started;

const first = performance.now();
data.monsters.length;
const decoded = performance.now() - first;

function bench(name, run, iterations = 200_000) {
  for (let index = 0; index < 2_000; index++) run(index);
  const start = performance.now();
  for (let index = 0; index < iterations; index++) run(index);
  const elapsed = performance.now() - start;
  console.log(`${name.padEnd(46)} ${((elapsed * 1e6) / iterations).toFixed(0).padStart(7)} ns/op  ${Math.round(iterations / (elapsed / 1000)).toLocaleString("en-US").padStart(12)} ops/s`);
}

async function benchAsync(name, run, iterations = 50_000) {
  for (let index = 0; index < 1_000; index++) await run(index);
  const start = performance.now();
  for (let index = 0; index < iterations; index++) await run(index);
  const elapsed = performance.now() - start;
  console.log(`${name.padEnd(46)} ${((elapsed * 1e6) / iterations).toFixed(0).padStart(7)} ns/op  ${Math.round(iterations / (elapsed / 1000)).toLocaleString("en-US").padStart(12)} ops/s`);
}

console.log(`Node ${process.versions.node}`);
console.log(`import of the package                          ${imported.toFixed(2)} ms`);
console.log(`first use of the data (decode ${data.monsters.length} monsters)      ${decoded.toFixed(2)} ms\n`);

const names = data.monsters.map((monster) => monster.name.fr);
bench("data.monster(id)", (index) => data.monster((index % 800) + 1));
bench("data.monster(name)", (index) => data.monster(names[index % names.length]));
bench("data.monster(name with accents, any case)", () => data.monster("TOFU MALÉFIQUE"));
bench("data.monster(shared name, { gameVersion })", () => data.monster("Crognan le Barbare", { gameVersion: "Dofus Touch" }));
bench("normalizeName", () => normalizeName("Abrakanette l'Encapsulé"));
bench("data.searchMonsters('bouf')", () => data.searchMonsters("bouf"), 5_000);
bench("data.suggest('monster', typo)", () => data.suggest("monster", "Tofu Malefik"), 500);

const body = JSON.stringify({ data: { id: 20, name: { fr: "Tofu", en: "Tofu", es: "Tofu" } } });
const fetch = async () => new Response(body, { headers: { "content-type": "application/json" } });

console.log("");
const plain = new Metamob({ apiKey: "key", fetch, cache: false, rateLimit: false });
await benchAsync("call, no cache, no limiter (stubbed fetch)", () => plain.monsters.get("Tofu"));
const limited = new Metamob({ apiKey: "key", fetch, cache: false, rateLimit: { requests: 1e9 } });
await benchAsync("call, with the rate limiter", () => limited.monsters.get("Tofu"));
const cached = new Metamob({ apiKey: "key", fetch });
await benchAsync("call answered from the cache", () => cached.monsters.get("Tofu"), 200_000);
