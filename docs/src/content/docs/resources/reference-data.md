---
title: Données de référence
description: "Versions du jeu, serveurs, types de monstres, types de quêtes et modèles de quête."
sidebar:
  order: 10
---

Ces listes sont celles auxquelles le reste de l'API renvoie.

## Demandez d'abord au paquet

Toutes ces données sont aussi incluses dans le paquet, et [`data`](/basics/embedded-data/) les lit sans requête : `data.servers`, `data.server("Draconiros")`, `data.questTemplates`, etc. Les appels ci-dessous interrogent l'API, pour quand vous voulez les données du jour.

Leurs réponses sont [mises en cache](/basics/caching/) 10 minutes par défaut, pour toutes les clés.

## Versions du jeu

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Serveurs

Chaque serveur appartient à une version du jeu et à une communauté :

```ts
const servers = await metamob.servers.list();
const server = await metamob.servers.get("Draconiros");

server.community; // "World" ou "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Types de monstres

Il y en a trois : monstre, boss et archimonstre, d'identifiants 1, 2 et 3. Chaque filtre `type` accepte leurs noms :

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Types de quêtes

Metamob suit deux quêtes : celle du Dofus Ocre, de slug `ocre`, et celle du Dokille, de slug `dokille` :

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // son image sur metamob.fr
```

## Modèles de quête

Une quête n'est pas la même dans toutes les versions du jeu : celle du Dofus Ocre ne demande pas les mêmes monstres sur Dofus (Unity) et sur Dofus Touch. Un modèle de quête, c'est un type de quête dans une version du jeu.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

Un modèle se désigne par son identifiant, ou par ce qu'il est :

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

L'API n'a pas de point d'accès pour un modèle sans ses monstres : `get()` le retrouve dans la liste.

## Les monstres d'un modèle

`questTemplates.monsters()` est une [liste](/basics/lists/) de ce que la quête demande, chaque monstre avec son étape, 200 par page au plus :

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// Une étape.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();

// Toute la quête, dans l'ordre.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Chaque page contient aussi le modèle auquel appartiennent les monstres, dans `page.template`.

Les quêtes des joueurs pointent vers leur modèle : `quest.quest_template` contient son identifiant, son type de quête et ses nombres de monstres et d'étapes.

## Limites et erreurs

- `NOT_FOUND` pour un identifiant qui n'existe pas.
- `UNKNOWN_NAME`, avec des suggestions, pour un nom que ni le paquet ni l'API ne connaissent.
- Aucun modèle pour un type de quête dans une version du jeu : `UNKNOWN_NAME` aussi. Le Dokille n'existe pas dans toutes les versions.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `gameVersions.list(options?)`, `gameVersions.get(version, options?)` | `GameVersion[]`, `GameVersion` |
| `servers.list(options?)`, `servers.get(server, options?)` | `Server[]`, `Server` |
| `monsterTypes.list(options?)`, `monsterTypes.get(type, options?)` | `MonsterType[]`, `MonsterType` |
| `questTypes.list(options?)`, `questTypes.get(type, options?)` | `QuestType[]`, `QuestType` |
| `questTemplates.list(options?)`, `questTemplates.get(template, options?)` | `QuestTemplate[]`, `QuestTemplate` |
| `questTemplates.monsters(template, { step, limit, offset }, options?)` | une liste de `TemplateMonster`, avec `page.template` |

| Type | Champs |
| --- | --- |
| `GameVersion` | `id`, `name` |
| `Server` | `id`, `name`, `community`, `game_version` |
| `MonsterType` | `id`, `name` dans trois langues |
| `QuestType` | `id`, `slug`, `name` dans trois langues, `image` |
| `QuestTemplate` | `id`, `quest_type`, `game_version`, `monster_count`, `step_count` |
| `TemplateMonster` | un `Monster` avec son `step` |
