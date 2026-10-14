---
title: El límite de solicitudes
description: "Metamob permite 60 solicitudes por minuto por clave API. El cliente las cuenta y hace que la siguiente llamada espere su turno, así que un bucle largo va más despacio en lugar de fallar. Esta página muestra cómo vigilar el límite, ajustarlo y gastar menos solicitudes."
sidebar:
  order: 4
---

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Lo que permite la API

60 solicitudes por minuto, contadas por clave API. Más allá, la API responde 429 con un encabezado `Retry-After`.

Metamob es un servicio gratuito que mantiene una sola persona. El límite es lo que lo mantiene disponible para todos: quédate por debajo y no busques formas de esquivarlo.

## Lo que hace el cliente

El limitador está activado por defecto. Guarda, para cada clave, la hora de las solicitudes enviadas en el último minuto. Cuando se han enviado 60, la siguiente llamada espera hasta que la más antigua tenga un minuto, y entonces sale. Las llamadas conservan su orden.

Nada falla y nada se pierde: un bucle de 300 solicitudes tarda unos cuatro minutos en lugar de lanzar un error después de la número 60.

Si aun así llega un 429, por ejemplo porque otro programa usa la misma clave, el cliente retiene todas las llamadas de esa clave durante el tiempo que pide la API, y luego reintenta. Consulta [qué se reintenta](/basics/errors/#what-is-retried).

## Vigilarlo

`metamob.rateLimit` indica en qué punto está la clave del cliente, según el recuento de este cliente: no sabe nada de las solicitudes hechas en otro lugar con la misma clave.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

El evento `rateLimit` se emite cada vez que una llamada tuvo que esperar, con la duración de la espera.

## Gastar menos solicitudes

El límite cuenta solicitudes, no elementos. La mayor parte del ahorro ya está hecha por ti:

- Recorrer una lista usa la página más grande que acepta la API, ver [Listas](/basics/lists/).
- `count()` y `first()` piden un elemento en lugar de una página.
- Los datos de referencia se [guardan en caché](/basics/caching/), y dos llamadas idénticas en curso comparten una sola solicitud.
- Los nombres se resuelven con [los datos del paquete](/basics/embedded-data/), sin ninguna solicitud.
- `quests.setMonsters()` escribe hasta 200 monstruos en una solicitud, donde `setMonster()` en un bucle enviaría 200.

Lo que queda en tus manos:

```ts
import { data } from "@ix-xs/metamob.api";

// Leer datos de referencia: pregunta al paquete, no a la API.
const monster = data.monster("Tofu Maléfique"); // ninguna solicitud
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 solicitud, con las zonas

// Muchas cantidades: un lote, no un bucle.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## Ajustarlo

```ts
// Quédate muy por debajo del límite, para dejar sitio a otro programa con la misma clave.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Desactivado. Una ráfaga recibe entonces errores 429, que se reintentan tras la espera que pide la API.
const unlimited = new Metamob({ rateLimit: false });
```

Subir `requests` por encima de 60 no sube lo que permite la API: solo traslada la espera del cliente a las respuestas 429.

## Varias claves

Cada clave tiene su propia ventana. Un cliente creado con [`withKey()`](/basics/many-keys/) comparte el limitador del cliente del que procede, que mantiene una ventana por clave. Así, un bot que sirve a diez jugadores nunca mezcla sus recuentos.

## Cancelar una espera

Una llamada que espera su turno se puede cancelar con un `signal`. Lanza un error con el código `ABORTED` y libera su sitio.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

## Referencia

| Opción | Por defecto | Significado |
| --- | --- | --- |
| `rateLimit` | activado | `false` desactiva el limitador |
| `rateLimit.requests` | `60` | Solicitudes permitidas por ventana, por clave |
| `rateLimit.per` | `"1m"` | Duración de la ventana |

| `metamob.rateLimit` | Significado |
| --- | --- |
| `limit` | Solicitudes permitidas por ventana |
| `remaining` | Solicitudes que quedan en la ventana actual |
| `resetsIn` | Milisegundos hasta que vuelva a haber una solicitud libre, 0 cuando ya hay una |

## Ver también

- [Caché](/basics/caching/)
- [Errores](/basics/errors/)
- [Actuar por otros jugadores](/basics/many-keys/)
- [Listas](/basics/lists/)
