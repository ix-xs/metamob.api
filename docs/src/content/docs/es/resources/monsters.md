---
title: Monstruos
description: "Leer un monstruo con sus zonas, listar los monstruos por tipo y buscarlos por nombre."
sidebar:
  order: 4
---

## Leer un monstruo

`monsters.get()` toma un nombre, un identificador o un objeto, consulta [Nombres e identificadores](/basics/names-and-ids/). La respuesta también contiene las zonas y subzonas donde vive el monstruo:

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // el monstruo del que es la versión rara
urls.monsterImage(monster); // su imagen en metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Cada versión del juego tiene sus propios monstruos, y la mayoría lleva el mismo nombre de una versión a otra. Sin más, es el de Dofus (Unity). Indica otra versión, o una plantilla de misión con `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Listar y filtrar

`monsters.list()` es una [lista](/basics/lists/) de 200 monstruos por página como máximo:

```ts
// Una página de jefes.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Todos los archimonstruos.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}

// Los monstruos de Dofus Retro, y un monstruo por su identificador en el juego.
const retro = metamob.monsters.list({ gameVersion: "Dofus Retro (1.29)" });
const [tofu] = await metamob.monsters.list({ gameVersion: "Dofus (Unity)", officialId: 98 }).take(1);
```

`type` vale `"monstre"`, `"boss"` o `"archimonstre"`, sus traducciones, o también 1, 2 o 3. `gameVersion` conserva los monstruos de una versión del juego. `officialId` busca un monstruo por su identificador en el cliente del juego, el mismo que DofusDB para Dofus (Unity): solo es único dentro de una versión, de ahí `gameVersion` al lado. Cada monstruo lleva los dos, `game_version` y `official_id`.

## Buscar por nombre

`monsters.search()` busca una parte del nombre, en todos los idiomas del sitio, a partir de 3 caracteres:

```ts
const found = await metamob.monsters.search("bouf").all();
const arch = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// Lo mismo, escrito con list().
await metamob.monsters.list({ query: "bouf" });
```

## Sin solicitud

Los nombres, los niveles, los tipos y las zonas de los monstruos también están en [los datos del paquete](/basics/embedded-data/). Para un autocompletado, que busca en cada pulsación de tecla, es lo que hay que usar: una solicitud por pulsación alcanzaría pronto el límite.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // ninguna solicitud
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Pasa por la API para los datos del día, por ejemplo justo después de una actualización del juego.

## Los monstruos de una misión

Los monstruos que pide una misión, etapa por etapa, vienen de las [plantillas de misión](/resources/reference-data/#quest-templates). Lo que posees de ellos se lee en [Tus misiones](/resources/quests/#the-monsters-of-a-quest).

## Límites y errores

- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT` antes del envío.
- Un identificador que no existe responde `NOT_FOUND`. Un nombre que no existe lanza `UNKNOWN_NAME`, con sugerencias.
- Las respuestas se [guardan en caché](/basics/caching/) durante 10 minutos por defecto.

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`Monsters`](/reference/monsters/) | Los monstruos del juego. |
| [`urls`](/reference/urls/) | Direcciones en metamob.fr, construidas a partir de lo que devuelve la API. |
| [`Monster`](/reference/monster/) | Un monstruo, con su versión del juego. |
| [`MonsterBase`](/reference/monster-base/) | Un monstruo, dondequiera que aparezca dentro de otra cosa: una misión, una etapa. |
| [`MonsterDetail`](/reference/monster-detail/) | Un monstruo con los lugares donde vive. |
| [`MonsterListParams`](/reference/monster-list-params/) | Filtros de [`Monsters.list`](/reference/monsters/). |
| [`MonsterReference`](/reference/monster-reference/) | El monstruo de base de un archimonstruo. |
| [`MonsterType`](/reference/monster-type/) | Un tipo de monstruo: 1 es un monstruo, 2 un jefe, 3 un archimonstruo. |
| [`MonsterZone`](/reference/monster-zone/) | Una zona donde vive un monstruo, con las subzonas correspondientes. |
| [`TemplateMonster`](/reference/template-monster/) | Un monstruo de una plantilla de misión, con la etapa a la que pertenece. |
<!-- exports:end -->
