---
title: Les données du paquet
description: "Les monstres, les zones, les sous-zones, les serveurs et les modèles de quête sont livrés avec le paquet. L'objet data les lit depuis la mémoire, sans requête et sans clé API, ce dont une autocomplétion ou une commande de recherche a besoin."
sidebar:
  order: 6
---

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Ce qu'il y a dedans

Une copie des données de référence de l'API, prise au moment où le paquet a été publié : chaque monstre, zone, sous-zone, serveur, version du jeu, type de monstre, type de quête et modèle de quête, avec quels monstres vivent dans quelle sous-zone et quels monstres chaque modèle de quête demande.

`data.fetchedAt` est le jour où la copie a été prise. Les enregistrements ont la forme que l'API leur donne, donc ce que vous lisez dans `data` et ce que vous recevez d'un appel sont interchangeables.

Le client l'a aussi : `metamob.data` est le même objet.

## Trouver un enregistrement

Chaque type a une méthode qui prend un identifiant, un nom ou un objet avec un identifiant, et renvoie l'enregistrement ou `undefined`. Rien ne lève d'erreur.

```ts
data.monster("Bouftou Royal"); // par nom, dans l'une des trois langues
data.monster(305); // par identifiant
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Chercher des monstres

`searchMonsters` trouve les monstres dont le nom contient un texte, dans n'importe quelle langue, les noms qui commencent par ce texte en premier. Elle est assez rapide pour s'exécuter à chaque frappe.

```ts
data.searchMonsters("bouf"); // 25 au plus par défaut
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

Pour un texte qui ne correspond à rien, `suggest` donne les noms les plus proches :

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // jusqu'à 5 noms
```

## Suivre les liens

```ts
// Où vit un monstre.
data.subzonesOf("Tofu Maléfique").map((subzone) => `${subzone.zone.name.fr} > ${subzone.name.fr}`);
data.zonesOf("Tofu Maléfique");

// Ce qui vit quelque part.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// Un monstre et son archimonstre.
data.archmonstersOf("Tofu"); // les archimonstres qui l'ont pour référence
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Les modèles de quête

Un modèle de quête est ce qu'un type de quête demande dans une version du jeu : la quête Ocre sur Dofus Touch, par exemple.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

data.templateMonsters(ochreOnTouch).length; // tous les monstres de la quête, dans l'ordre
data.templateMonsters(ochreOnTouch, { step: 4 }); // ceux de l'étape 4
data.stepOf("Tofu Maléfique", ochreOnTouch); // l'étape à laquelle ce monstre appartient
data.templatesOf("Tofu Maléfique"); // les modèles de quête qui le demandent
```

## Les listes simples

```ts
data.monsters; // tous les monstres
data.zones; // toutes les zones, chacune avec ses sous-zones
data.subzones; // toutes les sous-zones, chacune avec sa zone
data.servers;
data.gameVersions;
data.monsterTypes;
data.questTypes;
data.questTemplates;
```

Ce sont des tableaux en lecture seule, construits une fois à la première utilisation. L'ensemble des données est décodé la première fois que quelque chose est lu, ce qui prend quelques millisecondes.

## Quand le jeu change

Un nouveau monstre, une nouvelle zone ou un nouveau serveur arrive dans le paquet avec sa version suivante. Entre-temps, rien ne casse :

- Un appel qui reçoit un nom que le paquet ne connaît pas interroge l'API avant d'abandonner, voir [Noms et identifiants](/basics/names-and-ids/#when-a-name-is-unknown).
- Un identifiant fonctionne toujours, connu ou non.
- `data` lui-même ne connaît que ce avec quoi il a été livré : `data.monster("a brand new monster")` vaut `undefined` tant que vous n'avez pas mis le paquet à jour.

Pour lire ce que l'API dit en ce moment, utilisez les appels : [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) et les [listes de référence](/resources/reference-data/).

## Dans un navigateur

`data` n'a besoin ni d'une clé ni d'un réseau, donc il fonctionne dans une page. Importer seulement `data` laisse le client hors de votre bundle ; l'ensemble des données pèse environ 30 ko une fois compressé. Le champ de recherche de la page d'accueil de ce site, c'est exactement cela.

## Référence

| Membre | Renvoie |
| --- | --- |
| `monster(ref, hint?)` | `Monster \| undefined` |
| `monstersNamed(name)` | `Monster[]`, plus d'un pour un nom partagé |
| `searchMonsters(query, { type, gameVersion, template, limit })` | `Monster[]` |
| `zone(ref)`, `subzone(ref)` | `ZoneDetail \| undefined`, `Subzone \| undefined` |
| `server(ref)`, `gameVersion(ref)` | `Server \| undefined`, `GameVersion \| undefined` |
| `monsterType(ref)`, `questType(ref)` | `MonsterType \| undefined`, `QuestType \| undefined` |
| `questTemplate(ref)` | `QuestTemplate \| undefined` |
| `subzonesOf(monster)`, `zonesOf(monster)` | `Subzone[]`, `Zone[]` |
| `monstersInSubzone(subzone)`, `monstersInZone(zone)` | `Monster[]` |
| `archmonstersOf(monster)` | `Monster[]` |
| `templatesOf(monster)` | `QuestTemplate[]` |
| `templateMonsters(template, { step })` | `TemplateMonster[]` |
| `stepOf(monster, template)` | `number \| undefined` |
| `suggest(kind, text, limit?)` | `string[]` |
| `fetchedAt` | `string`, au format `YYYY-MM-DD` |

## Voir aussi

- [Noms et identifiants](/basics/names-and-ids/)
- [Monstres](/resources/monsters/)
- [Une commande Discord avec autocomplétion](/recipes/discord-command/)
- [Cache](/basics/caching/)
