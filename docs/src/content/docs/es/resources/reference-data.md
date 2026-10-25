---
title: Datos de referencia
description: Las listas a las que remite todo lo demás. Versiones del juego, servidores, tipos de monstruos, tipos de misión y las plantillas de misión, que dicen qué monstruos pide una misión en cada etapa.
sidebar:
  order: 10
---

```ts
const servers = await metamob.servers.list();
const touch = servers.filter((server) => server.game_version?.name === "Dofus Touch");

console.log(touch.map((server) => server.name));
```

## Pregunta primero al paquete

Todo esto viene con el paquete y [`data`](/basics/embedded-data/) lo lee desde la memoria: `data.servers`, `data.server("Draconiros")`, `data.questTemplates`, etc. Las llamadas de más abajo preguntan a la API, lo que solo merece una solicitud cuando necesitas lo que dice en este momento.

Sus respuestas se guardan en [caché](/basics/caching/) durante 10 minutos por defecto y se comparten entre las claves.

## Versiones del juego

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Servidores

Cada servidor pertenece a una versión del juego y a una comunidad.

```ts
const server = await metamob.servers.get("Draconiros");

server.community; // "World" o "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Tipos de monstruos

Hay tres: monstruo, jefe y archimonstruo, con los identificadores 1, 2 y 3. Sus nombres en la API son lo que acepta cada filtro `type` de la biblioteca.

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Tipos de misión

Metamob sigue dos misiones: la del Dofus Ocre, slug `ocre`, y el Dokille, slug `dokille`.

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // su imagen en metamob.fr
```

## Plantillas de misión

Una misión no es igual en todas las versiones del juego: la misión del Dofus Ocre no pide los mismos monstruos en Dofus (Unity) que en Dofus Touch. Una plantilla de misión es un tipo de misión en una versión del juego.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.id, template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

Una plantilla se designa por su identificador, o por lo que es:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

La API no tiene un endpoint para una plantilla sin sus monstruos: `get()` la saca de la lista.

## Los monstruos de una plantilla

`questTemplates.monsters()` es una [lista](/basics/lists/) de lo que pide la misión, cada monstruo con su etapa. 200 por página como máximo.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// Una etapa.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();
console.log(step4.map((monster) => monster.name.fr));

// La misión entera, en orden.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Cada página lleva también la plantilla a la que pertenecen los monstruos, en `page.template`.

Las misiones de los jugadores apuntan a su plantilla: `quest.quest_template` contiene su identificador, su tipo de misión y su número de monstruos y de etapas.

## Límites y errores

- `NOT_FOUND` para un identificador que no existe.
- `UNKNOWN_NAME`, con sugerencias, para un nombre que ni el paquete ni la API conocen.
- Si no hay plantilla para un tipo de misión en una versión del juego: `UNKNOWN_NAME` también. El Dokille no existe en todas las versiones.

## Referencia

| Método | Devuelve |
| --- | --- |
| `gameVersions.list(options?)`, `gameVersions.get(version, options?)` | `GameVersion[]`, `GameVersion` |
| `servers.list(options?)`, `servers.get(server, options?)` | `Server[]`, `Server` |
| `monsterTypes.list(options?)`, `monsterTypes.get(type, options?)` | `MonsterType[]`, `MonsterType` |
| `questTypes.list(options?)`, `questTypes.get(type, options?)` | `QuestType[]`, `QuestType` |
| `questTemplates.list(options?)`, `questTemplates.get(template, options?)` | `QuestTemplate[]`, `QuestTemplate` |
| `questTemplates.monsters(template, { step, limit, offset }, options?)` | una lista de `TemplateMonster`, con `page.template` |

| Tipo | Campos |
| --- | --- |
| `GameVersion` | `id`, `name` |
| `Server` | `id`, `name`, `community`, `game_version` |
| `MonsterType` | `id`, `name` en tres idiomas |
| `QuestType` | `id`, `slug`, `name` en tres idiomas, `image` |
| `QuestTemplate` | `id`, `quest_type`, `game_version`, `monster_count`, `step_count` |
| `TemplateMonster` | un `Monster` con su `step` |

## Ver también

- [Los datos del paquete](/basics/embedded-data/)
- [Monstruos](/resources/monsters/)
- [Tus misiones](/resources/quests/)
- [Caché](/basics/caching/)
