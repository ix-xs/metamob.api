---
title: Otros jugadores
description: "Buscar jugadores, leer un perfil público y los monstruos de una misión pública."
sidebar:
  order: 6
---

## Buscar jugadores

`users.search()` busca una parte del nombre de usuario, a partir de 3 caracteres, entre los jugadores que tienen al menos una misión pública. Es una [lista](/basics/lists/) de 50 jugadores por página como máximo. Solo se buscan los jugadores vistos en los últimos 90 días; `activeWithinDays` cambia ese plazo, hasta 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// En un servidor, entre los jugadores vistos en los últimos 30 días.
const filters = { server: "Draconiros", activeWithinDays: 30 };
const active = await metamob.users.search("ix-", filters).all();
```

## Leer un perfil

`users.get()` devuelve el perfil público de un jugador, con la lista de sus misiones públicas:

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // la dirección del perfil en metamob.fr
```

Las mayúsculas del nombre de usuario no importan: `"ix-xs"` encuentra `"Ix-xs"`, y la respuesta lo escribe como su dueño.

## Misiones públicas

`users.quests()` da las misiones públicas de un jugador, con el número de monstruos que cada una busca y ofrece:

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Los monstruos de una misión pública

`users.quest()` es una [lista](/basics/lists/) de los monstruos de una misión, con lo que su dueño posee, busca y ofrece. Cada página también contiene la misión:

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Se aplican los mismos filtros que para tus misiones:

```ts
// Lo que busca entre los archimonstruos.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Todo lo que está en la etapa 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` y `offer` son lo que la misión busca y ofrece realmente, una vez aplicados los ajustes de intercambio de su dueño. Un jugador puede tener ejemplares de sobra sin ofrecer ninguno.

## Tus propias misiones

Con estos métodos, tus misiones aparecen como las ven los demás: solo las públicas, sin tus ajustes. Para la vista completa y para modificarlas, usa [`metamob.quests`](/resources/quests/).

## Límites y errores

- `NOT_FOUND` para un jugador que no existe, cuya cuenta se ha borrado, o para una misión oculta.
- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT` antes del envío.
- Nada de esto se guarda en caché por defecto. Para un perfil que se muestra a menudo: `cache: { methods: { "users.get": "1m" } }`, consulta [Caché](/basics/caching/).

## Referencia

| Método | Devuelve |
| --- | --- |
| `users.search(query, { server, activeWithinDays, limit, offset }, options?)` | una lista de `UserSummary` |
| `users.get(username, options?)` | `UserProfile` |
| `users.quests(username, options?)` | `PublicQuestSummary[]` |
| `users.quest(username, slug, { type, status, step, limit, offset }, options?)` | una lista de `QuestMonster`, con `page.quest` |

Una misión pública:

| Campo | Significado |
| --- | --- |
| `slug` | Su identificador |
| `character_name` | El personaje que hace la misión |
| `current_step` | La etapa en la que está el personaje |
| `parallel_quests` | Misiones en paralelo, es decir, el número de ejemplares de cada monstruo que reunir |
| `server` | El servidor, con su versión del juego |
| `quest_template` | El tipo de misión, su número de monstruos y de etapas |
| `wanted_count`, `offered_count` | Solo con `users.quests()` |

Un monstruo de una misión pública es un `Monster` con `step`, `quantity`, `want` y `offer`.
