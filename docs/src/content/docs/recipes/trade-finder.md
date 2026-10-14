---
title: Un chercheur d'échanges
description: "Un script qui trouve qui peut vous donner un monstre qui vous manque, et ce que vous pourriez lui donner en retour, prêt à coller dans un message."
sidebar:
  order: 3
---

## Ce que vous obtenez

```text
Looking for Bouflet le Puéril

PlayerName (score 14, seen 2026-10-13)
  has 2 available
  wants from you: Tofuldebeu l'Explosif, Boufdégou le Refoulant
  https://www.metamob.fr/profile/PlayerName
```

## Le script

```ts
import { Metamob, data, urls } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lit METAMOB_API_KEY

const [slug, ...words] = process.argv.slice(2);
const wanted = data.monster(words.join(" "));
if (!slug || !wanted) {
  const close = data.suggest("monster", words.join(" "));
  throw new Error(close.length ? `Did you mean ${close.join(", ")}?` : "Usage: node trade.mjs <slug> <monster>");
}

console.log(`Looking for ${wanted.name.fr}\n`);

let found = 0;
// Les partenaires avec qui un échange peut se faire dans les deux sens, la meilleure correspondance d'abord.
for await (const match of metamob.quests.matches(slug, { onlyPossibleTrades: true })) {
  const offer = match.matches.they_have_you_want.find((monster) => monster.id === wanted.id);
  if (!offer) continue;

  console.log(`${match.user.username} (score ${match.match_score}, seen ${match.user.last_active.slice(0, 10)})`);
  console.log(`  has ${offer.available} available`);
  console.log(`  wants from you: ${match.matches.you_have_they_want.map((monster) => monster.name.fr).join(", ")}`);
  console.log(`  ${urls.profile(match.user)}\n`);

  // Quitter la boucle arrête les requêtes : seules les pages lues ont été demandées.
  if (++found === 5) break;
}

if (!found) console.log("Nobody offers it right now among your matches.");
```

```bash
METAMOB_API_KEY=your-key node trade.mjs 21b0a742 bouflet le pueril
```

## Pourquoi il coûte peu

Le monstre est trouvé dans [les données du paquet](/basics/embedded-data/), sans requête, et une faute de frappe est repérée avant tout envoi.

Les correspondances arrivent par pages de 50. La boucle les lit dans l'ordre et s'arrête au cinquième partenaire : un monstre courant coûte donc une requête, et un monstre rare quelques-unes. Sans le `break`, toutes les pages seraient lues.

## Vérifier un partenaire avant de lui écrire

Une correspondance indique ce qu'un joueur propose aujourd'hui. Sa quête publique dit le reste : combien d'exemplaires il possède, et ce qu'il recherche d'autre.

```ts
const match = await metamob.quests.matches(slug).first();

if (match) {
  const theirs = await metamob.users.quest(match.user.username, match.quest.slug, { status: "wanted" }).all();
  console.log(theirs.map((monster) => `${monster.name.fr} x${monster.want}`));
}
```

## Tout ce que vous pourriez obtenir en un seul passage

Retournez la question : pour chaque monstre qui vous manque, qui le possède.

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

// Les plus rares d'abord : les monstres que seuls un ou deux joueurs proposent.
const rarest = [...sources].sort((a, b) => a[1].length - b[1].length).slice(0, 10);
for (const [monster, players] of rarest) console.log(monster, players.join(", "));
```

`pages({ limit: 100 })` s'arrête après les pages qui contiennent 100 partenaires : deux requêtes.

## Garder un monstre pour un ami

Une fois un échange convenu, tenez le monstre à l'écart des autres échanges avec un réglage manuel, puis libérez-le ensuite.

```ts
await metamob.quests.setTrade(slug, "Tofuldebeu l'Explosif", { trade_offer: 0 });
// ... l'échange a lieu en jeu ...
await metamob.quests.resetTrade(slug, "Tofuldebeu l'Explosif");
```

## Voir aussi

- [Échanges](/resources/trading/)
- [Autres joueurs](/resources/users/)
- [Listes](/basics/lists/)
- [Conversations](/resources/conversations/)
