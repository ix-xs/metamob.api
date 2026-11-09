---
title: Zones
description: "Lire les zones et les sous-zones du jeu, et les monstres qui vivent dans une sous-zone."
sidebar:
  order: 5
---

Le monde du jeu est découpé en zones, elles-mêmes découpées en sous-zones.

## Zones

`zones.list()` liste les zones, et `zones.get()` en lit une avec ses sous-zones :

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // 3 caractères au moins

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

Une zone est un nom, un identifiant ou un objet, voir [Noms et identifiants](/basics/names-and-ids/). Les noms fonctionnent en français, en anglais et en espagnol : `"Sufokia Bay"` désigne `"Baie de Sufokia"`.

## Sous-zones

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

L'API lit une sous-zone à travers sa zone. Pour les sous-zones du paquet, la bibliothèque retrouve la zone elle-même.

Pour une sous-zone ajoutée au jeu après la publication du paquet, donnez aussi la zone :

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Les monstres d'une sous-zone

`zones.monsters()` renvoie les monstres d'une sous-zone, en un seul tableau :

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

Dans l'autre sens, d'un monstre vers ses zones, voir [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Parcourir une zone

Les objets renvoyés peuvent être passés tels quels aux appels suivants :

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Cela fait une requête par sous-zone. Le même parcours se fait sans requête avec [les données du paquet](/basics/embedded-data/) :

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  const count = data.monstersInSubzone(subzone).length;
  console.log(`${subzone.name.fr}: ${count}`);
}
```

## Votre progression dans une zone

L'avancement d'une de vos quêtes zone par zone se lit avec [`quests.zones()`](/resources/quests/#progress-by-zone).

## Limites et erreurs

- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT`.
- Un nom qui n'est ni dans le paquet ni connu de l'API lève `UNKNOWN_NAME`, avec des suggestions.
- Une sous-zone que le paquet ne connaît pas, donnée sans sa zone, lève `UNKNOWN_NAME` et demande de passer `{ zone }`.
- Les réponses sont [mises en cache](/basics/caching/) pendant 10 minutes par défaut.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Zones`](/reference/zones/) | Les zones et sous-zones du jeu, et les monstres qui y vivent. |
| [`Subzone`](/reference/subzone/) | Une sous-zone avec la zone à laquelle elle appartient. |
| [`SubzoneParams`](/reference/subzone-params/) | Indique à quelle zone appartient une sous-zone, pour une sous-zone plus récente que le paquet. |
| [`SubzoneRef`](/reference/subzone-ref/) | Une sous-zone telle qu'elle apparaît dans une liste : son identifiant et son nom. |
| [`Zone`](/reference/zone/) | Une zone du jeu. |
| [`ZoneDetail`](/reference/zone-detail/) | Une zone avec ses sous-zones. |
<!-- exports:end -->
