// Fetches the reference data of the Metamob API (monsters, zones, subzones,
// servers, quest templates...) and pins it in `scripts/data/snapshot.json`.
// The library embeds that data so a monster, a zone or a server can be named
// instead of looked up.
//
//   node scripts/update-data.mjs            # fetch, write the snapshot, list what changed
//   node scripts/update-data.mjs --check    # fetch and fail when the snapshot is out of date
//
// Needs METAMOB_API_KEY, from the environment or from `.env`. It sends about
// 240 requests, paced at 44 a minute where the API allows 60, so a run takes
// five to six minutes. Run `npm run generate` afterwards.

import { existsSync } from "node:fs";
import { sleep } from "@ix-xs/node-comfort/async";
import env from "@ix-xs/node-comfort/env";
import { diff, loadSnapshot, normalize, saveSnapshot, serialize, SNAPSHOT_URL } from "./snapshot.mjs";

const BASE = "https://www.metamob.fr/api/v1";
// One request every 1.35 s is 44 a minute, well under the 60 the API allows.
const PACE = 1350;
const check = process.argv.includes("--check");

// node-comfort loads `.env` when it is imported; `validate` checks what came out of it.
function apiKey() {
  try {
    return env.validate({ METAMOB_API_KEY: { type: "string", minLength: 20 } }).METAMOB_API_KEY;
  } catch (error) {
    console.error(error.message);
    console.error("Put your key in .env (see .env.example) or in the environment. It is created on metamob.fr, in Settings > API key.");
    process.exit(2);
  }
}

const key = apiKey();
let sent = 0;
let last = 0;

async function get(path) {
  for (let attempt = 0; ; attempt++) {
    const wait = last + PACE - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    sent++;
    const response = await fetch(BASE + path, { headers: { authorization: `Bearer ${key}`, accept: "application/json" } });
    if (response.status === 429 && attempt < 5) {
      const seconds = Number(response.headers.get("retry-after")) || 30;
      console.error(`  rate limited, waiting ${seconds} s`);
      await sleep(seconds * 1000);
      continue;
    }
    if (response.status >= 500 && attempt < 3) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!response.ok) throw new Error(`GET ${path}: ${response.status} ${(await response.text()).slice(0, 200)}`);
    return response.json();
  }
}

/** Every item of a list paginated with limit and offset. `pick` finds the array and the pagination in a body. */
async function all(path, pick = (body) => ({ items: body.data, pagination: body.pagination })) {
  const out = [];
  for (let offset = 0; ; ) {
    const body = await get(`${path}${path.includes("?") ? "&" : "?"}limit=200&offset=${offset}`);
    const { items, pagination } = pick(body);
    out.push(...items);
    offset += items.length;
    if (!items.length || !pagination || offset >= pagination.total) return out;
  }
}

const step = (text) => console.error(text);

step("game versions, servers, monster types, quest types, quest templates");
const gameVersions = (await get("/game-versions")).data;
const servers = (await get("/servers")).data.map((server) => ({ id: server.id, name: server.name, community: server.community, game_version: server.game_version?.id ?? null }));
const monsterTypes = (await get("/monster-types")).data;
const questTypes = (await get("/quest-types")).data;
const templateList = (await get("/quest-templates")).data;

step("monsters");
const monsters = (await all("/monsters")).map((monster) => ({
  id: monster.id,
  name: monster.name,
  image: monster.image,
  level_min: monster.level_min,
  level_max: monster.level_max,
  type: monster.type?.id ?? null,
  ...(monster.reference ? { reference: monster.reference.id } : {}),
}));

step("quest templates");
const questTemplates = [];
for (const template of templateList) {
  const rows = await all(`/quest-templates/${template.id}`, (body) => ({ items: body.data.monsters, pagination: body.data.pagination }));
  questTemplates.push({
    id: template.id,
    quest_type: template.quest_type?.id ?? null,
    game_version: template.game_version?.id ?? null,
    monster_count: template.monster_count,
    step_count: template.step_count,
    // Pairs of [monster id, step], in the order of the quest.
    monsters: rows.map((row) => [row.id, row.step]).sort((a, b) => a[1] - b[1] || a[0] - b[0]),
  });
}

step("zones and subzones");
const zoneList = (await get("/zones")).data;
const zones = zoneList.map((zone) => ({ id: zone.id, name: zone.name }));
const subzones = [];
for (const zone of zoneList) {
  const detail = (await get(`/zones/${zone.id}`)).data;
  for (const subzone of detail.subzones ?? []) {
    const found = (await get(`/zones/${zone.id}/subzones/${subzone.id}/monsters`)).data;
    subzones.push({ id: subzone.id, name: subzone.name, zone: zone.id, monsters: found.map((monster) => monster.id) });
  }
  step(`  ${zone.name.fr}: ${detail.subzones?.length ?? 0} subzones`);
}

const snapshot = normalize({ fetchedAt: new Date().toISOString().slice(0, 10), gameVersions, monsterTypes, questTypes, servers, questTemplates, zones, subzones, monsters });
const previous = existsSync(SNAPSHOT_URL) ? await loadSnapshot() : { fetchedAt: "" };
const changes = diff(previous, snapshot);

console.log(`${sent} requests. ${monsters.length} monsters, ${zones.length} zones, ${subzones.length} subzones, ${servers.length} servers, ${questTemplates.length} quest templates.`);
if (!changes.length) {
  console.log("The snapshot is up to date.");
  process.exit(0);
}
console.log(`${changes.length} change${changes.length === 1 ? "" : "s"}:`);
for (const line of changes.slice(0, 200)) console.log(`  ${line}`);
if (changes.length > 200) console.log(`  ... and ${changes.length - 200} more`);

if (check) {
  console.error("\nThe snapshot is out of date. Run `npm run data:update`, then `npm run generate`.");
  process.exit(1);
}
await saveSnapshot(snapshot);
console.log(`\nWrote scripts/data/snapshot.json (${(serialize(snapshot).length / 1024).toFixed(0)} kB). Now run \`npm run generate\`.`);
