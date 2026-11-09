import { Metamob, isMetamobError } from "@ix-xs/metamob.api";

const metamob = new Metamob();
const [name = "", quantity = "1"] = process.argv.slice(2);

const [quest] = await metamob.quests.list();
if (!quest) throw new Error("This account has no quest yet.");

try {
  const result = await metamob.quests.setMonster(quest.slug, name, Number(quantity));
  console.log(`${name}: ${result.owned} owned`);
} catch (error) {
  if (!isMetamobError(error, "UNKNOWN_NAME")) throw error;
  console.log(error.message);
}
