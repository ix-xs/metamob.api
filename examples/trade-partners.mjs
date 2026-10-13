// Lists the best trade partners for one of your quests: what they can give
// you, what you can give them, and a link to their profile.
//
//   METAMOB_API_KEY=... node examples/trade-partners.mjs [slug]

import { Metamob, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) {
  console.error("This account has no quest.");
  process.exit(1);
}

const names = (monsters) => monsters.map((monster) => monster.name.fr).join(", ") || "nothing";

// Partners with whom the trade goes both ways, ten at most.
for (const match of await metamob.quests.matches(slug, { onlyPossibleTrades: true }).take(10)) {
  console.log(`${match.user.username} (${match.quest.character_name}), score ${match.match_score}`);
  console.log(`  gives you: ${names(match.matches.they_have_you_want)}`);
  console.log(`  wants:     ${names(match.matches.you_have_they_want)}`);
  console.log(`  ${urls.profile(match.user)}\n`);
}
