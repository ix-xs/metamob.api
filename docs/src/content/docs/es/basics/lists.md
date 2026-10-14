---
title: Listas
description: "Cada método paginado devuelve una solicitud que puedes esperar con await para obtener una página, recorrer hasta el final o reunir en un array. No se envía nada hasta que haces una de las tres cosas."
sidebar:
  order: 2
---

```ts
const request = metamob.monsters.list({ type: "archimonstre" });

// Una página.
const page = await request;

// Cada elemento, página tras página.
for await (const monster of request) {
  console.log(monster.name.fr);
}

// Un array.
const everything = await request.all();
```

## Una página

Esperar una lista con `await` da su primera página.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

page.items; // los monstruos
page.total; // cuántos hay con estos filtros
page.limit; // 20
page.offset; // 0
page.hasNext; // si quedan más
```

Una página es iterable, y `next()` pide la siguiente. Devuelve `null` después de la última.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

for (const monster of page) console.log(monster.name.fr);

const second = await page.next();
```

Para empezar en otro punto, pasa `offset`:

```ts
const third = await metamob.monsters.list({ limit: 20, offset: 40 });
```

## Todo

`for await` recorre cada elemento. Las páginas se piden cuando el bucle llega a ellas, así que salir antes del bucle detiene las solicitudes.

```ts
for await (const monster of metamob.quests.monsters(slug, { status: "needed" })) {
  if (monster.step > 20) break; // no se pide nada más
  console.log(monster.name.fr);
}
```

Cuando no das `limit`, un recorrido usa la página más grande que acepta el endpoint: 200 para los monstruos y las misiones, 50 para los usuarios, las conversaciones y las coincidencias. Es el menor número de solicitudes para los mismos datos, y el límite de solicitudes cuenta solicitudes.

## Arrays

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

`all()` sin límite pide todas las páginas: en una búsqueda, da uno.

## El primer elemento, o el recuento

Los dos envían una sola solicitud para un solo elemento.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined cuando no hay ninguna

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Página a página

`pages()` entrega páginas enteras, para cuando la página en sí importa: una barra de progreso, una inserción por lotes.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Páginas que traen algo más

Tres listas llegan con aquello a lo que pertenecen, en cada página:

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // la plantilla a la que pertenecen los monstruos

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // la misión a la que pertenecen los monstruos

const mine = await metamob.quests.monsters(slug);
mine.slug; // el slug de la misión
```

## Los mensajes usan un cursor

Los mensajes de una conversación no están numerados: la API los pagina del más reciente hacia atrás, con un cursor que entrega página tras página. Los mismos métodos funcionan, y `total` y `count()` valen `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // dónde empieza la página siguiente, undefined al final

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // del más reciente al más antiguo
}
```

## Listas que no están paginadas

Algunos endpoints lo responden todo de una vez y devuelven un array simple: `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` y las listas de referencia (`servers.list()` y similares).

## Referencia

Lo que ofrece una solicitud de lista:

| Miembro | Resultado | Solicitudes |
| --- | --- | --- |
| `await request` | `Page` | 1 |
| `for await (const item of request)` | cada elemento | 1 por página, cuando el bucle llega a ella |
| `request.all({ limit })` | `T[]` | 1 por página |
| `request.take(n)` | `T[]` de `n` elementos como máximo | 1 por página |
| `request.first()` | `T \| undefined` | 1 |
| `request.count()` | `number \| undefined` | 1 |
| `request.pages({ limit })` | cada `Page` | 1 por página |

Lo que contiene una página:

| Miembro | Significado |
| --- | --- |
| `items` | Los elementos de la página |
| `total` | Elementos en el conjunto de las páginas, `undefined` para los mensajes |
| `limit`, `offset` | Lo que aplicó la API |
| `nextBeforeId` | Para los mensajes, el cursor de la página siguiente |
| `hasNext` | Si existe otra página |
| `next()` | La página siguiente, o `null` |
| `raw` | El cuerpo que envió la API |

Los métodos que devuelven una solicitud de lista:

| Método | Página más grande |
| --- | --- |
| `monsters.list`, `monsters.search` | 200 |
| `questTemplates.monsters` | 200 |
| `quests.monsters` | 200 |
| `users.quest` | 200 |
| `users.search` | 50 |
| `quests.matches` | 50 |
| `conversations.list` | 50 |
| `conversations.messages` | 50, por cursor |

## Ver también

- [El límite de solicitudes](/basics/rate-limit/)
- [Tus misiones](/resources/quests/)
- [Conversaciones](/resources/conversations/)
- [Todos los métodos](/reference/methods/)
