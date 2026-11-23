---
title: Instalación
description: "El cliente JavaScript y TypeScript de la API de Metamob: sus 43 puntos de acceso, tipados, sin ninguna dependencia."
---

```bash
npm install @ix-xs/metamob.api
```

O `pnpm add`, `yarn add`, `bun add`. Los tipos están incluidos.

| Requisito | |
| --- | --- |
| Node.js | 20 o posterior |
| Módulos | ES modules y CommonJS |
| Otros entornos | Bun, Deno, navegadores, plataformas edge: consulta [Entornos de ejecución](/help/runtimes/) |
| Clave API | Una clave de Metamob, consulta [Tu clave API](/start/api-key/) |

## Primera llamada

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const quests = await metamob.quests.list();
const needed = await metamob.quests.monsters(quests[0]!.slug, { status: "needed" }).count();
```

En CommonJS:

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

Sin `apiKey`, el cliente lee la variable de entorno `METAMOB_API_KEY`. [Configuración](/basics/configuration/) lista todas sus opciones.

## Lo que el cliente gestiona

| | |
| --- | --- |
| Los tipos | Cada respuesta de la API está tipada: consulta la [referencia](/reference/) |
| Los nombres | Monstruos, zonas y servidores por su nombre, en los cinco idiomas del sitio: [Nombres e identificadores](/basics/names-and-ids/) |
| Las listas | Paginación por desplazamiento o por cursor, recorrida con `for await`: [Listas](/basics/lists/) |
| El límite de solicitudes | 60 solicitudes por minuto y por clave, las llamadas de más esperan su turno: [El límite de solicitudes](/basics/rate-limit/) |
| Los errores | Un `code` estable por caso, y reintentos para los errores pasajeros: [Errores](/basics/errors/) |
| La caché | Los datos de referencia en memoria, un almacenamiento reemplazable: [Caché](/basics/caching/) |
| Los datos del juego | Monstruos, zonas y servidores incluidos, consultables sin solicitud: [Los datos del paquete](/basics/embedded-data/) |

## Metamob

Todo se apoya en [Metamob](https://www.metamob.fr), el sitio de los cazadores de archimonstruos, y en su API. Este paquete solo la llama: la [documentación oficial de la API](https://www.metamob.fr/help/api) sigue siendo la referencia.
