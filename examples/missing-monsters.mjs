// Prints what one of your quests still needs, zone by zone.
//
//   METAMOB_API_KEY=... node examples/missing-monsters.mjs [slug]
//
// Without a slug, the first quest of the account is used.

import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) {
  console.error("This account has no quest.");
  process.exit(1);
}

const quest = await metamob.quests.get(slug);
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${quest.quest_template.step_count}\n`);

for (const zone of await metamob.quests.zones(slug)) {
  const missing = new Map();
  for (const subzone of zone.subzones) {
    for (const monster of subzone.monsters) {
      if (monster.status === "incomplete") missing.set(monster.id, `${monster.name.fr} (${monster.owned}/${monster.required})`);
    }
  }
  if (!missing.size) continue;
  console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);
  for (const line of missing.values()) console.log(`  ${line}`);
}

console.log(`\n${metamob.rateLimit?.remaining} requests left this minute`);
