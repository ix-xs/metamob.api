---
title: Datos de referencia
description: "Versiones del juego, servidores, tipos de monstruo, tipos de misión y plantillas de misión."
sidebar:
  order: 10
---

Estas listas son aquellas a las que remite el resto de la API.

## Pregunta primero al paquete

Todos estos datos también vienen incluidos en el paquete, y [`data`](/basics/embedded-data/) los lee sin solicitud: `data.servers`, `data.server("Draconiros")`, `data.questTemplates`, etc. Las llamadas de abajo consultan la API, para cuando quieras los datos del día.

Sus respuestas se [guardan en caché](/basics/caching/) 10 minutos por defecto, para todas las claves.

## Versiones del juego

```ts
const versions = await metamob.gameVersions.list();
// Dofus (Unity), Dofus Retro (1.29), Dofus Touch

const retro = await metamob.gameVersions.get("Dofus Retro (1.29)");
retro.id;
```

## Servidores

Cada servidor pertenece a una versión del juego y a una comunidad:

```ts
const servers = await metamob.servers.list();
const server = await metamob.servers.get("Draconiros");

server.community; // "World" o "France"
server.game_version?.name; // "Dofus (Unity)"
```

## Tipos de monstruo

Hay tres: monstruo, jefe y archimonstruo, con los identificadores 1, 2 y 3. Cada filtro `type` acepta sus nombres:

```ts
const kinds = await metamob.monsterTypes.list();
const arch = await metamob.monsterTypes.get("archimonstre");

arch.name; // { fr: "archimonstre", en: "archmonster", es: "archimonstruo" }
```

## Tipos de misión

Metamob sigue dos misiones: la del Dofus Ocre, con el slug `ocre`, y la del Dokille, con el slug `dokille`:

```ts
const kinds = await metamob.questTypes.list();
const ochre = await metamob.questTypes.get("ocre");

ochre.name.en; // "Ochre"
urls.questTypeImage(ochre); // su imagen en metamob.fr
```

## Plantillas de misión

Una misión no es la misma en todas las versiones del juego: la del Dofus Ocre no pide los mismos monstruos en Dofus (Unity) y en Dofus Touch. Una plantilla de misión es un tipo de misión en una versión del juego.

```ts
for (const template of await metamob.questTemplates.list()) {
  console.log(template.quest_type?.name.fr, template.game_version?.name);
  console.log(`${template.monster_count} monsters in ${template.step_count} steps`);
}
```

Una plantilla se designa por su identificador, o por lo que es:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

const template = await metamob.questTemplates.get(ochreOnTouch);
template.step_count;
```

La API no tiene un punto de acceso para una plantilla sin sus monstruos: `get()` la busca en la lista.

## Los monstruos de una plantilla

`questTemplates.monsters()` es una [lista](/basics/lists/) de lo que pide la misión, cada monstruo con su etapa, 200 por página como máximo:

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

// Una etapa.
const step4 = await metamob.questTemplates.monsters(ochreOnTouch, { step: 4 }).all();

// Toda la misión, en orden.
for await (const monster of metamob.questTemplates.monsters(ochreOnTouch)) {
  console.log(monster.step, monster.name.fr);
}
```

Cada página también contiene la plantilla a la que pertenecen los monstruos, en `page.template`.

Las misiones de los jugadores apuntan a su plantilla: `quest.quest_template` contiene su identificador, su tipo de misión y sus números de monstruos y de etapas.

## Límites y errores

- `NOT_FOUND` para un identificador que no existe.
- `UNKNOWN_NAME`, con sugerencias, para un nombre que no conocen ni el paquete ni la API.
- Ninguna plantilla para un tipo de misión en una versión del juego: también `UNKNOWN_NAME`. El Dokille no existe en todas las versiones.

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
