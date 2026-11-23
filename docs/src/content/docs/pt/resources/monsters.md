---
title: Monstros
description: "Ler um monstro com suas zonas, listar os monstros por tipo e pesquisá-los pelo nome."
sidebar:
  order: 4
---

## Ler um monstro

`monsters.get()` recebe um nome, um id ou um objeto, veja [Nomes e ids](/basics/names-and-ids/). A resposta também traz as zonas e subzonas onde o monstro vive:

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // o monstro do qual ele é a versão rara
urls.monsterImage(monster); // a imagem dele em metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Cada versão do jogo tem seus próprios monstros, e a maioria tem o mesmo nome de uma versão para outra. Sem mais nada, é o do Dofus (Unity). Peça outra versão, ou um modelo de missão com `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Listar e filtrar

`monsters.list()` é uma [lista](/basics/lists/) de no máximo 200 monstros por página:

```ts
// Uma página de chefes.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Todos os arquimonstros.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}

// Os monstros do Dofus Retro, e um monstro pelo id dele no cliente do jogo.
const retro = metamob.monsters.list({ gameVersion: "Dofus Retro (1.29)" });
const [tofu] = await metamob.monsters.list({ gameVersion: "Dofus (Unity)", officialId: 98 }).take(1);
```

`type` é `"monstre"`, `"boss"` ou `"archimonstre"`, suas traduções, ou 1, 2 ou 3. `gameVersion` mantém os monstros de uma versão do jogo. `officialId` procura um monstro pelo id dele no cliente do jogo, o mesmo do DofusDB para o Dofus (Unity): ele é único apenas dentro de uma versão, daí o `gameVersion` ao lado. Todo monstro traz os dois, `game_version` e `official_id`.

## Pesquisar pelo nome

`monsters.search()` procura uma parte do nome, em todos os idiomas do site, a partir de 3 caracteres:

```ts
const found = await metamob.monsters.search("bouf").all();
const arch = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// O mesmo, escrito com list().
await metamob.monsters.list({ query: "bouf" });
```

## Sem requisição

Os nomes, níveis, tipos e zonas dos monstros também estão nos [dados do pacote](/basics/embedded-data/). Para um autocompletar, que pesquisa a cada tecla digitada, é isso que se deve usar: uma requisição por tecla chegaria rápido ao limite.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // nenhuma requisição
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Passe pela API para os dados de hoje, por exemplo logo depois de uma atualização do jogo.

## Os monstros de uma missão

Os monstros que uma missão pede, etapa por etapa, vêm dos [modelos de missão](/resources/reference-data/#quest-templates). O que você possui deles é lido em [Suas missões](/resources/quests/#the-monsters-of-a-quest).

## Limites e erros

- Uma busca com menos de 3 caracteres lança `INVALID_ARGUMENT` antes do envio.
- Um id que não existe responde `NOT_FOUND`. Um nome que não existe lança `UNKNOWN_NAME`, com sugestões.
- As respostas ficam [em cache](/basics/caching/) por 10 minutos por padrão.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Monsters`](/reference/monsters/) | Os monstros do jogo. |
| [`urls`](/reference/urls/) | Endereços em metamob.fr, construídos a partir do que a API retorna. |
| [`Monster`](/reference/monster/) | Um monstro, com sua versão do jogo. |
| [`MonsterBase`](/reference/monster-base/) | Um monstro, onde quer que apareça dentro de outra coisa: uma missão, uma etapa. |
| [`MonsterDetail`](/reference/monster-detail/) | Um monstro com os lugares onde vive. |
| [`MonsterListParams`](/reference/monster-list-params/) | Filtros de [`Monsters.list`](/reference/monsters/). |
| [`MonsterReference`](/reference/monster-reference/) | O monstro base de um arquimonstro. |
| [`MonsterType`](/reference/monster-type/) | Um tipo de monstro: 1 é um monstro, 2 um chefe, 3 um arquimonstro. |
| [`MonsterZone`](/reference/monster-zone/) | Uma zona onde um monstro vive, com as subzonas em questão. |
| [`TemplateMonster`](/reference/template-monster/) | Um monstro de um modelo de missão, com a etapa à qual pertence. |
<!-- exports:end -->
