---
title: Entornos de ejecución
description: "Node.js 20 o posterior, Bun, Deno, las plataformas edge y los navegadores, como módulo ES o en CommonJS."
---

## Lo que necesita

`fetch`, `AbortController` y `URL`, que proporcionan todos los entornos de ejecución actuales. El paquete no tiene dependencias, y nada en él es propio de Node.js. Se importa como módulo ES o en CommonJS:

```ts
import { Metamob } from "@ix-xs/metamob.api"; // módulos ES
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

| Entorno | Funciona | Observaciones |
| --- | --- | --- |
| Node.js 20 y versiones siguientes | Sí | Módulos ES y CommonJS |
| Bun | Sí | |
| Deno | Sí | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Sí | Consulta la observación sobre el estado más abajo |
| Navegadores | Sí | Consulta la observación sobre las claves más abajo |

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

Todo funciona en una página web, pero una clave en ella la puede leer cualquiera que abra la página. Dos casos no plantean problemas:

- Una herramienta que cada jugador usa con su propia clave, introducida y guardada en su dispositivo.
- [`data`](/basics/embedded-data/) solo, que no pide ninguna clave: búsqueda, autocompletado, «dónde vive este monstruo».

Para todo lo demás, llama a la API desde tu servidor.

Que un navegador pueda llamar a la API desde tu dominio depende de la política CORS de metamob.fr. Si una llamada falla en una página pero funciona en un servidor, esa es la razón: pasa por tu servidor.

## El estado en las plataformas serverless

El limitador y la caché viven en el cliente, en memoria. En una plataforma que arranca una nueva instancia en cada solicitud, cada instancia vuelve a contar desde cero.

- Crea el cliente fuera del manejador, para que las instancias ya arrancadas lo reutilicen.
- Da a la caché un almacenamiento que sobreviva a la instancia, consulta [Caché](/basics/caching/#a-cache-that-outlives-the-process).
- Evita las ráfagas. Cuando varias instancias comparten una clave, la API puede responder 429: el cliente espera el tiempo pedido, y vuelve a intentarlo.

## Tamaño del bundle

El paquete ocupa un archivo por sistema de módulos, unos 160 kB antes de la compresión, de los que más de la mitad son los datos de referencia. Con un bundler, importar solo `data` deja el cliente fuera. `Metamob` conserva los datos, que le sirven para leer los nombres.

## Tipos

Las declaraciones vienen con el paquete, para los módulos ES y para CommonJS. Se resuelven con todos los ajustes `moduleResolution` de TypeScript. Se recomienda TypeScript 5 o una versión más reciente.

Los nombres de los monstruos son grandes tipos unión, que solo sirven para el completado. Si tu editor va lento, anotar una variable como `string` los evita.

## Probar tu código

Da al cliente tu propio `fetch` para probar sin red:

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () =>
    Response.json({
      data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14T09:12:45Z" },
    }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```
