---
title: Otros jugadores
description: Busca jugadores por nombre, lee un perfil público y mira dentro de una misión pública para ver lo que su propietario ofrece y busca.
sidebar:
  order: 6
---

```ts
const profile = await metamob.users.get("Ix-xs");

for (const quest of profile.quests) {
  console.log(quest.character_name, quest.server?.name, `step ${quest.current_step}`);
}
```

## Buscar jugadores

Una búsqueda coincide con una parte del nombre de usuario, entre los jugadores que tienen al menos una misión pública. Necesita 3 caracteres como mínimo y es una [lista](/basics/lists/), de 50 jugadores por página como máximo. Solo se busca entre los jugadores vistos en los últimos 90 días, salvo que `activeWithinDays` indique otra cosa, hasta 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// En un servidor, entre los jugadores vistos en los últimos 30 días.
const active = await metamob.users.search("ix-", { server: "Draconiros", activeWithinDays: 30 }).all();
```

## Leer un perfil

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // la dirección del perfil en metamob.fr
```

Un jugador se encuentra sea cual sea el uso de mayúsculas del nombre de usuario que des, y la respuesta lo escribe como su dueño: `"ix-xs"` encuentra `"Ix-xs"`. Un perfil lista las misiones públicas del jugador, sin sus monstruos.

## Misiones públicas

`users.quests()` añade, para cada misión, cuántos monstruos busca y cuántos ofrece.

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Los monstruos de una misión pública

`users.quest()` es una [lista](/basics/lists/) de los monstruos de una misión, con lo que su propietario posee, busca y ofrece. Cada página lleva también la propia misión.

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Filtros:

```ts
// Lo que busca entre los archimonstruos.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Todo lo de la etapa 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` y `offer` son lo que la misión pone realmente en el mercado, una vez aplicados los ajustes de intercambio de su propietario. Un jugador puede tener ejemplares de sobra y no ofrecer ninguno.

## Tus propias misiones

Con estos métodos, tus misiones aparecen como las ven los demás: solo las públicas, sin tus ajustes de intercambio. Para verlo todo, y para cambiar cualquier cosa, usa [`metamob.quests`](/resources/quests/).

## Límites y errores

- `NOT_FOUND` para un jugador que no existe, cuya cuenta ha sido eliminada, o para una misión oculta.
- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT` antes de gastar una solicitud.
- Nada de esto se guarda en caché por defecto. Una página de perfil con muchas visitas puede guardarlo en caché: `cache: { methods: { "users.get": "1m" } }`, ver [Caché](/basics/caching/).

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
| `parallel_quests` | Misiones en paralelo, es decir, cuántos ejemplares de cada monstruo hacen falta |
| `server` | El servidor, con su versión del juego |
| `quest_template` | El tipo de misión, su número de monstruos y de etapas |
| `wanted_count`, `offered_count` | Solo con `users.quests()` |

Un monstruo de una misión pública es un `Monster` con `step`, `quantity`, `want` y `offer`.

## Ver también

- [Intercambios](/resources/trading/)
- [Tus misiones](/resources/quests/)
- [Conversaciones](/resources/conversations/)
- [Cuenta](/resources/account/)
