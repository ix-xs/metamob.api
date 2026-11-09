import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const quests = await metamob.quests.list();

for (const quest of quests) {
  const steps = quest.quest_template.step_count;
  console.log(`${quest.slug}  ${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${steps}`);
}
