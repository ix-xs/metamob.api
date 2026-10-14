---
title: Entornos de ejecución
description: "La biblioteca necesita fetch y nada más. Funciona en Node.js 20 y posteriores, Bun, Deno, las plataformas edge y los navegadores, como módulo ES o como CommonJS."
---

```ts
import { Metamob } from "@ix-xs/metamob.api"; // módulos ES
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

## Lo que necesita

`fetch`, `AbortController` y `URL`, que todos los entornos de ejecución actuales tienen. No se instala ninguna dependencia con el paquete, y nada en él es específico de Node.js.

| Entorno | Funciona | Notas |
| --- | --- | --- |
| Node.js 20 y posteriores | Sí | Módulos ES y CommonJS |
| Bun | Sí | |
| Deno | Sí | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Sí | Ver la nota sobre el estado más abajo |
| Navegadores | Sí | Ver la nota sobre las claves más abajo |

## La clave API

Cuando no pasas `apiKey`, el cliente lee la variable de entorno `METAMOB_API_KEY`, allí donde el entorno de ejecución tiene una. En los demás casos, pasa la clave.

```ts
// Cloudflare Workers: la clave es un secreto del worker.
export default {
  async fetch(request: Request, env: { METAMOB_API_KEY: string }) {
    const metamob = new Metamob({ apiKey: env.METAMOB_API_KEY });
    const servers = await metamob.servers.list();
    return Response.json(servers);
  },
};
```

## Navegadores

Todo funciona en una página, pero una clave en una página puede leerla cualquiera que la abra. Dos casos no plantean problema:

- Una herramienta que cada jugador usa con su propia clave, que escribe él mismo y que se queda en su dispositivo.
- [`data`](/basics/embedded-data/) por sí solo, que no necesita clave: búsqueda, autocompletado, «dónde vive este monstruo».

Para todo lo demás, llama a la API desde tu servidor.

Que el navegador pueda llamar a la API desde tu dominio depende de la política CORS de metamob.fr. Si una llamada falla en una página y funciona en un servidor, ese es el motivo: pasa por tu servidor.

## El estado en las plataformas serverless

El limitador y la caché viven en el cliente, en memoria. En una plataforma que arranca una instancia nueva por solicitud, cada instancia empieza a contar desde cero.

- Crea el cliente fuera del manejador, para que las instancias que siguen en marcha lo reutilicen.
- Da a la caché un almacén que sobreviva a la instancia, ver [Caché](/basics/caching/#a-cache-that-outlives-the-process).
- Mantén las ráfagas pequeñas. Cuando varias instancias comparten una clave, la API puede responder 429 igualmente: el cliente espera el tiempo que pide y reintenta.

## Tamaño del bundle

El paquete es un archivo por sistema de módulos, de unos 160 kB antes de la compresión. Más de la mitad son los datos de referencia. Con un empaquetador, importar solo `data` deja fuera el cliente, e importar solo `Metamob` conserva los datos, que el cliente usa para resolver los nombres.

## Tipos

Las declaraciones vienen con el paquete, para módulos ES y para CommonJS. Se resuelven con cualquier valor de `moduleResolution` de TypeScript. Se recomienda TypeScript 5 o posterior.

Los nombres de los monstruos son tipos unión grandes. Solo sirven para el autocompletado: si tu editor va lento en una máquina muy antigua, anotar una variable como `string` los evita.

## Probar tu código

Da al cliente un `fetch` propio para probar sin red.

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () => Response.json({ data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14T09:12:45Z" } }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```

## Ver también

- [Configuración](/basics/configuration/)
- [Los datos del paquete](/basics/embedded-data/)
- [Tu clave API](/start/api-key/)
- [Solución de problemas](/help/troubleshooting/)
