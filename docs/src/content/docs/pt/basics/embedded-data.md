---
title: Os dados do pacote
description: "Monstros, zonas, servidores e modelos de missão estão incluídos no pacote. data os lê da memória, sem requisição e sem chave de API."
sidebar:
  order: 6
---

O pacote contém uma cópia dos dados de referência da API. O objeto `data` os consulta diretamente, o que serve para um autocompletar ou um comando de busca:

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## O que ele contém

Os dados de referência da API no momento em que o pacote foi publicado: monstros, zonas, subzonas, servidores, versões do jogo, tipos de monstro, tipos de missão e modelos de missão. Com as ligações entre eles: os monstros de cada subzona, e os que cada modelo de missão pede. Cada versão do jogo tem ali seus próprios monstros, zonas e subzonas, cada um com seu `game_version` e seu `official_id`.

`data.fetchedAt` é a data da cópia. Os registros têm o formato que a API dá a eles: o que você lê de `data` tem o mesmo formato que a resposta de uma chamada.

O cliente também o tem: `metamob.data` é o mesmo objeto.

## Encontrar um registro

Cada tipo tem um método que recebe um id, um nome ou um objeto com um id, e retorna o registro ou `undefined`. Nada lança erro.

```ts
data.monster("Bouftou Royal"); // pelo nome, em qualquer um dos cinco idiomas do site
data.monster(305); // pelo id
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Pesquisar monstros

`searchMonsters` encontra os monstros cujo nome contém um texto, em qualquer um dos cinco idiomas do site, começando pelos nomes que começam com esse texto. É rápido o bastante para rodar a cada tecla digitada.

```ts
data.searchMonsters("bouf"); // no máximo 25 por padrão
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

Para um texto que não corresponde a nada, `suggest` dá os nomes mais próximos:

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // até 5 nomes
```

## Seguir as ligações

```ts
// Onde um monstro vive.
data.zonesOf("Tofu Maléfique");
data.subzonesOf("Tofu Maléfique").map((subzone) => subzone.name.fr);

// O que vive em um lugar.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// Um monstro e seu arquimonstro.
data.archmonstersOf("Tofu"); // os arquimonstros que o têm como referência
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Modelos de missão

Um modelo de missão é o que um tipo de missão pede em uma versão do jogo: a missão Ocre no Dofus Touch, por exemplo.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

data.templateMonsters(ochreOnTouch).length; // todos os monstros da missão, em ordem
data.templateMonsters(ochreOnTouch, { step: 4 }); // os da etapa 4
data.stepOf("Tofu Maléfique", ochreOnTouch); // a etapa a que esse monstro pertence
data.templatesOf("Tofu Maléfique", { gameVersion: "Dofus Touch" }); // os modelos de missão que o pedem
```

## As listas simples

```ts
data.monsters; // todos os monstros
data.zones; // todas as zonas, cada uma com suas subzonas
data.subzones; // todas as subzonas, cada uma com sua zona
data.servers;
data.gameVersions;
data.monsterTypes;
data.questTypes;
data.questTemplates;
```

São arrays somente leitura. Os dados são decodificados na primeira leitura, em alguns milissegundos.

## Quando o jogo muda

Um novo monstro, zona ou servidor chega ao pacote na próxima versão dele. Enquanto isso:

- uma chamada que recebe um nome que o pacote não conhece também o procura na API, veja [Nomes e ids](/basics/names-and-ids/#when-a-name-is-unknown);
- um id sempre funciona, conhecido pelo pacote ou não;
- `data` só conhece a sua cópia: um monstro mais novo é `undefined` ali até o pacote ser atualizado.

Para ler o que a API diz agora, use as chamadas: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) e as [listas de referência](/resources/reference-data/).

## Em um navegador

`data` não precisa de chave nem de rede: também funciona em uma página web. Importar só `data` deixa o cliente fora do seu bundle, e os dados pesam cerca de 30 kB depois de comprimidos. A página [Experimentar](/help/playground/) funciona assim.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Dataset`](/reference/dataset/) | Os dados de referência do Metamob incluídos no pacote (monstros, zonas, subzonas, servidores, versões do jogo e modelos de missão), na data de [`Dataset.fetchedAt`](/reference/dataset/). |
| [`data`](/reference/data/) | Os dados de referência incluídos no pacote. |
| [`MonsterHint`](/reference/monster-hint/) | O que diferencia dois monstros com o mesmo nome. |
| [`MonsterSearchOptions`](/reference/monster-search-options/) | Opções de [`Dataset.searchMonsters`](/reference/dataset/). |
<!-- exports:end -->
