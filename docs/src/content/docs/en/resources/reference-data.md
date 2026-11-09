---
title: Reference data
description: "Versions of the game, servers, kinds of monsters, kinds of quests and quest templates."
sidebar:
  order: 10
---

These lists are the ones the rest of the API refers to.

## Ask the package first

All of this data is also included in the package, and [`data`](/basics/embedded-data/) reads it without a request: `data.servers`, `data.server("Draconiros")`, `data.questTemplates`, and so on. The calls below ask the API, for when you want today's data.

Their answers are [cached](/basics/caching/) for 10 minutes by default, for every key.

## Versions of the game

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Servers

Each server belongs to a version of the game and to a community:

```ts
const servers = await metamob.servers.list();
const server = await metamob.servers.get("Draconiros");

server.community; // "World" or "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Kinds of monsters

There are three: monster, boss and archmonster, with the ids 1, 2 and 3. Every `type` filter accepts their names:

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Kinds of quests

Metamob follows two quests: the Ochre Dofus one, slug `ocre`, and the Dokille one, slug `dokille`:

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // its picture on metamob.fr
```

## Quest templates

A quest is not the same in every version of the game: the Ochre Dofus one does not ask for the same monsters on Dofus (Unity) and on Dofus Touch. A quest template is one kind of quest in one version of the game.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

A template is designated by its id, or by what it is:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

The API has no endpoint for a template without its monsters: `get()` finds it in the list.

## The monsters of a template

`questTemplates.monsters()` is a [list](/basics/lists/) of what the quest asks for, each monster with its step, 200 per page at most:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// One step.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();

// The whole quest, in order.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Each page also holds the template the monsters belong to, in `page.template`.

The quests of players point to their template: `quest.quest_template` holds its id, its kind of quest and its numbers of monsters and steps.

## Limits and errors

- `NOT_FOUND` for an id that does not exist.
- `UNKNOWN_NAME`, with suggestions, for a name that neither the package nor the API knows.
- No template for a kind of quest in a version of the game: `UNKNOWN_NAME` too. The Dokille does not exist in every version.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`GameVersions`](/reference/game-versions/) | The versions of the game. |
| [`MonsterTypes`](/reference/monster-types/) | The kinds of monsters. |
| [`QuestTemplates`](/reference/quest-templates/) | The quest templates: what each kind of quest asks for in each version of the game. |
| [`QuestTypes`](/reference/quest-types/) | The kinds of quests. |
| [`Servers`](/reference/servers/) | The game servers. |
| [`GameVersion`](/reference/game-version/) | A version of the game: Dofus (Unity), Dofus Retro (1.29) or Dofus Touch. |
| [`LocalizedName`](/reference/localized-name/) | A name in the three languages of the site. |
| [`QuestTemplate`](/reference/quest-template/) | A quest template: the monsters to capture for one kind of quest in one version of the game. |
| [`QuestTemplateRef`](/reference/quest-template-ref/) | The template a quest follows, as it appears inside a quest. |
| [`QuestType`](/reference/quest-type/) | A kind of quest as `questTypes` returns it, with its image. |
| [`QuestTypeRef`](/reference/quest-type-ref/) | A kind of quest as it appears inside a quest: Ochre (`ocre`) or Grofus (`dokille`). |
| [`Server`](/reference/server/) | A game server. |
| [`TemplateHeader`](/reference/template-header/) | The template a page of monsters belongs to. |
| [`TemplateMonstersParams`](/reference/template-monsters-params/) | Filters of [`QuestTemplates.monsters`](/reference/quest-templates/). |
| [`Language`](/reference/language/) | A language the site is translated in. |
<!-- exports:end -->
