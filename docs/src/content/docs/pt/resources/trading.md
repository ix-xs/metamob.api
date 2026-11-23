---
title: Trocas
description: "Encontrar parceiros de troca para uma missão, e definir monstro por monstro o que ela oferece e procura."
sidebar:
  order: 3
---

## Como uma missão troca

Para cada monstro, uma missão oferece algumas cópias e procura outras. Por padrão, o site calcula as duas coisas a partir do que você possui e de `parallel_quests`: as cópias sobrando são oferecidas, o que falta é procurado. Três configurações mudam esse cálculo:

1. O modo de troca da missão. No modo especialista, dois limiares dizem a partir de qual quantidade um monstro é oferecido e até qual quantidade ele é procurado.
2. Os filtros por tipo: nunca oferecer, ou nunca procurar, monstros, chefes ou arquimonstros.
3. Uma configuração manual em um monstro, que vale mais que todo o resto.

As duas primeiras são alteradas com [`quests.update()`](/resources/quests/#changing-settings), a terceira é descrita abaixo. O resultado é o que os outros jogadores veem: `want` e `offer` em cada monstro.

## Encontrar parceiros

`quests.matches()` classifica os jogadores com quem você poderia trocar, como a opção "Melhor correspondência" da página Comunidade do site: mesmo servidor, mesmo tipo de missão, ativos nos últimos dois meses. As trocas equilibradas, com tantos monstros em um sentido quanto no outro, vêm primeiro. A API examina no máximo os 500 jogadores ativos mais recentemente.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Cada correspondência lista os monstros nos dois sentidos, com as quantidades:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available`);
  console.log(`you need ${monster.needed}`, monster.covers_need ? "(covered)" : "");
}
```

Dois filtros restringem a lista:

```ts
// Uma troca possível nos dois sentidos.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Pelo menos duas missões feitas em paralelo.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

É uma [lista](/basics/lists/), de no máximo 50 parceiros por página.

## Quem tem um monstro

Para um único monstro, filtre os parceiros você mesmo:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  const offers = match.matches.they_have_you_want;
  if (offers.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Ver a missão de alguém

A missão de um parceiro é pública. `status` a restringe ao que ele oferece ou ao que ele procura:

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted" }).all();
```

Veja [Outros jogadores](/resources/users/).

## Sobrescrever um monstro

`setTrade` força o número de cópias de um monstro que a missão oferece, procura, ou os dois:

```ts
// Oferecer um só, quantas cópias sobrando houver.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// Não oferecer nenhum: guardar todos.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Procurar dois, seja qual for o resultado do cálculo.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // o que a missão procura agora
```

`0` e `null` não significam a mesma coisa: `0` força "nenhum", `null` remove a configuração manual e devolve o valor ao cálculo.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Os dois de uma vez.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Um campo que você deixa de fora não é alterado.

## Ver as suas sobrescritas

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, monster.trade_offer, monster.trade_want);
}
```

`trade_offer` e `trade_want` são as configurações manuais, `null` quando não há nenhuma. `offer` e `want` são o resultado.

## Propostas

As propostas enviadas e recebidas são lidas com [`tradeProposals.list()`](/resources/trade-proposals/), e também aparecem nas suas [conversas](/resources/conversations/#trade-proposals). [`tradeProposals.create()`](/resources/trade-proposals/#making-a-proposal) envia uma, quando o envio está liberado na conta. `apply()` aplica o seu lado, `unapply()` o desfaz em até 2 horas, e `cancel()` cancela ou recusa a proposta.

## Limites e erros

- `trade_offer` vai de 0 até a quantidade que você possui. Além disso, a API responde `BAD_REQUEST`.
- `trade_want` começa em 0. Mantenha-o dentro do que uma missão pode precisar: a API não recusa um valor alto.
- `NOT_FOUND` para uma missão que não é sua.
- Uma configuração manual vazia, sem nenhum dos dois campos, é recusada antes do envio.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`MatchesParams`](/reference/matches-params/) | Filtros de [`Quests.matches`](/reference/quests/). |
| [`MatchMonster`](/reference/match-monster/) | Um monstro que um lado de uma correspondência pode dar ao outro. |
| [`TradeMatch`](/reference/trade-match/) | Um parceiro de troca para uma das suas missões. |
| [`TradeOverride`](/reference/trade-override/) | Um ajuste manual de troca. |
| [`TradeOverrideResult`](/reference/trade-override-result/) | O que `quests.setTrade()` retorna. |
<!-- exports:end -->
