---
title: Los datos del paquete
description: "Los monstruos, las zonas, los servidores y las plantillas de misión vienen incluidos en el paquete. data los lee en memoria, sin solicitud ni clave API."
sidebar:
  order: 6
---

El paquete contiene una copia de los datos de referencia de la API. El objeto `data` los consulta directamente, lo que sirve para un autocompletado o para un comando de búsqueda:

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Lo que contiene

Los datos de referencia de la API en el momento de la publicación del paquete: monstruos, zonas, subzonas, servidores, versiones del juego, tipos de monstruo, tipos y plantillas de misión. Con los vínculos entre ellos: los monstruos de cada subzona, y los que pide cada plantilla de misión.

`data.fetchedAt` es la fecha de la copia. Los registros tienen la forma que les da la API: lo que lees en `data` tiene la misma forma que la respuesta de una llamada.

El cliente también lo tiene: `metamob.data` es el mismo objeto.

## Encontrar un registro

Cada tipo tiene un método que toma un identificador, un nombre o un objeto con un identificador, y devuelve el registro o `undefined`. Nada lanza errores.

```ts
data.monster("Bouftou Royal"); // por nombre, en uno de los tres idiomas
data.monster(305); // por identificador
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Buscar monstruos

`searchMonsters` encuentra los monstruos cuyo nombre contiene un texto, en uno de los tres idiomas, empezando por los nombres que empiezan por ese texto. Es lo bastante rápido para ejecutarse en cada pulsación de tecla.

```ts
data.searchMonsters("bouf"); // 25 como máximo por defecto
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

Para un texto que no corresponde a nada, `suggest` da los nombres más parecidos:

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // hasta 5 nombres
```

## Seguir los vínculos

```ts
// Dónde vive un monstruo.
data.zonesOf("Tofu Maléfique");
data.subzonesOf("Tofu Maléfique").map((subzone) => subzone.name.fr);

// Lo que vive en un sitio.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// Un monstruo y su archimonstruo.
data.archmonstersOf("Tofu"); // los archimonstruos que lo tienen como referencia
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Las plantillas de misión

Una plantilla de misión es lo que un tipo de misión pide en una versión del juego: la misión Ocre en Dofus Touch, por ejemplo.

```ts
const ochreOnTouch = { questType: "ocre", gameVersion: "Dofus Touch" } as const;

data.templateMonsters(ochreOnTouch).length; // todos los monstruos de la misión, en orden
data.templateMonsters(ochreOnTouch, { step: 4 }); // los de la etapa 4
data.stepOf("Tofu Maléfique", ochreOnTouch); // la etapa a la que pertenece este monstruo
data.templatesOf("Tofu Maléfique"); // las plantillas de misión que lo piden
```

## Las listas simples

```ts
data.monsters; // todos los monstruos
data.zones; // todas las zonas, cada una con sus subzonas
data.subzones; // todas las subzonas, cada una con su zona
data.servers;
data.gameVersions;
data.monsterTypes;
data.questTypes;
data.questTemplates;
```

Son arrays de solo lectura. Los datos se decodifican en la primera lectura, en unos milisegundos.

## Cuando el juego cambia

Un nuevo monstruo, una nueva zona o un nuevo servidor llega al paquete con su versión siguiente. Mientras tanto:

- una llamada que recibe un nombre desconocido para el paquete también lo busca en la API, consulta [Nombres e identificadores](/basics/names-and-ids/#when-a-name-is-unknown).
- un identificador siempre funciona, lo conozca el paquete o no;
- `data` solo conoce su copia: un monstruo más reciente vale `undefined` en él hasta la actualización del paquete.

Para leer lo que dice la API en este momento, usa las llamadas: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) y las [listas de referencia](/resources/reference-data/).

## En un navegador

`data` no necesita ni clave ni red: también funciona en una página web. Importar solo `data` deja el cliente fuera de tu bundle, y los datos pesan unos 30 kB comprimidos. La página [Probar](/start/playground/) funciona así.

## Referencia

| Miembro | Devuelve |
| --- | --- |
| `monster(ref, hint?)` | `Monster \| undefined` |
| `monstersNamed(name)` | `Monster[]`, más de uno para un nombre compartido |
| `searchMonsters(query, { type, gameVersion, template, limit })` | `Monster[]` |
| `zone(ref)`, `subzone(ref)` | `ZoneDetail \| undefined`, `Subzone \| undefined` |
| `server(ref)`, `gameVersion(ref)` | `Server \| undefined`, `GameVersion \| undefined` |
| `monsterType(ref)`, `questType(ref)` | `MonsterType \| undefined`, `QuestType \| undefined` |
| `questTemplate(ref)` | `QuestTemplate \| undefined` |
| `subzonesOf(monster)`, `zonesOf(monster)` | `Subzone[]`, `Zone[]` |
| `monstersInSubzone(subzone)`, `monstersInZone(zone)` | `Monster[]` |
| `archmonstersOf(monster)` | `Monster[]` |
| `templatesOf(monster)` | `QuestTemplate[]` |
| `templateMonsters(template, { step })` | `TemplateMonster[]` |
| `stepOf(monster, template)` | `number \| undefined` |
| `suggest(kind, text, limit?)` | `string[]` |
| `fetchedAt` | `string`, en formato `YYYY-MM-DD` |
