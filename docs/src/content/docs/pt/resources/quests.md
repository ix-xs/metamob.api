---
title: Suas missões
description: "Ler e alterar as missões da conta, registrar os monstros que você possui e acompanhar o progresso zona por zona."
sidebar:
  order: 2
---

Todos os métodos de `metamob.quests` agem sobre as missões da conta da chave, e somente sobre elas. Para as missões de outros jogadores, veja [Outros jogadores](/resources/users/).

## Listar as suas missões

`quests.list()` retorna todas as missões da conta, as favoritas primeiro, incluindo as ocultas no perfil público. Os outros métodos recebem o slug de uma dessas missões.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // cópias de cada monstro a reunir
}
```

Um slug também é a última parte do endereço de uma missão em metamob.fr.

## Ler as configurações de uma missão

`quests.get()` adiciona o que só o dono vê: o modo de troca, seus limiares e os filtros por tipo de monstro:

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // mostrado no perfil público
quest.trade_mode; // 0 automático, 1 especialista
quest.trade_offer_threshold; // modo especialista: oferecer a partir desta quantidade
quest.type_filters["3"]?.never_want; // nunca procurar arquimonstros
```

As chaves de `type_filters` são os ids dos tipos de monstro: `"1"` para os monstros, `"2"` para os chefes, `"3"` para os arquimonstros.

## Alterar as configurações

`quests.update()` recebe só o que muda. A resposta contém o slug e os campos que mudaram:

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Modo de troca especialista, com seus limiares.
await metamob.quests.update(slug, {
  trade_mode: 1,
  trade_offer_threshold: 3,
  trade_want_threshold: 1,
});

// Nunca oferecer arquimonstros, de duas formas.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## Os monstros de uma missão

`quests.monsters()` lista o que a missão pede, com o que você possui. É uma [lista](/basics/lists/): `await` dá uma página, `for await` percorre tudo.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` faz duas perguntas diferentes:

| `status` | Pergunta | Significado |
| --- | --- | --- |
| `needed` | Progresso | Você possui menos do que a missão pede |
| `unowned` | Progresso | Você não possui nenhum |
| `insufficient` | Progresso | Você possui pelo menos um, mas menos do que o necessário. Vazio para uma missão feita uma vez |
| `ok` | Progresso | Você possui exatamente o suficiente |
| `excess` | Progresso | Você possui cópias sobrando |
| `wanted` | Troca | A missão o procura, depois de aplicadas as suas configurações de troca |
| `offered` | Troca | A missão o oferece, depois de aplicadas as suas configurações de troca |

Um monstro em `excess` nem sempre é `offered`: um filtro ou um limiar pode retê-lo.

Este `status` é um filtro. Mais abaixo, duas respostas também têm um campo `status`, com outro significado: um número depois de uma escrita, e uma de três palavras no progresso por zona.

```ts
const archmonsters = { type: "archimonstre", status: "needed" } as const;

const toCatch = await metamob.quests.monsters(slug, archmonsters).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const manual = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Registrar um monstro

`setMonster` define o número de cópias de um monstro que você possui. Não é uma soma: para somar um, leia primeiro a quantidade atual.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // possuídos menos missões paralelas, negativo se faltar algum
result.effective_offer; // o que a missão oferece agora
result.effective_want; // o que a missão procura agora
```

O monstro é um nome, um id ou um objeto, veja [Nomes e ids](/basics/names-and-ids/). Um nome desconhecido lança `UNKNOWN_NAME`, e nada é escrito.

## Registrar vários monstros

`setMonsters` recebe um lote, no formato que for mais conveniente para você:

```ts
// Um objeto indexado pelo nome.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Uma lista, com nomes, ids ou objetos.
await metamob.quests.setMonsters(slug, [
  { monster: 397, quantity: 1 },
  { monster: "Bouflet le Puéril", quantity: 3 },
]);

// Um Map.
const caught = new Map<string, number>([["Tofu Maléfique", 1]]);
const result = await metamob.quests.setMonsters(slug, caught);
result.updated_count;
```

A API aceita 200 monstros por requisição: um lote maior é enviado em várias requisições, cujas respostas são combinadas. Todos os nomes são verificados antes da primeira: se houver um erro de digitação, nada é escrito.

Quando o mesmo monstro aparece duas vezes, a última quantidade vale.

## Progresso por zona

`quests.zones()` organiza uma missão pelo lugar onde os monstros vivem, as subzonas menos avançadas primeiro. Um monstro aparece em cada subzona onde vive.

```ts
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);

  for (const subzone of zone.subzones) {
    const missing = subzone.monsters
      .filter((monster) => monster.status === "incomplete")
      .map((monster) => monster.name.fr);
    if (missing.length) console.log(`  ${subzone.name.fr}: ${missing.join(", ")}`);
  }
}
```

A resposta não é paginada e pode ser longa. `zone`, `subzone` e `type` a restringem:

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

Um monstro é `validated` quando a etapa dele já foi passada, `completed` quando você possui o suficiente, `incomplete` nos outros casos.

## Limites e erros

- Todos os métodos respondem `NOT_FOUND` para uma missão que não é sua, exista ela ou não.
- As quantidades vão de 0 a 99. Fora disso, a API responde `BAD_REQUEST`.
- `current_step` vai de 1 a `quest_template.step_count`, mais um para uma missão terminada: de 1 a 19 para as 18 etapas da Ocre no Dofus, de 1 a 35 no Retro e no Touch. Fora disso, a API responde `BAD_REQUEST`.
- Um limiar do modo especialista vai de 0 a 99. Fora disso, é recusado antes do envio. Os limiares só são salvos no modo especialista: no modo automático, um valor válido é aceito mas não é guardado.
- Depois de uma escrita, a próxima leitura está atualizada: o cache da sua chave é descartado.
- A API não cria nem exclui missões: isso se faz no site.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Quests`](/reference/quests/) | Suas próprias missões: as da conta à qual a chave de API pertence. |
| [`MonsterQuantityResult`](/reference/monster-quantity-result/) | O que definir uma quantidade retorna, para cada monstro. |
| [`MonstersUpdateResult`](/reference/monsters-update-result/) | O que `quests.setMonsters()` retorna. |
| [`OwnQuest`](/reference/own-quest/) | Uma das suas missões, como `quests.list()` a retorna. |
| [`OwnQuestMonster`](/reference/own-quest-monster/) | Um monstro de uma das suas missões, com seus ajustes manuais de troca. |
| [`OwnQuestMonstersParams`](/reference/own-quest-monsters-params/) | Filtros de [`Quests.monsters`](/reference/quests/). |
| [`QuestBase`](/reference/quest-base/) | O que toda missão traz, seja quem for que a veja. |
| [`QuestMonster`](/reference/quest-monster/) | Um monstro de uma missão, como qualquer pessoa pode vê-lo. |
| [`QuestSettings`](/reference/quest-settings/) | As configurações completas de uma das suas missões. |
| [`QuestUpdate`](/reference/quest-update/) | O que `quests.update()` pode alterar. |
| [`QuestUpdateResult`](/reference/quest-update-result/) | O que `quests.update()` retorna: o slug e apenas os campos que você alterou. |
| [`QuestZonesParams`](/reference/quest-zones-params/) | Filtros de [`Quests.zones`](/reference/quests/). |
| [`SubzoneProgress`](/reference/subzone-progress/) | O progresso de uma missão em uma subzona. |
| [`TypeFilter`](/reference/type-filter/) | Filtros de troca de um tipo de monstro. |
| [`ZoneProgress`](/reference/zone-progress/) | O progresso de uma missão em uma zona. |
| [`ZoneProgressMonster`](/reference/zone-progress-monster/) | Um monstro no progresso de uma missão por zona. |
| [`MonsterQuantities`](/reference/monster-quantities/) | Quantidades a definir, em qualquer uma de três formas: uma lista de `{ monster, quantity }`, um objeto indexado pelo nome do monstro, ou um `Map`. |
| [`TypeFilters`](/reference/type-filters/) | Filtros de troca por tipo de monstro, indexados pelo identificador do tipo como string: `"1"` monstros, `"2"` chefes, `"3"` arquimonstros. |
<!-- exports:end -->
