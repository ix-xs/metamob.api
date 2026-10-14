---
title: Échanges
description: Trouvez les joueurs qui ont ce qui manque à l'une de vos quêtes et qui recherchent ce qu'elle a en trop, et décidez monstre par monstre combien vous en proposez et combien vous en recherchez.
sidebar:
  order: 3
---

```ts
const page = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

for (const match of page.items) {
  const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
  const wants = match.matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(match.user.username, { gives, wants });
}
```

## Comment une quête échange

Pour chaque monstre, une quête en propose un certain nombre et en recherche un certain nombre. Par défaut, le site calcule les deux à partir de ce que vous possédez et de `parallel_quests` : les exemplaires en trop sont proposés, ce qui manque est recherché. Trois réglages modifient ce calcul :

1. Le mode d'échange de la quête. En mode expert, deux seuils disent à partir de quelle quantité un monstre est proposé et jusqu'à quelle quantité il est recherché.
2. Les filtres par type : ne jamais proposer, ou ne jamais rechercher, les monstres, les boss ou les archimonstres.
3. Un réglage manuel sur un monstre, qui l'emporte sur tout le reste.

Les deux premiers sont des réglages de la quête, modifiés avec [`quests.update()`](/resources/quests/#changing-settings). Le troisième est décrit plus bas. Ce qui ressort des trois est ce que voient les autres joueurs : `want` et `offer` sur chaque monstre.

## Trouver des partenaires

`quests.matches()` classe les joueurs avec qui vous pourriez échanger, comme l'option « Meilleur matching » de la page Communauté du site : même serveur, même type de quête, actifs au cours des deux derniers mois. Le classement privilégie l'équilibre : les partenaires avec qui autant de monstres vont dans un sens que dans l'autre arrivent en premier. L'API examine au plus les 500 joueurs actifs le plus récemment.

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
  console.log(monster.name.fr, `${monster.available} available, you need ${monster.needed}`);
  if (monster.covers_need) console.log("  covers everything you need");
}
```

Deux filtres :

```ts
// Seulement les partenaires avec qui un échange peut se faire dans les deux sens.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Seulement les partenaires qui mènent au moins deux quêtes en parallèle.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

C'est une [liste](/basics/lists/), de 50 partenaires par page au plus.

## Qui possède un monstre donné

Pour chercher un seul monstre plutôt que le meilleur partenaire d'ensemble, filtrez vous-même les correspondances :

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  if (match.matches.they_have_you_want.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Regarder la quête d'un joueur

Une fois que vous avez un partenaire, sa quête est publique. `status` la réduit à ce qu'il propose ou à ce qu'il recherche.

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();
```

Voir [Autres joueurs](/resources/users/).

## Poser un réglage manuel sur un monstre

`setTrade` impose le nombre d'exemplaires d'un monstre que la quête propose, recherche, ou les deux.

```ts
// En proposer un seul, quel que soit le nombre d'exemplaires en trop.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// N'en proposer aucun : les garder tous.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// En rechercher deux, quoi que donne le calcul.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // ce que la quête recherche désormais
```

`null` n'est pas 0. `0` impose « aucun ». `null` retire le réglage manuel et rend la valeur au calcul.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Les deux à la fois.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Un champ que vous omettez n'est pas touché.

## Voir vos réglages manuels

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, { offer: monster.trade_offer, want: monster.trade_want });
}
```

`trade_offer` et `trade_want` sont les réglages manuels, `null` quand il n'y en a pas. `offer` et `want` sont le résultat.

## Propositions

Une proposition d'échange entre deux joueurs se fait sur le site. L'API montre celles que vous avez envoyées et reçues, dans vos [conversations](/resources/conversations/#trade-proposals), mais elle ne les crée pas et ne les confirme pas.

## Limites et erreurs

- `trade_offer` va de 0 à la quantité que vous possédez. Au-delà, l'API répond `BAD_REQUEST`.
- `trade_want` commence à 0. Gardez-le dans ce dont une quête peut avoir besoin : l'API ne refuse pas une grande valeur.
- `NOT_FOUND` pour une quête qui n'est pas la vôtre.
- Un réglage manuel vide, sans aucun des deux champs, est refusé avant d'être envoyé.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `quests.matches(slug, { minParallelQuests, onlyPossibleTrades, limit, offset }, options?)` | une liste de `TradeMatch` |
| `quests.setTrade(slug, monster, { trade_offer, trade_want }, options?)` | `TradeOverrideResult` |
| `quests.resetTrade(slug, monster, options?)` | `TradeOverrideResult` |

Un `TradeMatch` :

| Champ | Signification |
| --- | --- |
| `user` | `username`, `avatar`, `last_active` |
| `quest` | `slug`, `character_name`, `parallel_quests` de sa quête |
| `matches.they_have_you_want` | Ce qu'il peut vous donner |
| `matches.you_have_they_want` | Ce que vous pouvez lui donner |
| `match_score` | Nombre de monstres différents que vous pouvez donner, plus nombre de monstres différents que vous pouvez recevoir. Le classement ne suit pas cette somme : l'équilibre passe d'abord |

Chaque monstre d'une correspondance a `id`, `name`, `available`, `needed` et `covers_need`.

## Voir aussi

- [Vos quêtes](/resources/quests/)
- [Autres joueurs](/resources/users/)
- [Conversations](/resources/conversations/)
- [Un chercheur d'échanges](/recipes/trade-finder/)
