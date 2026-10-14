---
title: A Discord command with autocomplete
description: A slash command that records a monster in a player's quest, with the name completed as they type. The autocomplete runs on the data in the package, so it never spends a request.
sidebar:
  order: 1
---

## What you get

A `/caught` command. The player starts typing a monster, Discord shows up to 25 names that match, in any of the three languages. On submit, the monster is added to their quest with their own Metamob key, and the reply says how many are left to find.

It uses [discord.js](https://discord.js.org) for the Discord side. The Metamob side is the same with any other library.

## The command

```js
import { SlashCommandBuilder } from "discord.js";

export const caught = new SlashCommandBuilder()
  .setName("caught")
  .setDescription("Record a monster you just caught")
  .addStringOption((option) => option.setName("monster").setDescription("Name of the monster").setRequired(true).setAutocomplete(true))
  .addIntegerOption((option) => option.setName("quantity").setDescription("How many you own now").setMinValue(0).setMaxValue(30));
```

## Completing the name

Discord asks for suggestions on every keystroke and wants an answer within three seconds. A request to the API per keystroke would be slow and would empty the rate limit of the key. `data.searchMonsters()` reads the package instead: it takes a few microseconds and needs no key.

```ts
import { data } from "@ix-xs/metamob.api";

export async function autocomplete(interaction: any) {
  const typed: string = interaction.options.getFocused();

  const choices = data.searchMonsters(typed, { limit: 25 }).map((monster) => ({
    name: `${monster.name.fr} (${monster.type?.name.fr}, niv. ${monster.level_min}-${monster.level_max})`,
    value: String(monster.id),
  }));

  await interaction.respond(choices);
}
```

The value sent back is the id, as a string. An id is never ambiguous, even for the few monsters that share a name.

To offer only the monsters of the player's kind of quest, pass a template:

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Recording the monster

Each player registered their own key beforehand, see [Acting for other players](/basics/many-keys/). `withKey()` gives a client that acts as them.

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// One client for the whole bot: it holds the cache and the rate limiter.
const base = new Metamob();

export async function execute(interaction: any) {
  const player = await db.players.find(interaction.user.id);
  if (!player) return interaction.reply({ content: "Register your Metamob key first with /register.", ephemeral: true });

  await interaction.deferReply({ ephemeral: true });
  const theirs = base.withKey(player.key);
  const monster: string = interaction.options.getString("monster", true);
  const quantity: number = interaction.options.getInteger("quantity") ?? 1;

  try {
    const result = await theirs.quests.setMonster(player.slug, monster, quantity);
    const left = await theirs.quests.monsters(player.slug, { status: "needed" }).count();
    const name = data.monster(result.monster_id)?.name.fr ?? monster;
    await interaction.editReply(`${name}: ${result.owned} owned. ${left} monsters still to find.`);
  } catch (error) {
    await interaction.editReply(explain(error));
  }
}

function explain(error: unknown): string {
  if (isMetamobError(error, "UNKNOWN_NAME")) return error.message; // Unknown monster "...". Did you mean "..."?
  if (isMetamobError(error, "UNAUTHORIZED")) return "Your Metamob key no longer works. Register a new one with /register.";
  if (isMetamobError(error, "NOT_FOUND")) return "Your quest was not found, or this monster is not part of it.";
  if (isMetamobError(error, "RATE_LIMITED")) return "Metamob is busy, try again in a minute.";
  throw error;
}
```

The reply is deferred first: Discord gives three seconds to answer, and a call can wait for its turn in the rate limiter.

A player who types the name without picking a suggestion still gets through: the text is resolved like any [name](/basics/names-and-ids/), and a typo comes back with the closest names.

## Registering a key

```ts
export async function register(interaction: any) {
  const key: string = interaction.options.getString("key", true);

  try {
    const theirs = base.withKey(key);
    const account = await theirs.me();
    const quests = await theirs.quests.list();
    const quest = quests[0];
    if (!quest) return interaction.reply({ content: "This account has no quest yet.", ephemeral: true });

    await db.players.save(interaction.user.id, { key, slug: quest.slug, username: account.username });
    await interaction.reply({ content: `Linked to ${account.username}, quest of ${quest.character_name}.`, ephemeral: true });
  } catch (error) {
    if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
    await interaction.reply({ content: "This is not a valid Metamob key.", ephemeral: true });
  }
}
```

Keep the reply ephemeral, so the key never shows in a channel, and store it encrypted.

## Going further

- Several quests per player: list them with `quests.list()` and add a `quest` option, completed from what you stored.
- A `/where` command needs no key at all: [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) says where a monster lives.
- A whole screenshot of catches at once: [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) writes 200 monsters in one request.

## See also

- [The data in the package](/basics/embedded-data/)
- [Acting for other players](/basics/many-keys/)
- [Your quests](/resources/quests/)
- [Errors](/basics/errors/)
