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

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`Metamob`](/reference/metamob/) | El cliente de la API de Metamob. |
| [`VERSION`](/reference/version/) | Versión del paquete. |
| [`ClientEvents`](/reference/client-events/) | Eventos emitidos por el cliente, consulta `metamob.on()`. |
| [`MetamobOptions`](/reference/metamob-options/) | Opciones del cliente [`Metamob`](/reference/metamob/). |
| [`RequestOptions`](/reference/request-options/) | Opciones aceptadas como último argumento de cada llamada a la API. |
| [`RetryOptions`](/reference/retry-options/) | Política de reintentos. |
<!-- exports:end -->
