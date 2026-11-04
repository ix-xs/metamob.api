---
title: Un rapport de progression
description: "Un script qui affiche où en est une quête et dans quelles zones chasser ensuite, en trois requêtes."
sidebar:
  order: 2
---

## Ce que vous obtenez

Un script qui affiche l'avancement d'une quête et les zones où il manque le plus de monstres :

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 64 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## Le script

```ts title="progress.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lit METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 requête : la quête elle-même.
const quest = await metamob.quests.get(slug);
const steps = quest.quest_template.step_count;
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${steps}`);

// 1 requête : combien de monstres manquent encore.
const total = quest.quest_template.monster_count;
const needed = metamob.quests.monsters(slug, { status: "needed" });
const missing = (await needed.count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 requête : tout, par zone.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // Un monstre est dans chaque sous-zone où il vit : un Set le compte une fois.
    const names = new Set();
    for (const subzone of zone.subzones) {
      for (const monster of subzone.monsters) {
        if (monster.status === "incomplete") names.add(monster.name.fr);
      }
    }
    return { zone: zone.name.fr, names: [...names] };
  })
  .filter((entry) => entry.names.length > 0)
  .sort((a, b) => b.names.length - a.names.length);

console.log("Hunt next:");
for (const { zone, names } of report.slice(0, 5)) {
  const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
  const count = String(names.length).padStart(3);
  console.log(`  ${zone.padEnd(24)} ${count} missing   ${shown}`);
}
```

Lancez-le avec le slug d'une quête, ou sans argument pour la première quête du compte :

```bash
node --env-file=.env progress.js 21b0a742
```

## Pourquoi trois requêtes

- `count()` ne demande que le total, pas la liste des monstres.
- `quests.zones()` renvoie toute la quête en une réponse, déjà rangée par zone.
- Les noms des zones et des monstres sont dans les réponses.

Lister tous les monstres et les ranger vous-même marcherait aussi, avec plus de requêtes : 600 monstres font trois pages de 200.

## Seulement les archimonstres, seulement une zone

`quests.zones()` accepte des filtres, qui réduisent la réponse :

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## Ce que vous pouvez échanger

La même quête, côté échange : ce que vous avez en trop, et ce que la quête en propose une fois vos réglages appliqués :

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}, keeps ${kept}`);
}
```

## Pour quelqu'un d'autre

Avec la clé qu'un joueur vous a confiée, le même script tourne en son nom :

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Sans sa clé, [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest) montre quand même ce que recherche une quête publique.
