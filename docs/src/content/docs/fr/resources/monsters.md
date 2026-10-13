---
title: Monstres
description: Cherchez les monstres du jeu par leur nom dans trois langues, filtrez-les par type, et lisez-en un avec les zones où il vit et, pour un archimonstre, le monstre dont il est la version rare.
sidebar:
  order: 4
---

```ts
const tofu = await metamob.monsters.get("Tofu Maléfique");

console.log(tofu.name.en); // "Evil Tofu"
console.log(tofu.level_min, tofu.level_max);
console.log(tofu.zones.map((zone) => zone.name.fr)); // ["Amakna"]
```

## Lire un monstre

`monsters.get()` prend un nom, un identifiant ou un objet, voir [Noms et identifiants](/basics/names-and-ids/). En plus de ce que donne une liste, la réponse contient les zones et les sous-zones où l'on trouve le monstre.

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // le monstre dont il est la version rare
urls.monsterImage(monster); // son image sur metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Quelques archimonstres portent le même nom dans deux versions du jeu. Une indication dit lequel vous voulez, ici une version du jeu, ou un modèle de quête avec `{ template }` :

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Lister et filtrer

`monsters.list()` est une [liste](/basics/lists/), de 200 monstres par page au plus.

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

Une recherche porte sur une partie du nom, en français, en anglais ou en espagnol. Elle demande au moins 3 caractères.

```ts
const found = await metamob.monsters.search("bouf").all();
const archmonsters = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// La même chose, écrite avec list().
await metamob.monsters.list({ query: "bouf" });
```

## Sans requête

Pour les noms, les niveaux, les types et les endroits où vit un monstre, [les données du paquet](/basics/embedded-data/) répondent depuis la mémoire. C'est le bon outil pour une autocomplétion, où une requête par frappe épuiserait la limite de requêtes en quelques secondes.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // aucune requête
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Interrogez l'API quand vous avez besoin de l'état du jeu à l'instant présent, par exemple juste après une mise à jour du jeu.

## Les monstres d'une quête

Quels monstres une quête demande, et à quelle étape, relève des [modèles de quête](/resources/reference-data/#quest-templates). Ce que vous en possédez se trouve dans [Vos quêtes](/resources/quests/#the-monsters-of-a-quest).

## Limites et erreurs

- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT` avant qu'une requête soit dépensée.
- Un identifiant qui n'existe pas répond `NOT_FOUND`. Un nom qui n'existe pas lève `UNKNOWN_NAME`, avec des suggestions.
- Les réponses sont [mises en cache](/basics/caching/) pendant 10 minutes par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `monsters.get(monster, { gameVersion, template }?, options?)` | `MonsterDetail` |
| `monsters.list({ query, type, limit, offset }, options?)` | une liste de `Monster` |
| `monsters.search(query, { type, limit, offset }, options?)` | une liste de `Monster` |

Un `Monster` :

| Champ | Type | Signification |
| --- | --- | --- |
| `id` | `number` | |
| `name` | `{ fr, en, es }` | Le nom dans trois langues |
| `image` | `string` | Nom de fichier de l'image, voir `urls.monsterImage()` |
| `level_min`, `level_max` | `number` | |
| `type` | `MonsterType \| null` | `{ id, name }` : monstre, boss ou archimonstre |
| `reference` | `{ id, name }` ou absent | Pour un archimonstre, son monstre de base |
| `zones` | `ZoneDetail[]` | Seulement avec `get()` : les zones, chacune avec les sous-zones concernées |

## Voir aussi

- [Noms et identifiants](/basics/names-and-ids/)
- [Les données du paquet](/basics/embedded-data/)
- [Zones](/resources/zones/)
- [Données de référence](/resources/reference-data/)
