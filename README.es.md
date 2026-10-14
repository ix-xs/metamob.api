<div align="center">

# @ix-xs/metamob.api

**Toda la API de Metamob, con cada monstruo llamado por su nombre.**

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/@ix-xs/metamob.api?activeTab=dependencies)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![types](https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white)](#nombres-en-lugar-de-identificadores)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentación](https://ix-xs.github.io/metamob.api/es/)** ·
[Français](./README.md) ·
[English](./README.en.md) ·
[Inicio rápido](https://ix-xs.github.io/metamob.api/es/start/quick-start/) ·
[Todos los métodos](https://ix-xs.github.io/metamob.api/es/reference/methods/) ·
[Registro de cambios](./CHANGELOG.md)

</div>

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 o posterior, Bun, Deno, los navegadores y los entornos edge. Sin dependencias: se apoya en `fetch`.

---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

// De quién es la clave, y sus misiones.
const me = await metamob.me();
const [quest] = await metamob.quests.list();

// Un monstruo por su nombre, en francés, inglés o español. Los acentos y las mayúsculas no importan.
const tofu = await metamob.monsters.get("Tofu Maléfique");
console.log(tofu.level_min, tofu.zones.map((zone) => zone.name.fr));

// Lo que aún le falta a la misión. Las páginas se piden a medida que avanzas.
for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
  console.log(monster.step, monster.name.fr);
}

// Un archimonstruo más capturado.
await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
```

Cubre los 35 endpoints de la [API de Metamob](https://www.metamob.fr/help/api): cuenta, misiones, monstruos, zonas, socios de intercambio, eventos Kralamar, mensajes privados y todos los datos de referencia, para Dofus, Dofus Retro y Dofus Touch.

## Lo que hace por ti

| La API tal como es | Con esta biblioteca |
| --- | --- |
| Todo se designa por un identificador numérico | **Escribe el nombre.** `"Tofu Maléfique"`, `"evil tofu"` o `21`: monstruos, zonas, subzonas, servidores y tipos de monstruo, en tres idiomas |
| Una errata es un 404, cuando no es una escritura en el monstruo equivocado | **Detectada antes de hacer la llamada**, con los nombres más parecidos: `Did you mean "Tofu Maléfique"?` |
| Bucles con `limit` y `offset` por todas partes | **`for await`** sobre cualquier lista, o `.all()`, `.take(n)`, `.count()`, o una página con `await` |
| 60 solicitudes por minuto, y después 429 | **Un limitador integrado** que hace que las llamadas esperen su turno, por clave, en lugar de fallar |
| 200 monstruos como máximo por lote | **Pasa mil.** Se dividen, se envían en orden y se fusionan |
| Una subzona necesita el identificador de su zona | **`zones.subzone("Coin des Bouftous")`**: la zona se encuentra por ti |
| Los datos de referencia cuestan solicitudes | **`data`**: más de 800 monstruos, las zonas, los servidores y las plantillas de misión, en el paquete, servidos desde la memoria |
| Las mismas listas se piden una y otra vez | **Una caché** para lo que solo cambia cuando cambia el juego, y las llamadas idénticas en curso comparten una sola solicitud |
| Los errores son un código de estado y tres formas de cuerpo | **`error.code`**, tipado, además de `isNotFound`, `isRateLimited`, `isUnauthorized` |
| Un bot sirve a muchos jugadores, cada uno con su clave | **`metamob.withKey(theirKey)`**: el mismo cliente, su cuenta, su propia ventana de límite de solicitudes |

## Nombres en lugar de identificadores

Allí donde la API espera un identificador, puedes pasar el identificador, el nombre o un objeto que tenga el identificador. Tu editor completa los nombres.

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique");  // los acentos y las mayúsculas no importan
await metamob.monsters.get("Evil Tofu");       // el inglés y el español también funcionan

await metamob.monsters.list({ type: "archimonstre" });
await metamob.kralove.list({ server: "Draconiros" });
await metamob.zones.monsters("Coin des Bouftous");
await metamob.quests.zones(slug, { zone: "Amakna", type: "boss" });
```

Un nombre que no existe nunca llega a una misión:

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
  }
}
```

Diez archimonstruos comparten su nombre entre dos versiones del juego. Cuando escribes en una misión, la misión indica de cuál se trata; en los demás casos, añade `{ gameVersion }`.

## Listas

Cada método paginado devuelve una solicitud que puedes esperar o recorrer.

```ts
// Una página.
const page = await metamob.monsters.list({ type: "boss", limit: 20 });
page.items, page.total, page.hasNext;

// Todo, a medida que avanzas. Se usa el tamaño de página más grande, que es lo que menos solicitudes cuesta.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) { /* ... */ }

// Un array, acotado o no.
const first100 = await metamob.users.search("ix-").take(100);
const wanted = await metamob.users.quest("Ix-xs", "21b0a742", { status: "wanted" }).all();

// Solo el número, en una única solicitud pequeña.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

Los mensajes privados se paginan con un cursor en lugar de un offset. Los mismos métodos funcionan:

```ts
for await (const item of metamob.conversations.messages("Ix-xs")) {
  if (item.kind === "message") console.log(item.sender, item.content);
  else console.log(item.sender, "proposed a trade:", item.status);
}
```

## Tus misiones

```ts
const quest = await metamob.quests.get(slug);
quest.current_step, quest.parallel_quests, quest.trade_mode;

// Ajustes. Envía solo lo que cambia.
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { never_offer_arch: true });

// Cantidades, una a una o en lote.
await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Cuántos ejemplares de un monstruo ofrece y busca la misión, en lugar del cálculo automático.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });
await metamob.quests.resetTrade(slug, "Tofu Maléfique");

// Progreso por zona, primero las subzonas menos avanzadas.
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(zone.name.fr, `${zone.completed}/${zone.total}`);
}
```

## Socios de intercambio

```ts
const { items } = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

for (const match of items) {
  const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
  const takes = match.matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(match.user.username, { gives, takes });
}
```

Las misiones públicas de cualquier jugador también se pueden leer, con lo que busca y lo que ofrece:

```ts
const profile = await metamob.users.get("Ix-xs");
const page = await metamob.users.quest("Ix-xs", profile.quests[0].slug, { status: "offered" });
page.quest.server?.name, page.items;
```

## Los datos del paquete

Los monstruos, las zonas, las subzonas, los servidores y las plantillas de misión vienen con el paquete. Leerlos no envía nada y no cuenta para el límite de solicitudes.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("Tofu Maléfique");                      // el monstruo, o undefined
data.searchMonsters("bouf", { type: "archimonstre" }); // autocompletado para un comando de Discord
data.zonesOf("Tofu Maléfique");                      // dónde vive
data.archmonstersOf("Tofu");                         // sus versiones raras
data.monstersInSubzone("Coin des Bouftous");
data.server("Draconiros")?.game_version?.name;       // "Dofus (Unity)"
data.suggest("monster", "Tofu Malefik");             // ["Tofu Maléfique"]
data.fetchedAt;                                      // el día en que los datos se leyeron de la API
```

Un monstruo añadido al juego después de publicarse el paquete sigue funcionando por su nombre: cuando un nombre no está en el paquete, se consulta la API antes de renunciar.

## Límite de solicitudes, reintentos y caché

Metamob permite 60 solicitudes por minuto por clave. El cliente las cuenta y hace esperar a las que sobran, así que un bucle sobre unos cientos de monstruos va más despacio en lugar de fallar.

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
metamob.on("retry", ({ method, attempt, error }) => console.warn(method, attempt, error.message));
```

Un 429, un error del servidor o un fallo de red se reintenta con una espera que se duplica en cada intento, respetando `Retry-After`. Cada escritura de esta API fija un valor, así que repetir una no cambia nada.

Los datos de referencia se guardan en caché durante 10 minutos. Lo que depende de una cuenta no, salvo que lo pidas:

```ts
const metamob = new Metamob({
  apiKey,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h", methods: { "users.get": "30s", "kralove.list": "1m" } },
});
```

## Varios jugadores, varias claves

Un bot o un sitio web actúa por jugadores que le han dado cada uno su propia clave. `withKey` da un cliente para uno de ellos. Comparte los ajustes, la caché y los oyentes del cliente del que procede, y cada clave conserva su propia ventana de 60 solicitudes por minuto.

```ts
const theirs = metamob.withKey(player.apiKey);

const account = await theirs.me(); // una clave dice de quién es
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

Una sola llamada también puede llevar su clave: `metamob.quests.list({ apiKey })`.

Esto existe para actuar por jugadores que han dado su acuerdo. No es una forma de esquivar el límite de solicitudes, que está ahí para proteger un servidor mantenido por una sola persona.

## Errores

```ts
import { MetamobApiError, isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.users.get("nobody-by-that-name");
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) {
    // ese usuario no existe
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // la clave fue revocada
  } else {
    throw error;
  }
}
```

Cada error extiende `MetamobError` y tiene un `code`: `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMITED`, `BAD_REQUEST`, `SERVER_ERROR`, `TIMEOUT`, `NETWORK`, `UNKNOWN_NAME`, `INVALID_ARGUMENT`, `MISSING_API_KEY` y algunos más.

## Pequeñas cosas que ahorran tiempo

```ts
import { urls } from "@ix-xs/metamob.api";

urls.monsterImage(tofu);    // "https://www.metamob.fr/img/monsters/..."
urls.profile("Ix-xs");      // "https://www.metamob.fr/profile/Ix-xs"

tofu.name.fr, tofu.name.en, tofu.name.es;            // cada nombre viene en tres idiomas
await metamob.kralove.list({ from: new Date() });    // un Date o "YYYY-MM-DD"
await metamob.monsters.get("Tofu", {}, { signal });  // cada llamada acepta un AbortSignal
```

## Desde la versión 4.x

La versión 5 es una reescritura en TypeScript. Los mismos endpoints, una forma más corta de llamarlos:

| 4.x | 5.x |
| --- | --- |
| `const MetamobAPI = require("@ix-xs/metamob.api")` | `const { Metamob } = require("@ix-xs/metamob.api")`, o `import { Metamob }` |
| `new MetamobAPI({ api_key })` | `new Metamob({ apiKey })` |
| `{ ok, status, statusText, data }` | los datos, o un `MetamobApiError` lanzado |
| `getMonsters({ idOrName })`, `getMonsters({ ... })` | `monsters.get(ref)`, `monsters.list({ ... })` |
| `getUserQuests(username, { slug })` | `users.quest(username, slug)` |
| `getMyQuests()`, `getQuestMonsters(slug)` | `quests.list()`, `quests.monsters(slug)` |
| `updateQuestMonster(slug, idOrName, quantity)` | `quests.setMonster(slug, ref, quantity)` |
| `{ api_key }` en las opciones de una llamada | `{ apiKey }` como último argumento, o `metamob.withKey(apiKey)` |
| `client.cache` | `data` |
| `@ix-xs/node-comfort` instalado con el paquete | ninguna dependencia |

La página [Desde la versión 4](https://ix-xs.github.io/metamob.api/es/start/migrating-from-v4/) lista todos los métodos.

## Documentación

Todo está en **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/es/)**, en español, [en francés](https://ix-xs.github.io/metamob.api/) y [en inglés](https://ix-xs.github.io/metamob.api/en/): guías, una página por recurso, recetas y la lista de todos los métodos. La misma documentación está en tu editor: cada método, parámetro y campo lleva su descripción y un ejemplo.

## Licencia

[MIT](./LICENSE). Sin afiliación con Metamob ni con Ankama. Dofus es una marca de Ankama Games. Los datos incluidos en el paquete proceden de la API de Metamob; usar la API implica respetar [sus reglas](https://www.metamob.fr/help/api), empezando por el límite de solicitudes.
