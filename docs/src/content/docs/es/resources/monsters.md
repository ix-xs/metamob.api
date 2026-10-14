---
title: Monstruos
description: Busca los monstruos del juego por nombre en tres idiomas, fíltralos por tipo y lee uno con las zonas donde vive y, si es un archimonstruo, el monstruo del que es la versión rara.
sidebar:
  order: 4
---

```ts
const tofu = await metamob.monsters.get("Tofu Maléfique");

console.log(tofu.name.en); // "Evil Tofu"
console.log(tofu.level_min, tofu.level_max);
console.log(tofu.zones.map((zone) => zone.name.fr)); // ["Amakna"]
```

## Leer un monstruo

`monsters.get()` acepta un nombre, un identificador o un objeto, ver [Nombres e identificadores](/basics/names-and-ids/). Además de lo que da una lista, la respuesta incluye las zonas y subzonas donde se puede encontrar el monstruo.

```ts
const monster = await metamob.monsters.get("Bouflet le Puéril");

monster.type?.name.fr; // "archimonstre"
monster.reference?.name.fr; // el monstruo del que es la versión rara
urls.monsterImage(monster); // su imagen en metamob.fr

for (const zone of monster.zones) {
  console.log(zone.name.fr, zone.subzones.map((subzone) => subzone.name.fr));
}
```

Algunos archimonstruos tienen el mismo nombre en dos versiones del juego. Una indicación dice a cuál te refieres: aquí una versión del juego, o bien una plantilla de misión con `{ template }`:

```ts
await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });
```

## Listar y filtrar

`monsters.list()` es una [lista](/basics/lists/), de 200 monstruos por página como máximo.

```ts
// Una página de jefes.
const page = await metamob.monsters.list({ type: "boss", limit: 50 });
page.total;

// Todos los archimonstruos.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
  console.log(monster.name.fr, monster.reference?.name.fr);
}
```

`type` es `"monstre"`, `"boss"` o `"archimonstre"`, sus nombres en inglés o en español, o bien 1, 2 o 3.

## Buscar por nombre

Una búsqueda coincide con una parte del nombre, en francés, inglés o español. Necesita 3 caracteres como mínimo.

```ts
const found = await metamob.monsters.search("bouf").all();
const archmonsters = await metamob.monsters.search("tofu", { type: "archimonstre" }).all();

// Lo mismo, escrito con list().
await metamob.monsters.list({ query: "bouf" });
```

## Sin ninguna solicitud

Para los nombres, los niveles, los tipos y dónde vive un monstruo, [los datos del paquete](/basics/embedded-data/) responden desde la memoria. Es la herramienta adecuada para un autocompletado, donde una solicitud por cada tecla agotaría el límite de solicitudes en segundos.

```ts
import { data } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 10 }); // ninguna solicitud
data.monster("Tofu Maléfique")?.level_max;
data.zonesOf("Tofu Maléfique");
```

Pregunta a la API cuando necesites el estado del juego en este momento, por ejemplo justo después de una actualización del juego.

## Monstruos de una misión

Qué monstruos pide una misión, y en qué etapa, es cosa de las [plantillas de misión](/resources/reference-data/#quest-templates). Lo que posees de ellos está en [Tus misiones](/resources/quests/#the-monsters-of-a-quest).

## Límites y errores

- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT` antes de gastar una solicitud.
- Un identificador que no existe responde `NOT_FOUND`. Un nombre que no existe lanza `UNKNOWN_NAME`, con sugerencias.
- Las respuestas se guardan en [caché](/basics/caching/) durante 10 minutos por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `monsters.get(monster, { gameVersion, template }?, options?)` | `MonsterDetail` |
| `monsters.list({ query, type, limit, offset }, options?)` | una lista de `Monster` |
| `monsters.search(query, { type, limit, offset }, options?)` | una lista de `Monster` |

Un `Monster`:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `id` | `number` | |
| `name` | `{ fr, en, es }` | El nombre en tres idiomas |
| `image` | `string` | Nombre de archivo de la imagen, ver `urls.monsterImage()` |
| `level_min`, `level_max` | `number` | |
| `type` | `MonsterType \| null` | `{ id, name }`: monstruo, jefe o archimonstruo |
| `reference` | `{ id, name }` o ausente | Para un archimonstruo, su monstruo de base |
| `zones` | `ZoneDetail[]` | Solo con `get()`: las zonas, cada una con las subzonas correspondientes |

## Ver también

- [Nombres e identificadores](/basics/names-and-ids/)
- [Los datos del paquete](/basics/embedded-data/)
- [Zonas](/resources/zones/)
- [Datos de referencia](/resources/reference-data/)
