---
title: El límite de solicitudes
description: "Metamob acepta 60 solicitudes por minuto por clave. Cómo las cuenta el cliente, y cómo seguir y ajustar el límite."
sidebar:
  order: 4
---

## Lo que permite la API

60 solicitudes por minuto, contadas por clave API. Por encima, la API responde 429 con una cabecera `Retry-After`.

El límite mantiene el sitio disponible para todo el mundo: quédate por debajo, y no intentes eludirlo.

## Lo que hace el cliente

El cliente cuenta las solicitudes enviadas con cada clave durante el último minuto. Cuando han salido 60, la llamada siguiente espera a que la más antigua tenga un minuto, y luego sale. Las llamadas conservan su orden.

Un bucle de 300 solicitudes tarda, por tanto, unos cinco minutos, sin errores.

Si aun así llega un 429, por ejemplo porque otro programa usa la misma clave, el cliente espera el tiempo que pide la API, y vuelve a intentarlo. Consulta [lo que se reintenta](/basics/errors/#what-is-retried).

## Vigilarlo

`metamob.rateLimit` indica en qué punto está la clave del cliente, según la cuenta de ese cliente: no sabe nada de las solicitudes hechas en otro sitio con la misma clave.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

El evento `rateLimit` se emite cada vez que una llamada ha tenido que esperar, con la duración de la espera:

```ts
metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Gastar menos solicitudes

El límite cuenta las solicitudes, no los elementos. El cliente ya envía las menos posibles:

- Recorrer una lista usa la página más grande que acepta la API, consulta [Listas](/basics/lists/).
- `count()` y `first()` piden un elemento en lugar de una página.
- Los datos de referencia se [guardan en caché](/basics/caching/), y dos llamadas idénticas en curso comparten una sola solicitud.
- Los nombres se resuelven a partir de los [datos del paquete](/basics/embedded-data/), sin solicitud.
- `quests.setMonsters()` escribe hasta 200 monstruos en una solicitud.

Por tu parte:

```ts
import { data } from "@ix-xs/metamob.api";

// Leer datos de referencia: consulta el paquete, no la API.
const monster = data.monster("Tofu Maléfique"); // ninguna solicitud
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 solicitud, con las zonas

// Muchas cantidades: un lote, no un bucle.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## Ajustarlo

```ts
// Por debajo del límite, para dejar sitio a otro programa.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Desactivado: una ráfaga recibe 429, reintentados tras la espera pedida.
const unlimited = new Metamob({ rateLimit: false });
```

Subir `requests` por encima de 60 no aumenta lo que permite la API: solo traslada la espera del cliente a respuestas 429.

## Varias claves

Cada clave tiene su propia ventana. Un cliente creado con [`withKey()`](/basics/many-keys/) comparte el limitador del cliente del que viene, que cuenta cada clave por separado.

## Cancelar una espera

Una llamada que espera su turno se puede cancelar con un `signal`. Lanza un error con el código `ABORTED` y libera su sitio.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`RateLimitOptions`](/reference/rate-limit-options/) | Ajustes del limitador de solicitudes integrado. |
| [`RateLimitState`](/reference/rate-limit-state/) | En qué punto está una clave API respecto a su límite de solicitudes, según la cuenta de este cliente. |
<!-- exports:end -->
