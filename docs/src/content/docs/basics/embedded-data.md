---
title: Les données du paquet
description: "Les monstres, les zones, les serveurs et les modèles de quête sont inclus dans le paquet. data les lit en mémoire, sans requête ni clé API."
sidebar:
  order: 6
---

Le paquet contient une copie des données de référence de l'API. L'objet `data` les interroge directement, ce qui convient à une autocomplétion ou à une commande de recherche :

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Ce qu'il y a dedans

Les données de référence de l'API au moment de la publication du paquet : monstres, zones, sous-zones, serveurs, versions du jeu, types de monstres, types et modèles de quête. Avec les liens entre eux : les monstres de chaque sous-zone, et ceux que demande chaque modèle de quête.

`data.fetchedAt` est la date de la copie. Les enregistrements ont la forme que l'API leur donne : ce que vous lisez dans `data` a la même forme que la réponse d'un appel.

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

`searchMonsters` trouve les monstres dont le nom contient un texte, dans l'une des trois langues, en commençant par les noms qui commencent par ce texte. Elle est assez rapide pour tourner à chaque frappe.

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
data.zonesOf("Tofu Maléfique");
data.subzonesOf("Tofu Maléfique").map((subzone) => subzone.name.fr);

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

Ce sont des tableaux en lecture seule. Les données sont décodées à la première lecture, en quelques millisecondes.

## Quand le jeu change

Un nouveau monstre, une nouvelle zone ou un nouveau serveur arrive dans le paquet avec sa version suivante. En attendant :

- un appel qui reçoit un nom inconnu du paquet le cherche aussi dans l'API, voir [Noms et identifiants](/basics/names-and-ids/#when-a-name-is-unknown).
- un identifiant fonctionne toujours, connu du paquet ou non ;
- `data` ne connaît que sa copie : un monstre plus récent y vaut `undefined` jusqu'à la mise à jour du paquet.

Pour lire ce que l'API dit en ce moment, utilisez les appels : [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) et les [listes de référence](/resources/reference-data/).

## Dans un navigateur

`data` n'a besoin ni de clé ni de réseau : il fonctionne aussi dans une page web. Importer seulement `data` laisse le client hors de votre bundle, et les données pèsent environ 30 ko compressées. La page [Essayer](/help/playground/) fonctionne ainsi.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Dataset`](/reference/dataset/) | Les données de référence de Metamob incluses dans le paquet (monstres, zones, sous-zones, serveurs, versions du jeu et modèles de quête), telles qu'au [`Dataset.fetchedAt`](/reference/dataset/). |
| [`data`](/reference/data/) | Les données de référence incluses dans le paquet. |
| [`MonsterHint`](/reference/monster-hint/) | Ce qui distingue deux monstres de même nom. |
| [`MonsterSearchOptions`](/reference/monster-search-options/) | Options de [`Dataset.searchMonsters`](/reference/dataset/). |
<!-- exports:end -->
