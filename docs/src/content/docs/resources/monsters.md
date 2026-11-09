---
title: Monstres
description: "Lire un monstre avec ses zones, lister les monstres par type et les chercher par nom."
sidebar:
  order: 4
---

## Lire un monstre

`monsters.get()` prend un nom, un identifiant ou un objet, voir [Noms et identifiants](/basics/names-and-ids/). La réponse contient aussi les zones et sous-zones où vit le monstre :

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // le monstre dont il est la version rare
urls.monsterImage(monster); // son image sur metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Quelques archimonstres portent le même nom dans deux versions du jeu. Précisez lequel avec une version du jeu, ou un modèle de quête avec `{ template }` :

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Lister et filtrer

`monsters.list()` est une [liste](/basics/lists/) de 200 monstres par page au plus :

```ts
// Une page de boss.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Tous les archimonstres.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}
```

`type` vaut `"monstre"`, `"boss"` ou `"archimonstre"`, leurs noms anglais ou espagnols, ou encore 1, 2 ou 3.

## Chercher par nom

`monsters.search()` cherche une partie du nom, en français, en anglais ou en espagnol, à partir de 3 caractères :

```ts
const found = await metamob.monsters.search("bouf").all();
const arch = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// La même chose, écrite avec list().
await metamob.monsters.list({ query: "bouf" });
```

## Sans requête

Les noms, les niveaux, les types et les zones des monstres sont aussi dans [les données du paquet](/basics/embedded-data/). Pour une autocomplétion, qui cherche à chaque frappe, c'est ce qu'il faut utiliser : une requête par frappe atteindrait vite la limite.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // aucune requête
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Passez par l'API pour les données du jour, par exemple juste après une mise à jour du jeu.

## Les monstres d'une quête

Les monstres que demande une quête, étape par étape, viennent des [modèles de quête](/resources/reference-data/#quest-templates). Ce que vous en possédez se lit dans [Vos quêtes](/resources/quests/#the-monsters-of-a-quest).

## Limites et erreurs

- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT` avant l'envoi.
- Un identifiant qui n'existe pas répond `NOT_FOUND`. Un nom qui n'existe pas lève `UNKNOWN_NAME`, avec des suggestions.
- Les réponses sont [mises en cache](/basics/caching/) pendant 10 minutes par défaut.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Monsters`](/reference/monsters/) | Les monstres du jeu. |
| [`urls`](/reference/urls/) | Des adresses sur metamob.fr, construites à partir de ce que renvoie l'API. |
| [`Monster`](/reference/monster/) | Un monstre. |
| [`MonsterDetail`](/reference/monster-detail/) | Un monstre avec les endroits où il vit. |
| [`MonsterListParams`](/reference/monster-list-params/) | Filtres de [`Monsters.list`](/reference/monsters/). |
| [`MonsterReference`](/reference/monster-reference/) | Le monstre de base d'un archimonstre. |
| [`MonsterType`](/reference/monster-type/) | Un type de monstre : 1 est un monstre, 2 un boss, 3 un archimonstre. |
| [`TemplateMonster`](/reference/template-monster/) | Un monstre d'un modèle de quête, avec l'étape à laquelle il appartient. |
<!-- exports:end -->
