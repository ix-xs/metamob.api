---
title: Dados de referência
description: "Versões do jogo, servidores, tipos de monstro, tipos de missão e modelos de missão."
sidebar:
  order: 10
---

Estas listas são aquelas às quais o resto da API se refere.

## Pergunte primeiro ao pacote

Todos esses dados também estão incluídos no pacote, e [`data`](/basics/embedded-data/) os lê sem requisição: `data.servers`, `data.server("Draconiros")`, `data.questTemplates`, e assim por diante. As chamadas abaixo perguntam à API, para quando você quer os dados de hoje.

As respostas delas ficam [em cache](/basics/caching/) por 10 minutos por padrão, para todas as chaves.

## Versões do jogo

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Servidores

Cada servidor pertence a uma versão do jogo e a uma comunidade:

```ts
const servers = await metamob.servers.list();
const server = await metamob.servers.get("Draconiros");

server.community; // "World" ou "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Tipos de monstro

São três: monstro, chefe e arquimonstro, com os ids 1, 2 e 3. Todo filtro `type` aceita os nomes deles:

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Tipos de missão

O Metamob acompanha duas missões: a do Dofus Ocre, slug `ocre`, e a do Dokille, slug `dokille`:

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // a imagem dela em metamob.fr
```

## Modelos de missão

Uma missão não é a mesma em todas as versões do jogo: a do Dofus Ocre não pede os mesmos monstros no Dofus (Unity) e no Dofus Touch. Um modelo de missão é um tipo de missão em uma versão do jogo.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

Um modelo é designado pelo id, ou pelo que ele é:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

A API não tem endpoint para um modelo sem os monstros dele: `get()` o encontra na lista.

## Os monstros de um modelo

`questTemplates.monsters()` é uma [lista](/basics/lists/) do que a missão pede, cada monstro com sua etapa, no máximo 200 por página:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// Uma etapa.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();

// A missão inteira, em ordem.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Cada página também contém o modelo ao qual os monstros pertencem, em `page.template`.

As missões dos jogadores apontam para o modelo delas: `quest.quest_template` contém o id dele, o tipo de missão e os números de monstros e de etapas.

## Limites e erros

- `NOT_FOUND` para um id que não existe.
- `UNKNOWN_NAME`, com sugestões, para um nome que nem o pacote nem a API conhecem.
- Nenhum modelo para um tipo de missão em uma versão do jogo: também `UNKNOWN_NAME`. O Dokille não existe em todas as versões.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`GameVersions`](/reference/game-versions/) | As versões do jogo. |
| [`MonsterTypes`](/reference/monster-types/) | Os tipos de monstro. |
| [`QuestTemplates`](/reference/quest-templates/) | Os modelos de missão: o que cada tipo de missão pede em cada versão do jogo. |
| [`QuestTypes`](/reference/quest-types/) | Os tipos de missão. |
| [`Servers`](/reference/servers/) | Os servidores do jogo. |
| [`GameVersion`](/reference/game-version/) | Uma versão do jogo: Dofus (Unity), Dofus Retro (1.29) ou Dofus Touch. |
| [`LocalizedName`](/reference/localized-name/) | Um nome nos idiomas do site. |
| [`QuestTemplate`](/reference/quest-template/) | Um modelo de missão: os monstros a capturar para um tipo de missão em uma versão do jogo. |
| [`QuestTemplateRef`](/reference/quest-template-ref/) | O modelo que uma missão segue, como aparece dentro de uma missão. |
| [`QuestType`](/reference/quest-type/) | Um tipo de missão como `questTypes` o retorna, com sua imagem. |
| [`QuestTypeRef`](/reference/quest-type-ref/) | Um tipo de missão como aparece dentro de uma missão: Ocre (`ocre`) ou Kaskofus (`dokille`). |
| [`Server`](/reference/server/) | Um servidor do jogo. |
| [`TemplateHeader`](/reference/template-header/) | O modelo ao qual pertence uma página de monstros. |
| [`TemplateMonstersParams`](/reference/template-monsters-params/) | Filtros de [`QuestTemplates.monsters`](/reference/quest-templates/). |
| [`Language`](/reference/language/) | Um idioma para o qual o site está traduzido. |
<!-- exports:end -->
