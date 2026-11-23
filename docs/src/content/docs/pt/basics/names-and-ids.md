---
title: Nomes e ids
description: "Monstros, zonas, servidores e o resto podem ser designados pelo id, pelo nome ou por um objeto. O que é aceito, e o que acontece quando um nome é desconhecido."
sidebar:
  order: 1
---

Um monstro pode ser dado pelo id ou pelo nome, em qualquer um dos cinco idiomas do site:

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique"); // acentos e maiúsculas não importam
await metamob.monsters.get("Evil Tofu"); // inglês
await metamob.monsters.get("Tofu maléfico"); // espanhol
```

## O que pode ser designado pelo nome

| O quê | Aceito | Onde |
| --- | --- | --- |
| Um monstro | id, nome em francês, inglês, espanhol, português ou alemão, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| Uma zona | id, nome nos cinco idiomas, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| Uma subzona | id, nome nos cinco idiomas, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| Um servidor | id, nome, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| Um tipo de monstro | 1, 2, 3, ou `monstre`, `boss`, `archimonstre` e suas traduções | todo filtro `type` |
| Uma versão do jogo | id, nome, `{ id }` | `gameVersions.get`, a indicação `gameVersion` |
| Um tipo de missão | id, slug (`ocre`, `dokille`), nome | `questTypes.get` |
| Um modelo de missão | id, `{ id }`, ou `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

Uma missão é sempre designada pelo slug, e um jogador pelo nome de usuário: são strings que a API recebe como estão.

Seu editor completa os nomes. Eles são tipos literais, gerados a partir dos dados do pacote, e qualquer outra string continua aceita.

## Passar um objeto

Um objeto com um `id` numérico também funciona: o resultado de uma chamada pode ser passado como está para a próxima.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## Como um nome é comparado

Um nome é comparado depois de retirar os acentos, ignorando maiúsculas e minúsculas, tratando todo tipo de apóstrofo e de hífen como um só, e reduzindo espaços múltiplos. `"TOFU  MALEFIQUE"` e `"Tofu Maléfique"` são o mesmo nome. Nada mais é perdoado: uma letra a menos dá outro nome.

A busca acontece nos dados incluídos no pacote, sem requisição. Uma string feita só de dígitos, como `"21"`, é lida como um id.

## Quando um nome é desconhecido

Um nome que não está no pacote pode ser mais recente que o pacote. A biblioteca então pergunta uma vez à API, com uma busca. Se a API também não o conhece, a chamada lança um `MetamobArgumentError` com o código `UNKNOWN_NAME` e os nomes mais próximos.

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

Nesse caso, nada é enviado à API.

Para oferecer sugestões você mesmo, antes de qualquer chamada:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // os monstros cujo nome contém "tofu"
```

## Monstros que compartilham um nome

Cada versão do jogo tem seus próprios monstros: o Tofu do Dofus Retro não é o do Dofus (Unity), ele tem seu próprio id. A maioria dos nomes designa, portanto, um monstro por versão. O mesmo vale para zonas e subzonas: existem três Amakna.

Quando você escreve em uma missão, a missão decide. A biblioteca lê uma vez o modelo que a missão segue, e pega o monstro desse modelo.

```ts
// O "Crognan le Barbare" certo para esta missão, seja qual for a versão do jogo dela.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

Nos outros casos, diga qual você quer:

```ts
const name = "Crognan le Barbare";

const unity = await metamob.monsters.get(name, { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get(name, { gameVersion: "Dofus Touch" });

// Ou pelo modelo de missão.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get(name, { template: ochreOnRetro });
```

Sem indicação, é retornado o do Dofus (Unity), e o mesmo vale para uma zona ou uma subzona. `data.monstersNamed(name)` lista todos os monstros que respondem a um nome.

## Subzonas e sua zona

A API precisa da zona de uma subzona para lê-la. Quando a subzona está no pacote, a biblioteca encontra a zona dela:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Uma subzona adicionada ao jogo depois da publicação do pacote ainda não está nele: passe a zona dela.

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`normalizeName`](/reference/normalize-name/) | A forma em que os nomes são comparados: sem acentos, em minúsculas, um só tipo de apóstrofo e de hífen, espaços simples. |
| [`GameVersionLike`](/reference/game-version-like/) | Uma versão do jogo: seu identificador, seu nome, ou um objeto com seu `id`. |
| [`MonsterLike`](/reference/monster-like/) | Um monstro: seu identificador, seu nome em francês, inglês, espanhol, português ou alemão, ou um objeto com seu `id`. |
| [`MonsterTypeLike`](/reference/monster-type-like/) | Um tipo de monstro: seu identificador (1, 2, 3), seu nome em qualquer idioma do site, ou um objeto com seu `id`. |
| [`QuestTemplateLike`](/reference/quest-template-like/) | Um modelo de missão: seu identificador, um objeto com seu `id`, ou o tipo de missão e a versão do jogo a que se destina. |
| [`QuestTypeLike`](/reference/quest-type-like/) | Um tipo de missão: seu identificador, seu slug (`ocre`, `dokille`), seu nome, ou um objeto com seu `id`. |
| [`ServerLike`](/reference/server-like/) | Um servidor: seu identificador, seu nome, ou um objeto com seu `id`. |
| [`SubzoneLike`](/reference/subzone-like/) | Uma subzona: seu identificador, seu nome em francês, inglês, espanhol, português ou alemão, ou um objeto com seu `id`. |
| [`ZoneLike`](/reference/zone-like/) | Uma zona: seu identificador, seu nome em francês, inglês, espanhol, português ou alemão, ou um objeto com seu `id`. |
| [`GameVersionName`](/reference/game-version-name/), [`MonsterNameDe`](/reference/monster-name-de/), [`MonsterNameEn`](/reference/monster-name-en/), [`MonsterNameEs`](/reference/monster-name-es/), [`MonsterNameFr`](/reference/monster-name-fr/), [`MonsterNamePt`](/reference/monster-name-pt/), [`MonsterTypeNameDe`](/reference/monster-type-name-de/), [`MonsterTypeNameEn`](/reference/monster-type-name-en/), [`MonsterTypeNameEs`](/reference/monster-type-name-es/), [`MonsterTypeNameFr`](/reference/monster-type-name-fr/), [`MonsterTypeNamePt`](/reference/monster-type-name-pt/), [`QuestTemplateId`](/reference/quest-template-id/), [`QuestTypeNameDe`](/reference/quest-type-name-de/), [`QuestTypeNameEn`](/reference/quest-type-name-en/), [`QuestTypeNameEs`](/reference/quest-type-name-es/), [`QuestTypeNameFr`](/reference/quest-type-name-fr/), [`QuestTypeNamePt`](/reference/quest-type-name-pt/), [`QuestTypeSlug`](/reference/quest-type-slug/), [`ServerName`](/reference/server-name/), [`SubzoneNameDe`](/reference/subzone-name-de/), [`SubzoneNameEn`](/reference/subzone-name-en/), [`SubzoneNameEs`](/reference/subzone-name-es/), [`SubzoneNameFr`](/reference/subzone-name-fr/), [`SubzoneNamePt`](/reference/subzone-name-pt/), [`ZoneNameDe`](/reference/zone-name-de/), [`ZoneNameEn`](/reference/zone-name-en/), [`ZoneNameEs`](/reference/zone-name-es/), [`ZoneNameFr`](/reference/zone-name-fr/), [`ZoneNamePt`](/reference/zone-name-pt/) | Os nomes que o pacote conhece, um tipo por idioma: monstros, zonas, subzonas, tipos de monstro e de missão, servidores, versões do jogo. |
<!-- exports:end -->
