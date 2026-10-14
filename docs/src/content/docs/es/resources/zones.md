---
title: Zonas
description: El mundo del juego se divide en zonas y subzonas. Léelas, búscalas por nombre y lista los monstruos que viven en una subzona.
sidebar:
  order: 5
---

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

console.log(monsters.map((monster) => monster.name.fr));
```

## Zonas

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // 3 caracteres como mínimo

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

Una zona es un nombre, un identificador o un objeto, ver [Nombres e identificadores](/basics/names-and-ids/). Los nombres funcionan en francés, inglés y español: `"Sufokia Bay"` es `"Baie de Sufokia"`.

## Subzonas

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

La API accede a una subzona a través de su zona. Tú no tienes que hacerlo: la biblioteca sabe en qué zona está cada subzona del paquete.

Para una subzona añadida al juego después de la publicación del paquete, indica también la zona:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Monstruos de una subzona

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

La respuesta es un simple array: una subzona tiene solo unos pocos monstruos.

Para ir en el otro sentido, de un monstruo a sus zonas, consulta [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Recorrer una zona

Pasa los objetos en lugar de sus identificadores:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Eso supone una solicitud por subzona. El mismo recorrido no cuesta nada con [los datos del paquete](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  console.log(`${subzone.name.fr}: ${data.monstersInSubzone(subzone).length}`);
}
```

## Tu progreso en una zona

Hasta dónde ha llegado una de tus misiones en cada zona es otra llamada, [`quests.zones()`](/resources/quests/#progress-by-zone).

## Límites y errores

- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT`.
- Un nombre que no está en el paquete y que la API tampoco conoce lanza `UNKNOWN_NAME`, con sugerencias.
- Una subzona que el paquete no conoce, indicada sin su zona, lanza `UNKNOWN_NAME` y pide que pases `{ zone }`.
- Las respuestas se guardan en [caché](/basics/caching/) durante 10 minutos por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `zones.list({ query }, options?)` | `Zone[]` |
| `zones.get(zone, options?)` | `ZoneDetail`, la zona con sus `subzones` |
| `zones.subzones(zone, { query }, options?)` | `SubzoneRef[]` |
| `zones.subzone(subzone, { zone }?, options?)` | `Subzone`, la subzona con su `zone` |
| `zones.monsters(subzone, { zone }?, options?)` | `Monster[]` |

Una zona y una subzona tienen ambas un `id` y un `name` en tres idiomas.

## Ver también

- [Monstruos](/resources/monsters/)
- [Tus misiones](/resources/quests/)
- [Los datos del paquete](/basics/embedded-data/)
- [Nombres e identificadores](/basics/names-and-ids/)
