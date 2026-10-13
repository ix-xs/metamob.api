---
title: Zones
description: Le monde du jeu est découpé en zones et en sous-zones. Lisez-les, cherchez-les par nom et listez les monstres qui vivent dans une sous-zone.
sidebar:
  order: 5
---

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

console.log(monsters.map((monster) => monster.name.fr));
```

## Zones

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

L'API désigne une sous-zone en passant par sa zone. Vous n'avez pas à le faire : la bibliothèque sait dans quelle zone se trouve chaque sous-zone du paquet.

Pour une sous-zone ajoutée au jeu après la publication du paquet, donnez aussi la zone :

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Les monstres d'une sous-zone

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

La réponse est un simple tableau : une sous-zone ne contient qu'une poignée de monstres.

Pour aller dans l'autre sens, d'un monstre vers ses zones, lisez [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Parcourir une zone

Passez les objets eux-mêmes plutôt que leurs identifiants :

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Cela fait une requête par sous-zone. Le même parcours ne coûte rien avec [les données du paquet](/basics/embedded-data/) :

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  console.log(`${subzone.name.fr}: ${data.monstersInSubzone(subzone).length}`);
}
```

## Votre progression dans une zone

L'avancement de l'une de vos quêtes dans chaque zone est un autre appel, [`quests.zones()`](/resources/quests/#progress-by-zone).

## Limites et erreurs

- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT`.
- Un nom qui n'est ni dans le paquet ni connu de l'API lève `UNKNOWN_NAME`, avec des suggestions.
- Une sous-zone que le paquet ne connaît pas, donnée sans sa zone, lève `UNKNOWN_NAME` et demande de passer `{ zone }`.
- Les réponses sont [mises en cache](/basics/caching/) pendant 10 minutes par défaut.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `zones.list({ query }, options?)` | `Zone[]` |
| `zones.get(zone, options?)` | `ZoneDetail`, la zone avec ses `subzones` |
| `zones.subzones(zone, { query }, options?)` | `SubzoneRef[]` |
| `zones.subzone(subzone, { zone }?, options?)` | `Subzone`, la sous-zone avec sa `zone` |
| `zones.monsters(subzone, { zone }?, options?)` | `Monster[]` |

Une zone et une sous-zone ont toutes deux un `id` et un `name` dans trois langues.

## Voir aussi

- [Monstres](/resources/monsters/)
- [Vos quêtes](/resources/quests/)
- [Les données du paquet](/basics/embedded-data/)
- [Noms et identifiants](/basics/names-and-ids/)
