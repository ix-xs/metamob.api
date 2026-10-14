---
title: Caché
description: "Los monstruos, las zonas y los servidores solo cambian cuando cambia el juego, así que sus respuestas se guardan diez minutos. Todo lo ligado a una cuenta se pide cada vez, salvo que indiques otra cosa. Esta página muestra cómo ajustar ambas cosas."
sidebar:
  order: 5
---

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h", // datos de referencia
    methods: { "users.get": "30s", "kralove.list": "1m" }, // y lo que tú elijas
  },
});
```

## Lo que se guarda en caché por defecto

Los datos de referencia: versiones del juego, servidores, tipos de monstruo, tipos de misión, plantillas de misión, monstruos, zonas y subzonas. Una respuesta se guarda 10 minutos, en memoria, y se comparte entre todas las claves: es la misma para todos.

Nada más. Los perfiles, las misiones, las coincidencias, las conversaciones y los eventos Kralamar se leen de la API en cada llamada, porque cambian cada vez que alguien juega.

Dos lecturas idénticas enviadas en el mismo momento siempre comparten una sola solicitud, con caché o sin ella.

## Guardar más en caché

`methods` da una frescura a cualquier método, por su nombre en [Todos los métodos](/reference/methods/).

```ts
const metamob = new Metamob({
  cache: {
    methods: {
      "users.get": "1m", // una página de perfil con muchas visitas
      "quests.matches": "5m", // las coincidencias no cambian de un segundo a otro
      "monsters.get": "1d", // todavía más tiempo para los datos de referencia
      "zones.list": false, // este, nunca en caché
    },
  },
});
```

Lo que depende de la cuenta se guarda aparte para cada clave: dos jugadores nunca ven las respuestas del otro. Las entradas de una clave se eliminan en cuanto esa clave modifica una misión, así que una lectura después de una escritura siempre es reciente.

## Para una llamada

```ts
// Sin caché para esta llamada.
const fresh = await metamob.servers.list({ cache: false });

// Guarda esta respuesta cinco minutos, diga lo que diga el cliente.
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

El almacén por defecto vive en memoria y contiene 500 entradas. Las menos usadas recientemente salen primero. Un almacén es un `get` y un `set`, que pueden ser asíncronos, más un `delete` y un `clear` opcionales: conecta Redis, un archivo o el KV de una plataforma edge.

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

Una clave del almacén nunca contiene una clave API: las entradas ligadas a una cuenta se guardan bajo un hash de ella. Un almacén que falla no hace fallar la llamada: la solicitud se envía como si no hubiera caché, y el fallo se emite como un evento `error`.

## Caché o datos del paquete

Para los datos de referencia hay algo más rápido que una caché: [los datos del paquete](/basics/embedded-data/), que no necesitan ninguna solicitud. Usa la API cuando necesites lo que el paquete no contiene, como las zonas de un monstruo tal como la API las da hoy, o cuando el juego acaba de cambiar.

## Duraciones

Allí donde se espera una duración, escribe un número de milisegundos o una cadena con una unidad: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Referencia

| Opción | Por defecto | Significado |
| --- | --- | --- |
| `cache` | activada | `false` la desactiva |
| `cache.ttl` | `"10m"` | Frescura de los datos de referencia |
| `cache.methods` | ninguno | Frescura por método, o `false` |
| `cache.max` | `500` | Entradas que contiene el almacén en memoria |
| `cache.store` | memoria | Tu propio `CacheStore` |
| `{ cache }` en una llamada | | Una duración, o `false` |

## Ver también

- [El límite de solicitudes](/basics/rate-limit/)
- [Los datos del paquete](/basics/embedded-data/)
- [Configuración](/basics/configuration/)
- [Todos los métodos](/reference/methods/)
