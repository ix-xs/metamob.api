import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const [quest] = await metamob.quests.list();
if (!quest) throw new Error("This account has no quest yet.");

const step = quest.current_step;
const needed = metamob.quests.monsters(quest.slug, { status: "needed", step });

console.log(`${quest.character_name}, step ${step}, still to find:`);
for await (const monster of needed) {
  console.log(`  ${monster.name.fr}`);
}
