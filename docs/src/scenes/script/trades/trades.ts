import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const [quest] = await metamob.quests.list();
if (!quest) throw new Error("This account has no quest yet.");

const partners = await metamob.quests.matches(quest.slug, { onlyPossibleTrades: true }).take(3);

for (const { user, matches } of partners) {
  const gives = matches.they_have_you_want.map((monster) => monster.name.fr);
  const wants = matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(`${user.username} has ${gives.join(", ")}`);
  console.log(`  and is looking for ${wants.join(", ")}`);
}
