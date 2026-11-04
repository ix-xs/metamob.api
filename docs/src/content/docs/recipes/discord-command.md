---
title: Une commande Discord avec autocomplétion
description: "Une commande slash qui enregistre un monstre dans la quête d'un joueur, avec une autocomplétion du nom."
sidebar:
  order: 1
---

## Ce que vous obtenez

Une commande `/caught`. Pendant que le joueur tape le nom d'un monstre, Discord propose jusqu'à 25 noms, dans l'une des trois langues. À l'envoi, le monstre est enregistré dans sa quête avec sa propre clé Metamob, et la réponse dit combien il en reste à trouver.

L'exemple utilise [discord.js](https://discord.js.org). La partie Metamob est la même avec une autre bibliothèque.

## La commande

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

## Compléter le nom

Discord demande des suggestions à chaque frappe, et attend une réponse en moins de trois secondes. Une requête par frappe atteindrait vite la limite de la clé : `data.searchMonsters()` cherche plutôt dans les données du paquet, sans requête ni clé.

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

La valeur choisie est l'identifiant du monstre, sous forme de chaîne : il n'est jamais ambigu, même pour les monstres qui partagent un nom.

Pour ne proposer que les monstres de la quête du joueur, passez un modèle de quête :

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Enregistrer le monstre

Chaque joueur a d'abord enregistré sa clé (voir plus bas, et [Agir pour d'autres joueurs](/basics/many-keys/)). `withKey()` donne un client qui agit en son nom :

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// Un seul client pour tout le bot.
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

La réponse est d'abord différée : Discord laisse trois secondes pour répondre, et un appel peut attendre son tour si la limite de requêtes est atteinte.

Si le joueur tape le nom sans choisir de suggestion, le texte est lu comme n'importe quel [nom](/basics/names-and-ids/), et une faute de frappe revient avec les noms les plus proches.

## Enregistrer une clé

Une commande `/register` vérifie la clé du joueur avec `me()`, puis la garde avec le slug de sa quête :

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

Les réponses sont éphémères, pour que rien de tout cela n'apparaisse dans un salon. Stockez la clé chiffrée.

## Aller plus loin

- Plusieurs quêtes par joueur : listez-les avec `quests.list()` et ajoutez une option `quest`.
- Une commande `/where` sans clé : [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) dit où vit un monstre.
- Plusieurs monstres à la fois : [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) en écrit jusqu'à 200 par requête.
