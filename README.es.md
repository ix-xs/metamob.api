<div align="center">

# @ix-xs/metamob.api

Un cliente JavaScript y TypeScript para la API de [Metamob](https://www.metamob.fr).

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentación](https://ix-xs.github.io/metamob.api/es/)** ·
[Français](./README.md) ·
[English](./README.en.md) ·
[Registro de cambios](./CHANGELOG.md)

</div>

## Instalación

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 o más reciente. También funciona con Bun, Deno, en un navegador y en plataformas edge. El paquete no tiene dependencias.

## Ejemplo

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const [quest] = await metamob.quests.list();

if (quest) {
  // Los monstruos que todavía le faltan a la misión.
  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  // Registrar un monstruo, por su nombre o su identificador.
  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
}
```

La clave API se crea en metamob.fr, en **Configuración > Clave API**.

## Lo que incluye el paquete

- **Los 42 endpoints de la API**, tipados: cuenta, misiones, socios de intercambio, propuestas de intercambio, mensajes privados, monstruos, zonas, jugadores, eventos Kralamar y datos de referencia.
- **Los nombres**: un monstruo, una zona, un servidor o un tipo de monstruo se indica por su identificador o por su nombre, en francés, inglés o español. Un nombre desconocido lanza un error que propone los nombres más parecidos.
- **Las listas**: un método paginado se espera con `await` para una página, o se recorre con `for await`.
- **El límite de solicitudes**: el cliente cuenta las 60 solicitudes por minuto y por clave, y hace esperar a las llamadas siguientes.
- **Los reintentos** tras un 429, un error del servidor o un fallo de red. El envío de un mensaje o de una propuesta nunca se reintenta.
- **Una caché** para los datos de referencia, ajustable y desactivable.
- **`data`**: los monstruos, zonas, servidores y plantillas de misión incluidos en el paquete, para buscar sin solicitud.
- **`withKey()`**: actuar con la clave de otro jugador, para un bot o un sitio que sirve a varios jugadores.

```ts
import { data, isMetamobError } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 5 }); // sin solicitud

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
}
```

## Documentación

La guía completa está en **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/es/)**, en español, [francés](https://ix-xs.github.io/metamob.api/) e [inglés](https://ix-xs.github.io/metamob.api/en/):

- [Inicio rápido](https://ix-xs.github.io/metamob.api/es/start/quick-start/)
- [Todos los métodos](https://ix-xs.github.io/metamob.api/es/resources/methods/)
- [Ejemplos](https://ix-xs.github.io/metamob.api/es/recipes/discord-command/): un comando de Discord, un informe de progreso, un buscador de intercambios
- [Desde la versión 4](https://ix-xs.github.io/metamob.api/es/help/migrating-from-v4/)

## Metamob

[Metamob](https://www.metamob.fr) es el sitio donde los jugadores de Dofus siguen sus misiones de archimonstruos y encuentran con quién intercambiar. El sitio, sus datos y su API son su trabajo: esta biblioteca solo la llama. La [documentación oficial de la API](https://www.metamob.fr/help/api) sigue siendo la referencia.

## Licencia

[MIT](./LICENSE). Proyecto independiente, no afiliado a Metamob ni a Ankama. Dofus es una marca de Ankama Games. Los datos incluidos en el paquete provienen de la API de Metamob; usar la API implica respetar [sus reglas](https://www.metamob.fr/help/api), empezando por el límite de solicitudes.
