---
title: Zonas
description: "Leer las zonas y las subzonas del juego, y los monstruos que viven en una subzona."
sidebar:
  order: 5
---

El mundo del juego está dividido en zonas, que a su vez se dividen en subzonas.

## Zonas

`zones.list()` lista las zonas, y `zones.get()` lee una con sus subzonas:

```ts
const zones = await metamob.zones.list();
const found = await metamob.zones.list({ query: "ama" }); // 3 caracteres como mínimo

const amakna = await metamob.zones.get("Amakna");
amakna.subzones.map((subzone) => subzone.name.fr);
```

Una zona es un nombre, un identificador o un objeto, consulta [Nombres e identificadores](/basics/names-and-ids/). Los nombres funcionan en francés, en inglés y en español: `"Sufokia Bay"` designa `"Baie de Sufokia"`.

## Subzonas

```ts
const subzones = await metamob.zones.subzones("Amakna");
const searched = await metamob.zones.subzones("Amakna", { query: "bouf" });

const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

La API lee una subzona a través de su zona. Para las subzonas del paquete, la biblioteca encuentra la zona por sí misma.

Para una subzona añadida al juego después de la publicación del paquete, da también la zona:

```ts
await metamob.zones.subzone("Coin des Bouftous", { zone: "Amakna" });
```

## Los monstruos de una subzona

`zones.monsters()` devuelve los monstruos de una subzona, en un solo array:

```ts
const monsters = await metamob.zones.monsters("Coin des Bouftous");

const archmonsters = monsters.filter((monster) => monster.type?.id === 3);
console.log(archmonsters.map((monster) => monster.name.fr));
```

En el otro sentido, de un monstruo a sus zonas, consulta [`monsters.get()`](/resources/monsters/#reading-one-monster).

## Recorrer una zona

Los objetos devueltos se pueden pasar tal cual a las llamadas siguientes:

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const monsters = await metamob.zones.monsters(subzone, { zone });
  console.log(`${subzone.name.fr}: ${monsters.length}`);
}
```

Esto hace una solicitud por subzona. El mismo recorrido se hace sin solicitudes con [los datos del paquete](/basics/embedded-data/):

```ts
import { data } from "@ix-xs/metamob.api";

for (const subzone of data.zone("Amakna")?.subzones ?? []) {
  const count = data.monstersInSubzone(subzone).length;
  console.log(`${subzone.name.fr}: ${count}`);
}
```

## Tu progreso en una zona

El avance de una de tus misiones zona por zona se lee con [`quests.zones()`](/resources/quests/#progress-by-zone).

## Límites y errores

- Una búsqueda de menos de 3 caracteres lanza `INVALID_ARGUMENT`.
- Un nombre que no está en el paquete ni lo conoce la API lanza `UNKNOWN_NAME`, con sugerencias.
- Una subzona que el paquete no conoce, dada sin su zona, lanza `UNKNOWN_NAME` y pide pasar `{ zone }`.
- Las respuestas se [guardan en caché](/basics/caching/) durante 10 minutos por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `zones.list({ query }, options?)` | `Zone[]` |
| `zones.get(zone, options?)` | `ZoneDetail`, la zona con sus `subzones` |
| `zones.subzones(zone, { query }, options?)` | `SubzoneRef[]` |
| `zones.subzone(subzone, { zone }?, options?)` | `Subzone`, la subzona con su `zone` |
| `zones.monsters(subzone, { zone }?, options?)` | `Monster[]` |

Una zona y una subzona tienen las dos un `id` y un `name` en tres idiomas.
