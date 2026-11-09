---
title: Intercambios
description: "Encontrar socios de intercambio para una misión, y ajustar monstruo a monstruo lo que ofrece y lo que busca."
sidebar:
  order: 3
---

## Cómo intercambia una misión

Para cada monstruo, una misión ofrece y busca cierto número de ejemplares. Por defecto, el sitio calcula los dos a partir de lo que posees y de `parallel_quests`: los ejemplares de sobra se ofrecen, lo que falta se busca. Tres ajustes cambian ese cálculo:

1. El modo de intercambio de la misión. En modo experto, dos umbrales dicen a partir de qué cantidad se ofrece un monstruo y hasta qué cantidad se busca.
2. Los filtros por tipo: no ofrecer nunca, o no buscar nunca, los monstruos, los jefes o los archimonstruos.
3. Un ajuste manual sobre un monstruo, que prevalece sobre todo lo demás.

Los dos primeros se modifican con [`quests.update()`](/resources/quests/#changing-settings), el tercero se describe más abajo. El resultado es lo que ven los demás jugadores: `want` y `offer` en cada monstruo.

## Encontrar socios

`quests.matches()` ordena a los jugadores con los que podrías intercambiar, como la opción «Mejor coincidencia» de la página Comunidad del sitio: mismo servidor, mismo tipo de misión, activos en los dos últimos meses. Los intercambios equilibrados, con tantos monstruos en un sentido como en el otro, van primero. La API examina como máximo a los 500 jugadores activos más recientemente.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Cada coincidencia lista los monstruos en los dos sentidos, con las cantidades:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available`);
  console.log(`you need ${monster.needed}`, monster.covers_need ? "(covered)" : "");
}
```

Dos filtros reducen la lista:

```ts
// Un intercambio posible en los dos sentidos.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Al menos dos misiones en paralelo.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

Es una [lista](/basics/lists/), de 50 socios por página como máximo.

## Quién tiene un monstruo concreto

Para un solo monstruo, filtra los socios tú mismo:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  const offers = match.matches.they_have_you_want;
  if (offers.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Mirar la misión de un jugador

La misión de un socio es pública. `status` la reduce a lo que ofrece o a lo que busca:

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted" }).all();
```

Consulta [Otros jugadores](/resources/users/).

## Poner un ajuste manual en un monstruo

`setTrade` impone el número de ejemplares de un monstruo que la misión ofrece, busca, o las dos cosas:

```ts
// Ofrecer uno solo, sea cual sea el número de ejemplares de sobra.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// No ofrecer ninguno: quedárselos todos.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Buscar dos, dé lo que dé el cálculo.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // lo que la misión busca ahora
```

`0` y `null` no significan lo mismo: `0` impone «ninguno», `null` quita el ajuste manual y devuelve el valor al cálculo.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Los dos a la vez.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Un campo que omites no se toca.

## Ver tus ajustes manuales

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, monster.trade_offer, monster.trade_want);
}
```

`trade_offer` y `trade_want` son los ajustes manuales, `null` cuando no los hay. `offer` y `want` son el resultado.

## Propuestas

Las propuestas enviadas y recibidas se leen con [`tradeProposals.list()`](/resources/trade-proposals/), y también aparecen en tus [conversaciones](/resources/conversations/#trade-proposals). [`tradeProposals.create()`](/resources/trade-proposals/#making-a-proposal) envía una, cuando el envío está abierto en la cuenta. `apply()` aplica tu lado, y `cancel()` la cancela o la rechaza.

## Límites y errores

- `trade_offer` va de 0 a la cantidad que posees. Por encima, la API responde `BAD_REQUEST`.
- `trade_want` empieza en 0. Mantenlo dentro de lo que una misión puede necesitar: la API no rechaza un valor grande.
- `NOT_FOUND` para una misión que no es tuya.
- Un ajuste manual vacío, sin ninguno de los dos campos, se rechaza antes de enviarse.

## Referencia

| Método | Devuelve |
| --- | --- |
| `quests.matches(slug, { minParallelQuests, onlyPossibleTrades, limit, offset }, options?)` | una lista de `TradeMatch` |
| `quests.setTrade(slug, monster, { trade_offer, trade_want }, options?)` | `TradeOverrideResult` |
| `quests.resetTrade(slug, monster, options?)` | `TradeOverrideResult` |

Un `TradeMatch`:

| Campo | Significado |
| --- | --- |
| `user` | `username`, `avatar`, `last_active` |
| `quest` | `slug`, `character_name`, `parallel_quests` de su misión |
| `matches.they_have_you_want` | Lo que te puede dar |
| `matches.you_have_they_want` | Lo que le puedes dar |
| `match_score` | Número de monstruos distintos que puedes dar, más los que puedes recibir. La clasificación favorece el equilibrio, no esta suma |

Cada monstruo de una coincidencia tiene `id`, `name`, `available`, `needed` y `covers_need`.
