---
title: Échanges
description: "Trouver des partenaires d'échange pour une quête, et régler monstre par monstre ce qu'elle propose et recherche."
sidebar:
  order: 3
---

## Comment une quête échange

Pour chaque monstre, une quête en propose et en recherche un certain nombre. Par défaut, le site calcule les deux à partir de ce que vous possédez et de `parallel_quests` : les exemplaires en trop sont proposés, ce qui manque est recherché. Trois réglages changent ce calcul :

1. Le mode d'échange de la quête. En mode expert, deux seuils disent à partir de quelle quantité un monstre est proposé et jusqu'à quelle quantité il est recherché.
2. Les filtres par type : ne jamais proposer, ou ne jamais rechercher, les monstres, les boss ou les archimonstres.
3. Un réglage manuel sur un monstre, qui l'emporte sur tout le reste.

Les deux premiers se modifient avec [`quests.update()`](/resources/quests/#changing-settings), le troisième est décrit plus bas. Le résultat est ce que voient les autres joueurs : `want` et `offer` sur chaque monstre.

## Trouver des partenaires

`quests.matches()` classe les joueurs avec qui vous pourriez échanger, comme l'option « Meilleur matching » de la page Communauté du site : même serveur, même type de quête, actifs au cours des deux derniers mois. Les échanges équilibrés, avec autant de monstres dans chaque sens, passent en premier. L'API examine au plus les 500 joueurs actifs le plus récemment.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Chaque correspondance liste les monstres dans les deux sens, avec les quantités :

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available`);
  console.log(`you need ${monster.needed}`, monster.covers_need ? "(covered)" : "");
}
```

Deux filtres réduisent la liste :

```ts
// Un échange possible dans les deux sens.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Au moins deux quêtes menées en parallèle.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

C'est une [liste](/basics/lists/), de 50 partenaires par page au plus.

## Qui possède un monstre donné

Pour un seul monstre, filtrez les partenaires vous-même :

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  const offers = match.matches.they_have_you_want;
  if (offers.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Regarder la quête d'un joueur

La quête d'un partenaire est publique. `status` la réduit à ce qu'il propose ou à ce qu'il recherche :

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted" }).all();
```

Voir [Autres joueurs](/resources/users/).

## Poser un réglage manuel sur un monstre

`setTrade` impose le nombre d'exemplaires d'un monstre que la quête propose, recherche, ou les deux :

```ts
// En proposer un seul, quel que soit le nombre d'exemplaires en trop.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// N'en proposer aucun : les garder tous.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// En rechercher deux, quoi que donne le calcul.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // ce que la quête recherche désormais
```

`0` et `null` n'ont pas le même sens : `0` impose « aucun », `null` retire le réglage manuel et rend la valeur au calcul.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Les deux à la fois.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Un champ que vous omettez n'est pas touché.

## Voir vos réglages manuels

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, monster.trade_offer, monster.trade_want);
}
```

`trade_offer` et `trade_want` sont les réglages manuels, `null` quand il n'y en a pas. `offer` et `want` sont le résultat.

## Propositions

Les propositions envoyées et reçues se lisent avec [`tradeProposals.list()`](/resources/trade-proposals/), et apparaissent aussi dans vos [conversations](/resources/conversations/#trade-proposals). [`tradeProposals.create()`](/resources/trade-proposals/#making-a-proposal) en envoie une, quand l'envoi est ouvert sur le compte. `apply()` applique votre côté, et `cancel()` l'annule ou la refuse.

## Limites et erreurs

- `trade_offer` va de 0 à la quantité que vous possédez. Au-delà, l'API répond `BAD_REQUEST`.
- `trade_want` commence à 0. Gardez-le dans ce dont une quête peut avoir besoin : l'API ne refuse pas une grande valeur.
- `NOT_FOUND` pour une quête qui n'est pas la vôtre.
- Un réglage manuel vide, sans aucun des deux champs, est refusé avant d'être envoyé.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`MatchesParams`](/reference/matches-params/) | Filtres de [`Quests.matches`](/reference/quests/). |
| [`MatchMonster`](/reference/match-monster/) | Un monstre qu'un côté d'une correspondance peut donner à l'autre. |
| [`TradeMatch`](/reference/trade-match/) | Un partenaire d'échange pour une de vos quêtes. |
| [`TradeOverride`](/reference/trade-override/) | Un réglage manuel. |
| [`TradeOverrideResult`](/reference/trade-override-result/) | Ce que répond `quests.setTrade()`. |
<!-- exports:end -->
