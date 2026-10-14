---
title: Intercambios
description: Encuentra a los jugadores que tienen lo que necesita una de tus misiones y que buscan lo que a ella le sobra, y decide monstruo por monstruo cuántos ofreces y cuántos buscas.
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

## Cómo intercambia una misión

Para cada monstruo, una misión ofrece cierta cantidad y busca cierta cantidad. Por defecto, el sitio calcula ambas a partir de lo que posees y de `parallel_quests`: los ejemplares de sobra se ofrecen, lo que falta se busca. Tres ajustes modifican ese cálculo:

1. El modo de intercambio de la misión. En modo experto, dos umbrales indican a partir de qué cantidad se ofrece un monstruo y hasta qué cantidad se busca.
2. Los filtros por tipo: no ofrecer nunca, o no buscar nunca, monstruos, jefes o archimonstruos.
3. Un ajuste manual sobre un monstruo, que prevalece sobre todo lo demás.

Los dos primeros son ajustes de la misión, que se cambian con [`quests.update()`](/resources/quests/#changing-settings). El tercero se explica más abajo. El resultado de los tres es lo que ven los demás jugadores: `want` y `offer` en cada monstruo.

## Encontrar socios

`quests.matches()` ordena a los jugadores con los que podrías intercambiar, igual que la opción «Mejor coincidencia» de la página Comunidad del sitio: mismo servidor, mismo tipo de misión, activos en los últimos dos meses. El orden favorece el equilibrio: primero van los socios con los que pasan tantos monstruos en un sentido como en el otro. La API examina como máximo a los 500 jugadores activos más recientemente.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Cada coincidencia lista los monstruos en ambos sentidos, con las cantidades:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available, you need ${monster.needed}`);
  if (monster.covers_need) console.log("  covers everything you need");
}
```

Dos filtros:

```ts
// Solo los socios con los que algo puede ir en ambos sentidos.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Solo los socios que hacen al menos dos misiones en paralelo.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

Es una [lista](/basics/lists/), de 50 socios por página como máximo.

## Quién tiene un monstruo concreto

Para buscar un solo monstruo en lugar del mejor socio en conjunto, filtra tú mismo las coincidencias:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  if (match.matches.they_have_you_want.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Mirar la misión de otro jugador

Cuando ya tienes un socio, su misión es pública. `status` la reduce a lo que ofrece o a lo que busca.

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();
```

Ver [Otros jugadores](/resources/users/).

## Poner un ajuste manual en un monstruo

`setTrade` impone cuántos ejemplares de un monstruo ofrece la misión, cuántos busca, o ambas cosas.

```ts
// Ofrecer uno solo, por muchos ejemplares de sobra que haya.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// No ofrecer ninguno: quedárselos todos.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Buscar dos, diga lo que diga el cálculo.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // lo que la misión busca ahora
```

`null` no es 0. `0` impone «ninguno». `null` quita el ajuste manual y devuelve el valor al cálculo.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Los dos a la vez.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Un campo que omites no se toca.

## Ver tus ajustes manuales

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, { offer: monster.trade_offer, want: monster.trade_want });
}
```

`trade_offer` y `trade_want` son los ajustes manuales, `null` cuando no hay ninguno. `offer` y `want` son el resultado.

## Propuestas

Una propuesta de intercambio entre dos jugadores se hace en el sitio. La API muestra las que has enviado y recibido, dentro de tus [conversaciones](/resources/conversations/#trade-proposals), pero no las crea ni las confirma.

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
| `matches.they_have_you_want` | Lo que puede darte |
| `matches.you_have_they_want` | Lo que puedes darle |
| `match_score` | Cuántos monstruos distintos puedes dar, más cuántos puedes recibir. El orden no sigue esta suma: el equilibrio va primero |

Cada monstruo de una coincidencia tiene `id`, `name`, `available`, `needed` y `covers_need`.

## Ver también

- [Tus misiones](/resources/quests/)
- [Otros jugadores](/resources/users/)
- [Conversaciones](/resources/conversations/)
- [Un buscador de intercambios](/recipes/trade-finder/)
