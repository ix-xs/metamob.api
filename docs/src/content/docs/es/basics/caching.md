---
title: Caché
description: "Lo que se guarda en caché, durante cuánto tiempo, y cómo ajustarlo."
sidebar:
  order: 5
---

## Lo que se guarda en caché por defecto

Solo los datos de referencia: versiones del juego, servidores, tipos de monstruo, tipos de misión, plantillas de misión, monstruos, zonas y subzonas. Solo cambian con el juego. Una respuesta se guarda 10 minutos en memoria, y la comparten todas las claves, ya que es la misma para todo el mundo.

El resto (perfiles, misiones, coincidencias, conversaciones, propuestas, eventos Kralamar) se lee de la API en cada llamada.

Dos lecturas idénticas enviadas al mismo tiempo comparten siempre una sola solicitud, con o sin caché.

## Guardar más en caché

`ttl` cambia la duración de los datos de referencia, y `methods` da una duración a cualquier método, por su nombre tal como figura en [Todos los métodos](/resources/methods/):

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h",
    methods: {
      "users.get": "1m",
      "quests.matches": "5m",
      "monsters.get": "1d",
      "zones.list": false, // nunca en caché
    },
  },
});
```

Lo que depende de la cuenta se guarda aparte para cada clave: un jugador nunca ve las respuestas de otro. Las entradas de una clave se olvidan en cuanto esa clave escribe algo, para que una lectura después de una escritura esté al día.

## Para una sola llamada

```ts
// Ignorar la caché en esta llamada.
const fresh = await metamob.servers.list({ cache: false });

// Guardar esta respuesta cinco minutos, diga lo que diga el cliente.
const profile = await metamob.users.get(username, { cache: "5m" });
```

## Vaciarla

```ts
await metamob.clearCache();
```

## Desactivarla

```ts
const metamob = new Metamob({ cache: false });
```

## Una caché que sobrevive al proceso

Por defecto, la caché vive en memoria y guarda 500 entradas. Para compartirla entre varios procesos, dale un almacenamiento: un objeto con `get` y `set`, que pueden ser asíncronos, y opcionalmente `delete` y `clear`. Por ejemplo, con Redis:

```ts
import type { CacheEntry, CacheStore } from "@ix-xs/metamob.api";

const store: CacheStore = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : undefined;
  },
  async set(key, entry) {
    const seconds = Math.ceil((entry.expires - Date.now()) / 1000);
    if (seconds > 0) await redis.set(key, JSON.stringify(entry), "EX", seconds);
  },
  async delete(key) {
    await redis.del(key);
  },
};

const metamob = new Metamob({ cache: { store } });
```

Las claves del almacenamiento nunca contienen una clave API, solo una huella. Si el almacenamiento falla, la llamada sigue sin caché y el fallo se emite como evento `error`.

## Caché o datos incluidos

Los datos de referencia también vienen incluidos en el paquete: [`data`](/basics/embedded-data/) los lee sin solicitud. Pasa por la API cuando quieras los datos del día, por ejemplo justo después de una actualización del juego.

## Duraciones

En cualquier sitio donde se espera una duración, escribe un número de milisegundos o una cadena con una unidad: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`MemoryCache`](/reference/memory-cache/) | Almacenamiento en memoria que descarta la entrada usada hace más tiempo una vez lleno. |
| [`CacheEntry`](/reference/cache-entry/) | Lo que el cliente guarda para una respuesta en caché. |
| [`CacheOptions`](/reference/cache-options/) | Ajustes de la caché del cliente. |
| [`CacheStore`](/reference/cache-store/) | Dónde viven las respuestas en caché. |
| [`Duration`](/reference/duration/) | Una duración: milisegundos como número, o una cadena corta como `"30s"`, `"5m"`, `"2h"` o `"1d"`. |
<!-- exports:end -->
