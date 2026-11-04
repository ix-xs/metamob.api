---
title: Un comando de Discord con autocompletado
description: "Un comando de barra que registra un monstruo en la misión de un jugador, con autocompletado del nombre."
sidebar:
  order: 1
---

## Lo que obtienes

Un comando `/caught`. Mientras el jugador escribe el nombre de un monstruo, Discord propone hasta 25 nombres, en uno de los tres idiomas. Al enviarlo, el monstruo se registra en su misión con su propia clave de Metamob, y la respuesta dice cuántos le quedan por encontrar.

El ejemplo usa [discord.js](https://discord.js.org). La parte de Metamob es la misma con otra biblioteca.

## El comando

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

## Completar el nombre

Discord pide sugerencias en cada pulsación de tecla, y espera una respuesta en menos de tres segundos. Una solicitud por pulsación alcanzaría pronto el límite de la clave: `data.searchMonsters()` busca en cambio en los datos del paquete, sin solicitud ni clave.

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

El valor elegido es el identificador del monstruo, en forma de cadena: nunca es ambiguo, ni siquiera para los monstruos que comparten nombre.

Para proponer solo los monstruos de la misión del jugador, pasa una plantilla de misión:

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Registrar el monstruo

Cada jugador ha registrado antes su clave (consulta más abajo, y [Actuar por otros jugadores](/basics/many-keys/)). `withKey()` da un cliente que actúa en su nombre:

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// Un solo cliente para todo el bot.
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

La respuesta se difiere primero: Discord deja tres segundos para responder, y una llamada puede esperar su turno si se ha alcanzado el límite de solicitudes.

Si el jugador escribe el nombre sin elegir una sugerencia, el texto se lee como cualquier [nombre](/basics/names-and-ids/), y una errata vuelve con los nombres más parecidos.

## Registrar una clave

Un comando `/register` comprueba la clave del jugador con `me()`, y luego la guarda con el slug de su misión:

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

Las respuestas son efímeras, para que nada de esto aparezca en un canal. Guarda la clave cifrada.

## Ir más lejos

- Varias misiones por jugador: lístalas con `quests.list()` y añade una opción `quest`.
- Un comando `/where` sin clave: [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) dice dónde vive un monstruo.
- Varios monstruos a la vez: [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) escribe hasta 200 por solicitud.
