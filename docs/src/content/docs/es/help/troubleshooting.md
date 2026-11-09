---
title: Solución de problemas
description: "Los problemas más frecuentes, lo que significan y cómo corregirlos."
---

## MISSING_API_KEY

No ha llegado ninguna clave al cliente. Comprueba, en este orden:

- La variable de entorno `METAMOB_API_KEY` está definida en el proceso que ejecuta tu código. Node.js no lee un archivo `.env` por sí solo: arranca con `node --env-file=.env app.mjs`, o cárgalo con tu framework.
- Has pasado `apiKey` y no vale `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` con una variable mal escrita es la causa habitual.
- En una plataforma edge, puede que no haya variable de entorno: pasa la clave tú mismo, consulta [Entornos de ejecución](/help/runtimes/#the-api-key).

## UNAUTHORIZED

La API no acepta la clave: mal copiada, o revocada porque se ha creado una nueva. Genera una en metamob.fr, en Configuración > Clave API, y compruébala con `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND en una de mis misiones

La API responde 404 para lo que no es tuyo, igual que para lo que no existe.

- El slug pertenece a una misión de otra cuenta. `quests.list()` da los slugs de la clave usada.
- Usas la clave de otro jugador con tu slug, o al revés. Con [`withKey()`](/basics/many-keys/), los slugs van con su clave.
- Con `users.quest()`, la misión está oculta en el perfil público. Su dueño la sigue leyendo con `quests.monsters()`.

## UNKNOWN_NAME para un nombre que existe

- Comprueba la ortografía con ayuda de `error.suggestions`. Los acentos y las mayúsculas se perdonan, una letra que falta o que sobra no.
- Puede que el nombre sea más reciente que tu versión del paquete. La biblioteca lo busca entonces en la API, salvo en el caso de una subzona dada sola, que la API solo busca dentro de una zona: pasa `{ zone }`, consulta [Zonas](/resources/zones/#subzones).
- Actualiza el paquete: cada versión incluye los nombres del momento.

## El monstruo equivocado para un nombre compartido

Seis pares de monstruos, sobre todo archimonstruos, comparten un nombre en al menos un idioma, en dos versiones del juego. `monsters.get("Crognan le Barbare")` devuelve aquel cuya plantilla de misión tiene el identificador más bajo. Añade `{ gameVersion }`, o usa el identificador. Las escrituras en una misión no se ven afectadas: toman el monstruo de esa misión. Consulta [Nombres e identificadores](/basics/names-and-ids/#monsters-that-share-a-name).

## Mi script es lento

Seguramente espera por el límite de 60 solicitudes por minuto. El evento `rateLimit` lo confirma:

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Para enviar menos solicitudes: un `setMonsters()` en lugar de varios `setMonster()`, `count()` en lugar de contar páginas, [`data`](/basics/embedded-data/) en lugar de las llamadas de referencia. Consulta [El límite de solicitudes](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED con el limitador activo

El cliente solo cuenta sus propias solicitudes. Seguramente la clave también se usa en otro sitio: otro proceso, otra instancia del servidor, un segundo cliente en el mismo programa. Comparte un solo cliente, o baja el límite de cada uno con `rateLimit: { requests: 30 }`.

## Un valor que acabo de escribir se vuelve a leer sin cambios

Las lecturas ligadas a la cuenta solo se guardan en caché si lo has pedido. Con una duración para `quests.get` o `quests.monsters` en `cache.methods`, una escritura hecha con el mismo cliente vacía la caché, pero no una escritura hecha en otro sitio, en el sitio web por ejemplo. Pasa `{ cache: false }` en la lectura, o acorta la duración.

## setMonster no ha sumado un ejemplar

Fija la cantidad, no le suma nada. Lee, y luego escribe:

```ts
const tofu = data.monster("Tofu Maléfique");
const monsters = await metamob.quests.monsters(slug).all();
const owned = monsters.find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT o NETWORK

La solicitud no ha pasado, ni siquiera después de 3 reintentos. Comprueba la conexión de la máquina, y luego que metamob.fr responde. Detrás de un proxy, da al cliente un `fetch` que lo use, consulta [Configuración](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

La API ha fallado por su lado, y las lecturas ya se han reintentado. Si dura, puede que el sitio esté en mantenimiento: espera en lugar de repetir en bucle.

Un mensaje o una propuesta no se reintenta: después de un `SERVER_ERROR`, consulta la conversación o `tradeProposals.list()` antes de reenviarlo, puede que haya pasado.

## Funciona en mi servidor y falla en el navegador

Una página solo puede llamar a una API que autoriza su origen. Llama a Metamob desde tu servidor, y haz que la página llame a tu servidor: así la clave también queda fuera de la página. Consulta [Entornos de ejecución](/help/runtimes/#browsers).

## require() devuelve algo sin Metamob

La versión 5 tiene exportaciones con nombre. `const MetamobAPI = require("@ix-xs/metamob.api")` pasa a ser `const { Metamob } = require("@ix-xs/metamob.api")`. Consulta [Desde la versión 4](/help/migrating-from-v4/).

## Sigo bloqueado

Abre una issue en [GitHub](https://github.com/ix-xs/metamob.api/issues) con la versión del paquete, tu entorno de ejecución, `error.code` y el código más pequeño que muestre el problema. Quita tu clave API de todo lo que pegues.
