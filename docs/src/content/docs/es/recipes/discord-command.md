---
title: Un comando de Discord con autocompletado
description: "Un comando de barra que registra un monstruo en la misión de un jugador, con el nombre completado mientras escribe. El autocompletado usa los datos del paquete, así que nunca gasta una solicitud."
sidebar:
  order: 1
---

## Lo que obtienes

Un comando `/caught`. El jugador empieza a escribir un monstruo y Discord muestra hasta 25 nombres que coinciden, en cualquiera de los tres idiomas. Al enviar, el monstruo se añade a su misión con su propia clave de Metamob, y la respuesta dice cuántos quedan por encontrar.

Usa [discord.js](https://discord.js.org) para la parte de Discord. La parte de Metamob es la misma con cualquier otra biblioteca.

## El comando

```js
import { SlashCommandBuilder } from "discord.js";

export const caught = new SlashCommandBuilder()
  .setName("caught")
  .setDescription("Record a monster you just caught")
  .addStringOption((option) => option.setName("monster").setDescription("Name of the monster").setRequired(true).setAutocomplete(true))
  .addIntegerOption((option) => option.setName("quantity").setDescription("How many you own now").setMinValue(0).setMaxValue(30));
```

## Completar el nombre

Discord pide sugerencias con cada tecla y quiere una respuesta en menos de tres segundos. Una solicitud a la API por tecla sería lenta y agotaría el límite de solicitudes de la clave. `data.searchMonsters()` lee el paquete en su lugar: tarda unos microsegundos y no necesita clave.

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

El valor que se devuelve es el identificador, como cadena. Un identificador nunca es ambiguo, ni siquiera para los pocos monstruos que comparten nombre.

Para proponer solo los monstruos del tipo de misión del jugador, pasa una plantilla:

```ts
const ochreOnUnity = { questType: "ocre", gameVersion: "Dofus (Unity)" } as const;

data.searchMonsters("tofu", { template: ochreOnUnity, limit: 25 });
```

## Registrar el monstruo

Cada jugador registró antes su propia clave, ver [Actuar por otros jugadores](/basics/many-keys/). `withKey()` da un cliente que actúa en su nombre.

```ts
import { Metamob, data, isMetamobError } from "@ix-xs/metamob.api";

// Un solo cliente para todo el bot: guarda la caché y el limitador.
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

La respuesta se difiere primero: Discord da tres segundos para responder, y una llamada puede esperar su turno en el limitador.

Un jugador que escribe el nombre sin elegir una sugerencia también pasa: el texto se resuelve como cualquier [nombre](/basics/names-and-ids/), y una errata vuelve con los nombres más parecidos.

## Registrar una clave

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

Mantén la respuesta efímera, para que la clave nunca aparezca en un canal, y guárdala cifrada.

## Para ir más lejos

- Varias misiones por jugador: lístalas con `quests.list()` y añade una opción `quest`, completada a partir de lo que guardaste.
- Un comando `/where` no necesita ninguna clave: [`data.subzonesOf()`](/basics/embedded-data/#following-the-links) dice dónde vive un monstruo.
- Toda una captura de pantalla de monstruos capturados de una vez: [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) escribe 200 monstruos en una sola solicitud.

## Ver también

- [Los datos del paquete](/basics/embedded-data/)
- [Actuar por otros jugadores](/basics/many-keys/)
- [Tus misiones](/resources/quests/)
- [Errores](/basics/errors/)
