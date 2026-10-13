// Answers "where do I find this monster?" from the data embedded in the
// package. No API key, no request: this is what a Discord autocomplete or a
// slash command can call on every keystroke.
//
//   node examples/where-to-find.mjs "tofu malefique"
//   node examples/where-to-find.mjs bouf

import { data, urls } from "@ix-xs/metamob.api";

const input = process.argv.slice(2).join(" ") || "Tofu Maléfique";

const monster = data.monster(input);
if (!monster) {
  // Not an exact name: offer what starts with or contains the text, then the closest spellings.
  const found = data.searchMonsters(input, { limit: 10 }).map((candidate) => candidate.name.fr);
  const close = data.suggest("monster", input);
  console.log(found.length ? `Monsters matching "${input}":\n  ${found.join("\n  ")}` : `Nothing matches "${input}".`);
  if (!found.length && close.length) console.log(`Did you mean ${close.join(", ")}?`);
  process.exit(found.length ? 0 : 1);
}

console.log(`${monster.name.fr} / ${monster.name.en} / ${monster.name.es}`);
console.log(`${monster.type?.name.fr}, level ${monster.level_min} to ${monster.level_max}`);
console.log(urls.monsterImage(monster));

const subzones = data.subzonesOf(monster);
if (subzones.length) {
  console.log("\nFound in:");
  for (const subzone of subzones) console.log(`  ${subzone.zone.name.fr} > ${subzone.name.fr}`);
}

const archmonsters = data.archmonstersOf(monster);
if (archmonsters.length) console.log(`\nArchmonster: ${archmonsters.map((arch) => arch.name.fr).join(", ")}`);
if (monster.reference) console.log(`\nArchmonster of: ${monster.reference.name.fr}`);

const quests = data.templatesOf(monster).map((template) => `${template.quest_type?.name.fr} (${template.game_version?.name})`);
if (quests.length) console.log(`\nAsked by: ${quests.join(", ")}`);
