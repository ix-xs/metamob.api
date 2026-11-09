---
title: Noms et identifiants
description: "Les monstres, les zones, les serveurs et le reste se désignent par leur identifiant, leur nom ou un objet. Ce qui est accepté, et ce qui se passe quand un nom est inconnu."
sidebar:
  order: 1
---

Un monstre peut être donné par son identifiant ou par son nom, dans l'une des trois langues du site :

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique"); // les accents et la casse ne comptent pas
await metamob.monsters.get("Evil Tofu"); // anglais
await metamob.monsters.get("Tofu maléfico"); // espagnol
```

## Ce qui peut être désigné par son nom

| Quoi | Accepté | Où |
| --- | --- | --- |
| Un monstre | identifiant, nom en français, en anglais ou en espagnol, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| Une zone | identifiant, nom dans les trois langues, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| Une sous-zone | identifiant, nom dans les trois langues, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| Un serveur | identifiant, nom, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| Un type de monstre | 1, 2, 3, ou `monstre`, `boss`, `archimonstre` et leurs traductions | tous les filtres `type` |
| Une version du jeu | identifiant, nom, `{ id }` | `gameVersions.get`, l'indication `gameVersion` |
| Un type de quête | identifiant, slug (`ocre`, `dokille`), nom | `questTypes.get` |
| Un modèle de quête | identifiant, `{ id }`, ou `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

Une quête est toujours désignée par son slug et un joueur par son pseudo : ce sont des chaînes que l'API prend telles quelles.

Votre éditeur complète les noms. Ce sont des types littéraux, générés à partir des données du paquet, et toute autre chaîne reste acceptée.

## Passer un objet

Un objet qui porte un `id` numérique convient aussi : le résultat d'un appel peut être passé tel quel au suivant.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## Comment un nom est comparé

Un nom est comparé après suppression des accents, sans tenir compte de la casse, en traitant toutes les sortes d'apostrophes et de tirets comme une seule, et en réduisant les espaces multiples. `"TOFU  MALEFIQUE"` et `"Tofu Maléfique"` sont le même nom. Rien d'autre n'est pardonné : une lettre manquante donne un autre nom.

La recherche se fait dans les données incluses dans le paquet, sans requête. Une chaîne composée uniquement de chiffres, comme `"21"`, est lue comme un identifiant.

## Quand un nom est inconnu

Un nom absent du paquet peut être plus récent que le paquet. La bibliothèque interroge alors l'API une fois, avec une recherche. Si l'API ne le connaît pas non plus, l'appel lève une `MetamobArgumentError` avec le code `UNKNOWN_NAME` et les noms les plus proches.

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (error instanceof MetamobArgumentError) {
    error.code; // "UNKNOWN_NAME"
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
    error.suggestions; // ["Tofu Maléfique"]
  }
}
```

Dans ce cas, rien n'est envoyé à l'API.

Pour proposer des suggestions vous-même, avant tout appel :

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // les monstres dont le nom contient "tofu"
```

## Les monstres qui partagent un nom

Six paires de monstres, surtout des archimonstres, partagent un nom dans au moins une langue, sur deux versions du jeu, avec deux identifiants différents. « Crognan le Barbare » est un monstre sur Dofus (Unity) et un autre sur Dofus Retro et Dofus Touch.

Quand vous écrivez dans une quête, c'est la quête qui décide. La bibliothèque lit une fois le modèle que suit la quête, et prend le monstre de ce modèle.

```ts
// Le bon "Crognan le Barbare" pour cette quête, quelle que soit sa version du jeu.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

Ailleurs, précisez lequel vous voulez :

```ts
const name = "Crognan le Barbare";

const unity = await metamob.monsters.get(name, { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get(name, { gameVersion: "Dofus Touch" });

// Ou par modèle de quête.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get(name, { template: ochreOnRetro });
```

Sans indication, c'est le monstre du modèle de quête au plus petit identifiant qui est renvoyé. `data.monstersNamed(name)` liste tous les monstres qui répondent à un nom.

## Les sous-zones et leur zone

L'API demande la zone d'une sous-zone pour la lire. Quand la sous-zone est dans le paquet, la bibliothèque retrouve sa zone :

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Une sous-zone ajoutée au jeu après la publication du paquet n'y est pas encore : donnez sa zone.

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`normalizeName`](/reference/normalize-name/) | La forme sous laquelle les noms sont comparés : sans accents, en minuscules, une seule sorte d'apostrophe et de tiret, des espaces simples. |
| [`GameVersionLike`](/reference/game-version-like/) | Une version du jeu : son identifiant, son nom, ou un objet avec son `id`. |
| [`MonsterLike`](/reference/monster-like/) | Un monstre : son identifiant, son nom en français, anglais ou espagnol, ou un objet avec son `id`. |
| [`MonsterTypeLike`](/reference/monster-type-like/) | Un type de monstre : son identifiant (1, 2, 3), son nom en français, anglais ou espagnol, ou un objet avec son `id`. |
| [`QuestTemplateLike`](/reference/quest-template-like/) | Un modèle de quête : son identifiant, un objet avec son `id`, ou le type de quête et la version du jeu auxquels il correspond. |
| [`QuestTypeLike`](/reference/quest-type-like/) | Un type de quête : son identifiant, son slug (`ocre`, `dokille`), son nom, ou un objet avec son `id`. |
| [`ServerLike`](/reference/server-like/) | Un serveur : son identifiant, son nom, ou un objet avec son `id`. |
| [`SubzoneLike`](/reference/subzone-like/) | Une sous-zone : son identifiant, son nom en français, anglais ou espagnol, ou un objet avec son `id`. |
| [`ZoneLike`](/reference/zone-like/) | Une zone : son identifiant, son nom en français, anglais ou espagnol, ou un objet avec son `id`. |
| [`GameVersionName`](/reference/game-version-name/), [`MonsterNameEn`](/reference/monster-name-en/), [`MonsterNameEs`](/reference/monster-name-es/), [`MonsterNameFr`](/reference/monster-name-fr/), [`MonsterTypeNameEn`](/reference/monster-type-name-en/), [`MonsterTypeNameEs`](/reference/monster-type-name-es/), [`MonsterTypeNameFr`](/reference/monster-type-name-fr/), [`QuestTemplateId`](/reference/quest-template-id/), [`QuestTypeNameEn`](/reference/quest-type-name-en/), [`QuestTypeNameEs`](/reference/quest-type-name-es/), [`QuestTypeNameFr`](/reference/quest-type-name-fr/), [`QuestTypeSlug`](/reference/quest-type-slug/), [`ServerName`](/reference/server-name/), [`SubzoneNameEn`](/reference/subzone-name-en/), [`SubzoneNameEs`](/reference/subzone-name-es/), [`SubzoneNameFr`](/reference/subzone-name-fr/), [`ZoneNameEn`](/reference/zone-name-en/), [`ZoneNameEs`](/reference/zone-name-es/), [`ZoneNameFr`](/reference/zone-name-fr/) | Les noms connus du paquet, un type par langue : monstres, zones, sous-zones, types de monstre et de quête, serveurs, versions du jeu. |
<!-- exports:end -->
