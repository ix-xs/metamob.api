---
title: Listas
description: "Un método paginado devuelve una solicitud: esperada, da una página; recorrida, cada elemento. No se envía nada antes."
sidebar:
  order: 2
---

Un método paginado devuelve una solicitud, que se lee de tres formas:

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
page.hasNext; // indica si quedan más
```

Una página es iterable, y `next()` obtiene la siguiente. Devuelve `null` después de la última.

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

`for await` recorre cada elemento. Una página solo se pide cuando el bucle llega a ella: salir del bucle detiene las solicitudes.

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  if (monster.step > 20) break; // ya no se obtiene nada más
  console.log(monster.name.fr);
}
```

Cuando no das `limit`, un recorrido usa la página más grande que acepta el punto de acceso: 200 para los monstruos y las misiones, 50 para los usuarios, las conversaciones y las coincidencias. Son menos solicitudes para los mismos datos.

## Arrays

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

Sin límite, `all()` obtiene todas las páginas: en una búsqueda, indica uno.

## El primer elemento, o el número

Cada uno solo envía una solicitud, de un solo elemento.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined cuando no hay ninguna

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Página a página

`pages()` da las páginas enteras, para cuando la página importa: una barra de progreso, una inserción por lotes.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Páginas que traen más

Tres listas llegan con aquello a lo que pertenecen, en cada página:

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // la plantilla a la que pertenecen los monstruos

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // la misión a la que pertenecen los monstruos

const mine = await metamob.quests.monsters(slug);
mine.slug; // el slug de la misión
```

## Los mensajes y las propuestas usan un cursor

Los mensajes de una conversación y las propuestas de intercambio no están numerados: la API los pagina del más reciente al más antiguo, con un cursor que proporciona página tras página. Se aplican los mismos métodos, pero `total` y `count()` valen `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // donde empieza la página siguiente, undefined al final

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // del más reciente al más antiguo
}
```

## Las listas que no están paginadas

Algunos puntos de acceso responden todo de una vez y devuelven un simple array: `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` y las listas de referencia (`servers.list()` y las demás del mismo tipo).

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`ListRequest`](/reference/list-request/) | Lo que devuelve cada método paginado. |
| [`Page`](/reference/page/) | Una página de resultados. |
| [`CollectOptions`](/reference/collect-options/) | Opciones de [`ListRequest.all`](/reference/list-request/) y [`ListRequest.pages`](/reference/list-request/). |
| [`PageParams`](/reference/page-params/) | Tamaño de página y punto de partida de una lista paginada. |
<!-- exports:end -->
