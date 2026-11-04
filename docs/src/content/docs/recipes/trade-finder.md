---
title: Un chercheur d'échanges
description: "Un script qui trouve qui peut vous donner un monstre, et ce que vous pourriez lui donner en retour."
sidebar:
  order: 3
---

## Ce que vous obtenez

Un script qui prend un monstre qui vous manque, et liste les joueurs qui le proposent :

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## Le script

```ts title="trade.ts"
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lit METAMOB_API_KEY

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

  if (++found === 5) break; // plus aucune page n'est demandée
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
node --env-file=.env trade.js 21b0a742 bouflet le pueril
```

## Pourquoi il coûte peu

Le monstre est cherché dans [les données du paquet](/basics/embedded-data/), sans requête : une faute de frappe est repérée avant tout envoi.

Les partenaires arrivent par pages de 50, et la boucle s'arrête au cinquième trouvé. Un monstre courant coûte donc une requête, un monstre rare quelques-unes.

## Vérifier un partenaire avant de lui écrire

La quête publique d'un partenaire dit ce qu'il recherche d'autre :

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const { user, quest } = match;
  const theirs = await metamob.users.quest(user.username, quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Tout ce que vous pourriez obtenir en un seul passage

Dans l'autre sens : pour chaque monstre qui vous manque, qui le propose.

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

// Les plus rares d'abord : ceux que peu de joueurs proposent.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` s'arrête après 100 partenaires, soit deux requêtes.

## Garder un monstre pour un ami

Une fois un échange convenu, retirez le monstre des autres échanges avec un réglage manuel, puis rendez-le au calcul :

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... l'échange a lieu en jeu ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```
