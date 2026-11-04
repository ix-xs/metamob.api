---
title: A Discord command with autocomplete
description: "A slash command that records a monster in a player's quest, with autocomplete on the name."
sidebar:
  order: 1
---

## What you get

A `/caught` command. While the player types the name of a monster, Discord offers up to 25 names, in any of the three languages. On submit, the monster is recorded in their quest with their own Metamob key, and the reply says how many are left to find.

The example uses [discord.js](https://discord.js.org). The Metamob part is the same with another library.

## The command

```js
import { SlashCommandBuilder } from "discord.js";

export const caught = new SlashCommandBuilder()
  .setName("caught")
  .setDescription("Record a monster you just caught")
  .addStringOption((option) =>
    option
      .setName("monster")
      .setDescription("Name of the monster")
      .setRequired(true)
      .setAutocomplete(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("quantity")
      .setDescription("How many you own now")
      .setMinValue(0)
      .setMaxValue(99),
  );
```

## Completing the name

Discord asks for suggestions on every keystroke, and expects an answer within three seconds. One request per keystroke would quickly reach the limit of the key: `data.searchMonsters()` searches the data in the package instead, with no request and no key.

```ts
import { data } from "@ix-xs/metamob.api";

export async function autocomplete(interaction: any) {
  const typed: string = interaction.options.getFocused();

  const choices = data.searchMonsters(typed, { limit: 25 }).map((monster) => ({
    name: `${monster.name.fr} (${monster.type?.name.fr})`,
    value: String(monster.id),
  }));

  await interaction.respond(choices);
}
```

The chosen value is the id of the monster, as a string: it is never ambiguous, even for the monsters that share a name.

To offer only the monsters of the player's quest, pass a quest template:

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Recording the monster

Each player first registered their key (see below, and [Acting for other players](/basics/many-keys/)). `withKey()` gives a client that acts on their behalf:

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// One client for the whole bot.
const base = new Metamob();

export async function execute(interaction: any) {
  const player = await db.players.find(interaction.user.id);
  if (!player) {
    const content = "Register your Metamob key first with /register.";
    return interaction.reply({ content, ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const theirs = base.withKey(player.key);
  const monster: string = interaction.options.getString("monster", true);
  const quantity: number = interaction.options.getInteger("quantity") ?? 1;

  try {
    const result = await theirs.quests.setMonster(player.slug, monster, quantity);
    const needed = theirs.quests.monsters(player.slug, { status: "needed" });
    const left = await needed.count();
    const name = data.monster(result.monster_id)?.name.fr ?? monster;
    await interaction.editReply(`${name}: ${result.owned} owned, ${left} to find.`);
  } catch (error) {
    await interaction.editReply(explain(error));
  }
}

function explain(error: unknown): string {
  if (isMetamobError(error, "UNKNOWN_NAME")) return error.message;
  if (isMetamobError(error, "UNAUTHORIZED")) return "Your Metamob key no longer works.";
  if (isMetamobError(error, "NOT_FOUND")) return "This monster is not in your quest.";
  if (isMetamobError(error, "RATE_LIMITED")) return "Try again in a minute.";
  throw error;
}
```

The reply is deferred first: Discord gives three seconds to answer, and a call can wait for its turn if the rate limit is reached.

If the player types the name without picking a suggestion, the text is read like any [name](/basics/names-and-ids/), and a typo comes back with the closest names.

## Registering a key

A `/register` command checks the player's key with `me()`, then stores it with the slug of their quest:

```ts
export async function register(interaction: any) {
  const key: string = interaction.options.getString("key", true);

  try {
    const theirs = base.withKey(key);
    const account = await theirs.me();
    const quests = await theirs.quests.list();
    const quest = quests[0];
    if (!quest) {
      return interaction.reply({ content: "No quest yet.", ephemeral: true });
    }

    await db.players.save(interaction.user.id, { key, slug: quest.slug });
    const content = `Linked to ${account.username}, quest of ${quest.character_name}.`;
    await interaction.reply({ content, ephemeral: true });
  } catch (error) {
    if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
    await interaction.reply({ content: "This is not a valid Metamob key.", ephemeral: true });
  }
}
```

The replies are ephemeral, so none of this shows in a channel. Store the key encrypted.

## Going further

- Several quests per player: list them with `quests.list()` and add a `quest` option.
- A `/where` command without a key: [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) says where a monster lives.
- Several monsters at once: [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) writes up to 200 per request.
