---
title: Configuración
description: "Las opciones del cliente y de una llamada, con sus valores por defecto."
sidebar:
  order: 8
---

Todas las opciones son opcionales. Los valores por defecto sirven tanto para un script como para un bot:

```ts
const metamob = new Metamob({
  apiKey: process.env.METAMOB_API_KEY,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h" },
  rateLimit: { requests: 50 },
});
```

## El cliente

La clave sola también se puede pasar como cadena:

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Crea un solo cliente y consérvalo: es él quien lleva la cuenta de las solicitudes y la caché. Dos clientes para la misma clave cuentan por separado, y entre los dos pueden superar el límite.

## Una sola llamada

Cada método toma primero sus propios argumentos, y luego un objeto de opciones solo para esa llamada:

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Cuando un método tiene filtros, van antes de las opciones: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Escuchar al cliente

El cliente emite un evento en cada etapa de una llamada. `on` devuelve una función que detiene la escucha:

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Evento | Cuándo | Contenido |
| --- | --- | --- |
| `request` | Sale una solicitud | `method`, `verb`, `url`, `attempt` |
| `response` | Ha llegado una respuesta, o viene de la caché | `method`, `status`, `duration`, `cached` |
| `retry` | Una solicitud se va a reintentar | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | Una llamada ha esperado su turno | `method`, `delay` |
| `error` | Un oyente o un almacenamiento de caché ha lanzado un error | el error |

Una URL en un evento nunca contiene la clave.

## Duraciones

En cualquier sitio donde se espera una duración, escribe un número de milisegundos o una cadena con una unidad: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Otro fetch, otro host

`fetch` sustituye al fetch global: para pasar por un proxy, para observar las solicitudes en pruebas, o en un entorno que no lo tiene.

```ts
const calls: string[] = [];

const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  fetch: async (input, init) => {
    calls.push(String(input));
    return fetch(input, init);
  },
});
```

`baseUrl` dirige el cliente hacia otro host. La clave se envía a ese host: usa solo uno en el que confíes.

## Referencia

Opciones del cliente:

| Opción | Por defecto | Significado |
| --- | --- | --- |
| `apiKey` | `METAMOB_API_KEY` | La clave del cliente |
| `timeout` | `"30s"` | Tiempo concedido a un intento |
| `retry` | 3 reintentos | `{ attempts, delay, maxDelay }`, o `false`. Consulta [Errores](/basics/errors/#what-is-retried) |
| `cache` | activa, `"10m"` | `{ ttl, methods, max, store }`, o `false`. Consulta [Caché](/basics/caching/) |
| `rateLimit` | activo, 60 por minuto | `{ requests, per }`, o `false`. Consulta [El límite de solicitudes](/basics/rate-limit/) |
| `fetch` | el `fetch` global | Un `fetch` que usar en su lugar |
| `baseUrl` | `https://www.metamob.fr/api/v1` | Dónde está la API |
| `headers` | ninguno | Cabeceras añadidas a cada solicitud |

Opciones de una llamada:

| Opción | Significado |
| --- | --- |
| `apiKey` | La clave para esta llamada. Consulta [Actuar por otros jugadores](/basics/many-keys/) |
| `signal` | Un `AbortSignal` que cancela la llamada |
| `timeout` | Tiempo concedido a un intento de esta llamada |
| `retry` | Política de reintentos de esta llamada, o `false` |
| `cache` | Tiempo de frescura de esta respuesta, o `false` para ignorar la caché |
| `headers` | Cabeceras añadidas a esta solicitud |

Miembros del cliente:

| Miembro | Significado |
| --- | --- |
| `me()` | La cuenta de la clave |
| `quests`, `monsters`, `zones`, `users`, `conversations`, `tradeProposals`, `kralove` | Las partes de la API |
| `gameVersions`, `servers`, `monsterTypes`, `questTypes`, `questTemplates` | Las listas de referencia |
| `data` | [Los datos del paquete](/basics/embedded-data/) |
| `withKey(apiKey)` | Un cliente para otra clave |
| `rateLimit` | En qué punto está la clave respecto al límite |
| `on`, `once`, `off` | Eventos |
| `clearCache()` | Vacía la caché |
