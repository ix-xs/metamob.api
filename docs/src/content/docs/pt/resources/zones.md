---
title: Zonas
description: "Ler as zonas e subzonas do jogo, e os monstros que vivem em uma subzona."
sidebar:
  order: 5
---

O mundo do jogo é dividido em zonas, elas mesmas divididas em subzonas.

## Zonas

`zones.list()` lista as zonas, e `zones.get()` lê uma com suas subzonas:

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // pelo menos 3 caracteres

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

Uma zona é um nome, um id ou um objeto, veja [Nomes e ids](/basics/names-and-ids/). Os nomes funcionam nos cinco idiomas do site: `"Sufokia Bay"` designa `"Baie de Sufokia"`. Cada versão do jogo tem suas próprias zonas, com seu `game_version`: um nome designa a do Dofus (Unity). Para outra versão, filtre com `zones.list({ gameVersion })` e passe o id.

## Subzonas

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

A API lê uma subzona através da zona dela. Para as subzonas do pacote, a biblioteca encontra a zona sozinha.

Para uma subzona adicionada ao jogo depois da publicação do pacote, passe também a zona:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Os monstros de uma subzona

`zones.monsters()` retorna os monstros de uma subzona, em um único array:

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

No sentido inverso, de um monstro para as zonas dele, veja [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Percorrer uma zona

Os objetos retornados podem ser passados como estão para as próximas chamadas:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Isso faz uma requisição por subzona. O mesmo percurso se faz sem requisição com os [dados do pacote](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  const count = data.monstersInSubzone(subzone).length;
  console.log(`${subzone.name.fr}: ${count}`);
}
```

## O seu progresso em uma zona

O progresso de uma das suas missões zona por zona é lido com [`quests.zones()`](/resources/quests/#progress-by-zone).

## Limites e erros

- Uma busca com menos de 3 caracteres lança `INVALID_ARGUMENT`.
- Um nome que não está no pacote nem é conhecido pela API lança `UNKNOWN_NAME`, com sugestões.
- Uma subzona que o pacote não conhece, dada sem a zona dela, lança `UNKNOWN_NAME` e pede para passar `{ zone }`.
- As respostas ficam [em cache](/basics/caching/) por 10 minutos por padrão.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Zones`](/reference/zones/) | As zonas e subzonas do jogo, e os monstros que vivem nelas. |
| [`Subzone`](/reference/subzone/) | Uma subzona com a zona à qual pertence. |
| [`SubzoneParams`](/reference/subzone-params/) | Indica a qual zona uma subzona pertence, para uma subzona mais recente que o pacote. |
| [`SubzoneRef`](/reference/subzone-ref/) | Uma subzona como um monstro ou uma missão a nomeia: seu identificador e seu nome. |
| [`Zone`](/reference/zone/) | Uma zona do jogo. |
| [`ZoneDetail`](/reference/zone-detail/) | Uma zona com suas subzonas. |
| [`ZoneListParams`](/reference/zone-list-params/) | Filtros de [`Zones.list`](/reference/zones/). |
| [`ZoneSubzone`](/reference/zone-subzone/) | Uma subzona como uma zona a lista. |
<!-- exports:end -->
