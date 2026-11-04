---
title: Un buscador de intercambios
description: "Un script que encuentra quién puede darte un monstruo, y lo que podrías darle a cambio."
sidebar:
  order: 3
---

## Lo que obtienes

Un script que toma un monstruo que te falta, y lista los jugadores que lo ofrecen:

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## El script

```ts title="trade.ts"
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lee METAMOB_API_KEY

const [slug, ...words] = process.argv.slice(2);
const wanted = data.monster(words.join(" "));
if (!slug || !wanted) {
  const close = data.suggest("monster", words.join(" "));
  if (close.length) throw new Error(`Did you mean ${close.join(", ")}?`);
  throw new Error("Usage: node trade.js <slug> <monster>");
}

console.log(`Looking for ${wanted.name.fr}\n`);

let found = 0;
const partners = metamob.quests.matches(slug, { onlyPossibleTrades: true });

for await (const { user, matches, match_score } of partners) {
  const offer = matches.they_have_you_want.find((monster) => monster.id === wanted.id);
  if (!offer) continue;

  const wants = matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(`${user.username} (score ${match_score}, seen ${user.last_active.slice(0, 10)})`);
  console.log(`  has ${offer.available} available`);
  console.log(`  wants from you: ${wants.join(", ")}`);
  console.log(`  ${urls.profile(user)}\n`);

  if (++found === 5) break; // ya no se pide ninguna página más
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
node --env-file=.env trade.js 21b0a742 bouflet le pueril
```

## Por qué cuesta poco

El monstruo se busca en [los datos del paquete](/basics/embedded-data/), sin solicitud: una errata se detecta antes de cualquier envío.

Los socios llegan en páginas de 50, y el bucle se detiene en el quinto encontrado. Un monstruo común cuesta, por tanto, una solicitud, y un monstruo raro unas pocas.

## Comprobar un socio antes de escribirle

La misión pública de un socio dice qué más busca:

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const { user, quest } = match;
  const theirs = await metamob.users.quest(user.username, quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Todo lo que podrías obtener de una sola pasada

En el otro sentido: para cada monstruo que te falta, quién lo ofrece.

```ts
const sources = new Map<string, string[]>();

const partners = metamob.quests.matches(slug, { onlyPossibleTrades: true });

for await (const page of partners.pages({ limit: 100 })) {
  for (const partner of page.items) {
    for (const monster of partner.matches.they_have_you_want) {
      const players = sources.get(monster.name.fr) ?? [];
      players.push(partner.user.username);
      sources.set(monster.name.fr, players);
    }
  }
}

// Los más raros primero: los que ofrecen pocos jugadores.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` se detiene después de 100 socios, es decir, dos solicitudes.

## Reservar un monstruo para un amigo

Una vez acordado un intercambio, retira el monstruo de los demás intercambios con un ajuste manual, y luego devuélvelo al cálculo:

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... el intercambio se hace en el juego ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```
