---
title: Un buscador de intercambios
description: "Un script que encuentra quién puede darte un monstruo que te falta y lo que podrías darle a cambio, listo para pegar en un mensaje."
sidebar:
  order: 3
---

## Lo que obtienes

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## El script

```ts
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lee METAMOB_API_KEY

const [slug, ...words] = process.argv.slice(2);
const wanted = data.monster(words.join(" "));
if (!slug || !wanted) {
  const close = data.suggest("monster", words.join(" "));
  throw new Error(close.length ? `Did you mean ${close.join(", ")}?` : "Usage: node trade.mjs <slug> <monster>");
}

console.log(`Looking for ${wanted.name.fr}\n`);

let found = 0;
// Socios con los que algo puede ir en ambos sentidos, la mejor coincidencia primero.
for await (const match of metamob.quests.matches(slug, { onlyPossibleTrades: true })) {
  const offer = match.matches.they_have_you_want.find((monster) => monster.id === wanted.id);
  if (!offer) continue;

  console.log(`${match.user.username} (score ${match.match_score}, seen ${match.user.last_active.slice(0, 10)})`);
  console.log(`  has ${offer.available} available`);
  console.log(`  wants from you: ${match.matches.you_have_they_want.map((monster) => monster.name.fr).join(", ")}`);
  console.log(`  ${urls.profile(match.user)}\n`);

  // Salir del bucle detiene las solicitudes: solo se pidieron las páginas que se leyeron.
  if (++found === 5) break;
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
METAMOB_API_KEY=your-key node trade.mjs 21b0a742 bouflet le pueril
```

## Por qué cuesta poco

El monstruo se encuentra en [los datos del paquete](/basics/embedded-data/), sin ninguna solicitud, y una errata se detecta antes de enviar nada.

Las coincidencias llegan a razón de 50 por página. El bucle las lee en orden y se detiene en el quinto socio, así que un monstruo común cuesta una solicitud y uno raro, unas pocas. Sin el `break`, se leerían todas las páginas.

## Comprobar un socio antes de escribirle

Una coincidencia dice lo que un jugador ofrece hoy. Su misión pública dice el resto: cuántos ejemplares posee y qué más busca.

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const theirs = await metamob.users.quest(match.user.username, match.quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Todo lo que podrías conseguir de una pasada

Dale la vuelta a la pregunta: para cada monstruo que te falta, quién lo tiene.

```ts
const sources = new Map<string, string[]>();

for await (const page of metamob.quests.matches(slug, { onlyPossibleTrades: true }).pages({ limit: 100 })) {
  for (const partner of page.items) {
    for (const monster of partner.matches.they_have_you_want) {
      const players = sources.get(monster.name.fr) ?? [];
      players.push(partner.user.username);
      sources.set(monster.name.fr, players);
    }
  }
}

// Los más raros primero: los monstruos que solo ofrecen uno o dos jugadores.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` se detiene tras las páginas que contienen 100 socios: dos solicitudes.

## Reservar un monstruo para un amigo

Una vez acordado un intercambio, deja el monstruo fuera de los demás intercambios con un ajuste manual y libéralo después.

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... el intercambio se hace en el juego ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```

## Ver también

- [Intercambios](/resources/trading/)
- [Otros jugadores](/resources/users/)
- [Listas](/basics/lists/)
- [Conversaciones](/resources/conversations/)
