---
title: Los datos del paquete
description: "Los monstruos, las zonas, las subzonas, los servidores y las plantillas de misión vienen con el paquete. El objeto data los lee desde la memoria, sin solicitud ni clave API, que es lo que necesita un autocompletado o un comando de consulta."
sidebar:
  order: 6
---

```ts
import { data } from "@ix-xs/metamob.api";

const monster = data.monster("tofu malefique");

monster?.name.fr; // "Tofu Maléfique"
monster?.level_max; // 200
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Lo que contiene

Una copia de los datos de referencia de la API, tomada cuando se publicó el paquete: cada monstruo, zona, subzona, servidor, versión del juego, tipo de monstruo, tipo de misión y plantilla de misión, con qué monstruos viven en qué subzona y qué monstruos pide cada plantilla de misión.

`data.fetchedAt` es el día en que se tomó la copia. Los registros tienen la forma que les da la API, así que lo que lees de `data` y lo que obtienes de una llamada son intercambiables.

El cliente también lo tiene: `metamob.data` es el mismo objeto.

## Encontrar un registro

Cada tipo tiene un método que recibe un identificador, un nombre o un objeto con un identificador, y devuelve el registro o `undefined`. Ninguno lanza un error.

```ts
data.monster("Bouftou Royal"); // por nombre, en cualquiera de los tres idiomas
data.monster(305); // por identificador
data.zone("Amakna")?.subzones.length;
data.subzone("Coin des Bouftous")?.zone.name.fr;
data.server("Draconiros")?.game_version?.name; // "Dofus (Unity)"
data.monsterType("archmonster")?.id; // 3
data.questType("dokille")?.name.en;
data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.monster_count;
```

## Buscar monstruos

`searchMonsters` encuentra los monstruos cuyo nombre contiene un texto, en cualquier idioma, con los nombres que empiezan por él en primer lugar. Es lo bastante rápido para ejecutarse en cada pulsación de tecla.

```ts
data.searchMonsters("bouf"); // 25 como máximo por defecto
data.searchMonsters("bouf", { type: "archimonstre", limit: 10 });
data.searchMonsters("gob", { gameVersion: "Dofus Touch" });
```

Para un texto que no coincide con nada, `suggest` da los nombres más parecidos:

```ts
data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.suggest("server", "Draconirros"); // ["Draconiros"]
data.suggest("zone", "Amakna", 5); // hasta 5 nombres
```

## Seguir los enlaces

```ts
// Dónde vive un monstruo.
data.subzonesOf("Tofu Maléfique").map((subzone) => `${subzone.zone.name.fr} > ${subzone.name.fr}`);
data.zonesOf("Tofu Maléfique");

// Lo que vive en un lugar.
data.monstersInSubzone("Coin des Bouftous");
data.monstersInZone("Amakna");

// Un monstruo y su archimonstruo.
data.archmonstersOf("Tofu"); // los archimonstruos que lo tienen como referencia
data.monster("Tofuldebeu l'Explosif")?.reference?.name.fr; // "Tofu"
```

## Plantillas de misión

Una plantilla de misión es lo que pide un tipo de misión en una versión del juego: la misión del Dofus Ocre en Dofus Touch, por ejemplo.

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

Son arrays de solo lectura, construidos una vez en el primer uso. El conjunto de datos entero se descodifica la primera vez que se lee algo, lo que lleva unos milisegundos.

## Cuando el juego cambia

Un monstruo, una zona o un servidor nuevos llegan al paquete con su siguiente versión. Mientras tanto, nada se rompe:

- Una llamada que recibe un nombre que el paquete no conoce pregunta a la API antes de rendirse, ver [Nombres e identificadores](/basics/names-and-ids/#when-a-name-is-unknown).
- Un identificador siempre funciona, conocido o no.
- `data` solo conoce lo que traía al publicarse: `data.monster("a brand new monster")` es `undefined` hasta que actualices el paquete.

Para leer lo que dice la API ahora mismo, usa las llamadas: [`metamob.monsters`](/resources/monsters/), [`metamob.zones`](/resources/zones/) y las [listas de referencia](/resources/reference-data/).

## En un navegador

`data` no necesita ni clave ni red, así que funciona en una página. Importar solo `data` deja el cliente fuera de tu bundle; el conjunto de datos pesa unos 30 kB una vez comprimido. El cuadro de búsqueda de la página de inicio de este sitio es exactamente eso.

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
| `fetchedAt` | `string`, con el formato `YYYY-MM-DD` |

## Ver también

- [Nombres e identificadores](/basics/names-and-ids/)
- [Monstruos](/resources/monsters/)
- [Un comando de Discord con autocompletado](/recipes/discord-command/)
- [Caché](/basics/caching/)
