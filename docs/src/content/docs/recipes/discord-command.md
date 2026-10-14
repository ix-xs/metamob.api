---
title: Une commande Discord avec autocomplétion
description: "Une commande slash qui enregistre un monstre dans la quête d'un joueur, avec le nom complété pendant la saisie. L'autocomplétion s'appuie sur les données du paquet : elle ne dépense donc jamais de requête."
sidebar:
  order: 1
---

## Ce que vous obtenez

Une commande `/caught`. Le joueur commence à taper le nom d'un monstre, Discord affiche jusqu'à 25 noms qui correspondent, dans n'importe laquelle des trois langues. À l'envoi, le monstre est ajouté à sa quête avec sa propre clé Metamob, et la réponse indique combien il en reste à trouver.

Elle utilise [discord.js](https://discord.js.org) pour la partie Discord. La partie Metamob est la même avec n'importe quelle autre bibliothèque.

## La commande

```js
import { SlashCommandBuilder } from "discord.js";

export const caught = new SlashCommandBuilder()
  .setName("caught")
  .setDescription("Record a monster you just caught")
  .addStringOption((option) => option.setName("monster").setDescription("Name of the monster").setRequired(true).setAutocomplete(true))
  .addIntegerOption((option) => option.setName("quantity").setDescription("How many you own now").setMinValue(0).setMaxValue(30));
```

## Compléter le nom

Discord demande des suggestions à chaque frappe et veut une réponse en moins de trois secondes. Une requête à l'API par frappe serait lente et viderait la limite de requêtes de la clé. `data.searchMonsters()` lit le paquet à la place : cela prend quelques microsecondes et ne demande aucune clé.

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

La valeur renvoyée est l'identifiant, sous forme de chaîne. Un identifiant n'est jamais ambigu, même pour les quelques monstres qui partagent un nom.

Pour ne proposer que les monstres du type de quête du joueur, passez un modèle de quête :

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Enregistrer le monstre

Chaque joueur a enregistré sa propre clé au préalable, voir [Agir pour d'autres joueurs](/basics/many-keys/). `withKey()` donne un client qui agit en son nom.

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// Un seul client pour tout le bot : il porte le cache et le limiteur.
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

La réponse est d'abord différée : Discord laisse trois secondes pour répondre, et un appel peut attendre son tour dans le limiteur.

Un joueur qui tape le nom sans choisir de suggestion passe quand même : le texte est résolu comme n'importe quel [nom](/basics/names-and-ids/), et une faute de frappe revient avec les noms les plus proches.

## Enregistrer une clé

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

Gardez la réponse éphémère, pour que la clé n'apparaisse jamais dans un salon, et stockez la clé chiffrée.

## Aller plus loin

- Plusieurs quêtes par joueur : listez-les avec `quests.list()` et ajoutez une option `quest`, complétée à partir de ce que vous avez stocké.
- Une commande `/where` ne demande aucune clé : [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) indique où vit un monstre.
- Tous les monstres d'une capture d'écran en une fois : [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) écrit 200 monstres en une seule requête.

## Voir aussi

- [Les données du paquet](/basics/embedded-data/)
- [Agir pour d'autres joueurs](/basics/many-keys/)
- [Vos quêtes](/resources/quests/)
- [Erreurs](/basics/errors/)
