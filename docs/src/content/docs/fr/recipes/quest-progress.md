---
title: Un rapport de progression
description: "Un script qui affiche où en est l'une de vos quêtes, ce qu'il reste à trouver dans chaque zone, et dans quelle zone chasser ensuite. Trois requêtes, quelle que soit la taille de la quête."
sidebar:
  order: 2
---

## Ce que vous obtenez

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 63 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## Le script

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lit METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 requête : la quête elle-même.
const quest = await metamob.quests.get(slug);
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${quest.quest_template.step_count}`);

// 1 requête : combien de monstres manquent encore.
const total = quest.quest_template.monster_count;
const missing = (await metamob.quests.monsters(slug, { status: "needed" }).count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 requête : tout, par zone.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // Un monstre apparaît dans chaque sous-zone où il vit : il est compté une fois par zone.
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
  console.log(`  ${zone.padEnd(24)} ${String(names.length).padStart(3)} missing   ${shown}`);
}
```

Lancez-le avec le slug d'une quête, ou sans rien pour prendre la première quête du compte :

```bash
METAMOB_API_KEY=your-key node progress.mjs 21b0a742
```

## Pourquoi trois requêtes

- `count()` demande un seul élément et lit le total, au lieu de parcourir des centaines de monstres page après page pour les compter.
- `quests.zones()` répond pour toute la quête en une fois, déjà regroupée.
- Les noms des zones et des monstres reviennent dans les réponses. Il n'y a rien à aller chercher ailleurs.

Lister tous les monstres et les regrouper vous-même fonctionnerait aussi, avec plus de requêtes : une quête de 600 monstres représente trois pages de 200.

## Seulement les archimonstres, seulement une zone

`quests.zones()` filtre côté serveur, ce qui réduit la réponse.

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## Ce que vous pouvez échanger

La même quête, vue de l'autre côté : ce que vous possédez en trop, et ce que la quête propose réellement une fois vos réglages d'échange appliqués.

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}`, kept > 0 ? `(keeps ${kept} back)` : "");
}
```

## Pour quelqu'un d'autre

Avec la clé d'un joueur qui vous l'a donnée, le même script s'exécute en son nom :

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Sans sa clé, une quête publique montre quand même ce que son propriétaire recherche, grâce à [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest).

## Voir aussi

- [Vos quêtes](/resources/quests/)
- [Listes](/basics/lists/)
- [Échanges](/resources/trading/)
- [La limite de requêtes](/basics/rate-limit/)
