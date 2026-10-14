---
title: Configuración
description: "Todas las opciones del cliente y de una llamada, con su valor por defecto. Lo único obligatorio es una clave API, y los valores por defecto sirven tanto para un script como para un bot."
sidebar:
  order: 8
---

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

Todas las opciones son opcionales. La clave sola se puede pasar como cadena.

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Crea un cliente y consérvalo: el limitador y la caché viven en él. Dos clientes para la misma clave cuentan sus solicitudes por separado y pueden superar el límite entre los dos.

## Una llamada

Cada método recibe primero sus propios argumentos, y luego un objeto de opciones solo para esa llamada.

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Cuando un método tiene filtros, van antes de las opciones: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Escuchar al cliente

El cliente emite lo que hace. `on` devuelve una función que deja de escuchar.

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Evento | Cuándo | Datos |
| --- | --- | --- |
| `request` | Sale una solicitud | `method`, `verb`, `url`, `attempt` |
| `response` | Llegó una respuesta, o vino de la caché | `method`, `status`, `duration`, `cached` |
| `retry` | Una solicitud se va a reintentar | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | Una llamada esperó su turno | `method`, `delay` |
| `error` | Un oyente o un almacén de caché lanzó un error | el error |

Una URL en un evento nunca contiene la clave.

## Duraciones

Allí donde se espera una duración, escribe un número de milisegundos o una cadena con una unidad: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Otro fetch, otro host

`fetch` sustituye al global: para pasar por un proxy, para registrar las solicitudes en las pruebas, o en un entorno de ejecución que no tiene ninguno.

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

`baseUrl` dirige el cliente a otro host. La clave se envía a ese host: usa solo uno en el que confíes.

## Referencia

Opciones del cliente:

| Opción | Por defecto | Significado |
| --- | --- | --- |
| `apiKey` | `METAMOB_API_KEY` | La clave del cliente |
| `timeout` | `"30s"` | Tiempo concedido a un intento |
| `retry` | 3 reintentos | `{ attempts, delay, maxDelay }`, o `false`. Consulta [Errores](/basics/errors/#what-is-retried) |
| `cache` | activada, `"10m"` | `{ ttl, methods, max, store }`, o `false`. Consulta [Caché](/basics/caching/) |
| `rateLimit` | activado, 60 por minuto | `{ requests, per }`, o `false`. Consulta [El límite de solicitudes](/basics/rate-limit/) |
| `fetch` | el `fetch` global | Un `fetch` que se usa en su lugar |
| `baseUrl` | `https://www.metamob.fr/api/v1` | Dónde está la API |
| `headers` | ninguno | Encabezados añadidos a cada solicitud |

Opciones de una llamada:

| Opción | Significado |
| --- | --- |
| `apiKey` | La clave para esta llamada. Consulta [Actuar por otros jugadores](/basics/many-keys/) |
| `signal` | Un `AbortSignal` que cancela la llamada |
| `timeout` | Tiempo concedido a un intento de esta llamada |
| `retry` | Política de reintentos de esta llamada, o `false` |
| `cache` | Frescura de esta respuesta, o `false` para no usar la caché |
| `headers` | Encabezados añadidos a esta solicitud |

Miembros del cliente:

| Miembro | Significado |
| --- | --- |
| `me()` | La cuenta de la clave |
| `quests`, `monsters`, `zones`, `users`, `conversations`, `kralove` | Los recursos |
| `gameVersions`, `servers`, `monsterTypes`, `questTypes`, `questTemplates` | Las listas de referencia |
| `data` | [Los datos del paquete](/basics/embedded-data/) |
| `withKey(apiKey)` | Un cliente para otra clave |
| `rateLimit` | En qué punto está la clave respecto al límite |
| `on`, `once`, `off` | Eventos |
| `clearCache()` | Vacía la caché |

## Ver también

- [Errores](/basics/errors/)
- [Caché](/basics/caching/)
- [El límite de solicitudes](/basics/rate-limit/)
- [Entornos de ejecución](/reference/runtimes/)
