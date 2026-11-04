// The code samples of README.md, compiled by `npm run test:types`.

import { Metamob, data, isMetamobError } from "../../src/index.js";

declare const slug: string;

export async function example() {
  const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

  const [quest] = await metamob.quests.list();

  if (quest) {
    for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
      console.log(monster.step, monster.name.fr);
    }

    await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
  }
}

export async function features(metamob: Metamob) {
  data.searchMonsters("bouf", { limit: 5 });

  try {
    await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
  } catch (error) {
    if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  }
}
