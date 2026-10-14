---
title: Solución de problemas
description: "Los problemas más frecuentes, cada uno con lo que significa y cómo resolverlo. Parte del código de error o de lo que ves."
---

## MISSING_API_KEY

Ninguna clave llegó al cliente. Comprueba, en este orden:

- La variable de entorno `METAMOB_API_KEY` está definida en el proceso que ejecuta tu código. Node.js no lee un archivo `.env` por sí solo: arranca con `node --env-file=.env app.mjs`, o cárgalo con tu framework.
- Pasaste `apiKey` y no es `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` con una variable mal escrita es la causa habitual.
- En una plataforma edge puede no haber variable de entorno: pasa la clave tú mismo, ver [Entornos de ejecución](/reference/runtimes/#the-api-key).

## UNAUTHORIZED

La API no acepta la clave. Se escribió mal, se cortó al copiarla o fue revocada porque se creó una nueva. Vuelve a crear una clave en metamob.fr, en Configuración > Clave API, y compruébala con `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND en una de mis misiones

La API responde 404 para lo que no es tuyo, exactamente igual que para lo que no existe.

- El slug pertenece a una misión de otra cuenta. `quests.list()` da los slugs de la clave en uso.
- Usas la clave de otro jugador con tu slug, o al revés. Con [`withKey()`](/basics/many-keys/), los slugs van con su clave.
- A través de `users.quest()`, la misión está oculta en el perfil público. Su propietario la sigue leyendo con `quests.monsters()`.

## UNKNOWN_NAME para un nombre que existe

- Compara la ortografía con `error.suggestions`. Los acentos y las mayúsculas se perdonan, una letra de menos o de más no.
- El monstruo puede ser más reciente que tu versión del paquete. La biblioteca pregunta entonces a la API, lo que funciona para todo salvo para una subzona dada sola: la API solo busca subzonas dentro de una zona. Pasa `{ zone }`, ver [Zonas](/resources/zones/#subzones).
- Actualiza el paquete: cada versión trae los nombres actuales.

## El monstruo equivocado para un nombre compartido

Diez archimonstruos tienen el mismo nombre en dos versiones del juego. `monsters.get("Crognan le Barbare")` devuelve aquel cuya plantilla de misión tiene el identificador más bajo. Añade `{ gameVersion }`, o usa el identificador. Las escrituras en una misión no se ven afectadas: eligen el monstruo de esa misión. Ver [Nombres e identificadores](/basics/names-and-ids/#monsters-that-share-a-name).

## Mi script es lento

Está esperando por el límite de solicitudes: 60 solicitudes por minuto. Escucha el evento `rateLimit` para confirmarlo.

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Después gasta menos solicitudes: un `setMonsters()` en lugar de muchos `setMonster()`, `count()` en lugar de contar páginas, [`data`](/basics/embedded-data/) en lugar de llamadas de referencia. Ver [El límite de solicitudes](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED aunque el limitador está activo

El limitador cuenta lo que envía este cliente. La clave también se usa en otro lugar: otro proceso, otra instancia de tu servidor, un segundo cliente creado en el mismo programa. Crea un solo cliente y compártelo, o baja el límite de cada uno con `rateLimit: { requests: 30 }`.

## Un valor que acabo de escribir se lee sin cambios

Las lecturas ligadas a la cuenta no se guardan en caché salvo que lo pidas. Si diste a `quests.get` o a `quests.monsters` una frescura en `cache.methods`, una escritura hecha con el mismo cliente la borra, pero una escritura hecha en otro lugar, en el sitio por ejemplo, no. Pasa `{ cache: false }` en la lectura, o acorta la frescura.

## setMonster no sumó uno

Fija la cantidad, no le suma nada. Lee y luego escribe:

```ts
const tofu = data.monster("Tofu Maléfique");
const owned = (await metamob.quests.monsters(slug).all()).find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT o NETWORK

La solicitud no pasó, tras 3 reintentos. Comprueba la conexión de la máquina, y luego si metamob.fr responde. Detrás de un proxy, da al cliente un `fetch` que lo use, ver [Configuración](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

La API falló por su lado. Las lecturas se reintentaron. Si dura, puede que el sitio esté en mantenimiento: espera en lugar de insistir en bucle.

En una escritura, también puede ser un valor que la API no esperaba, al que responde con un 500 sin mensaje: un `current_step` más allá de la última etapa de la misión, por ejemplo. Comprueba lo que has enviado antes de volver a intentarlo.

## Funciona en mi servidor y falla en el navegador

Una página solo puede llamar a una API que permite su origen. Llama a Metamob desde tu servidor y haz que la página hable con tu servidor. Así, además, la clave queda fuera de la página. Ver [Entornos de ejecución](/reference/runtimes/#browsers).

## require() devuelve algo sin Metamob

La versión 5 tiene exportaciones con nombre. `const MetamobAPI = require("@ix-xs/metamob.api")` es ahora `const { Metamob } = require("@ix-xs/metamob.api")`. Ver [Desde la versión 4](/start/migrating-from-v4/).

## Sigues atascado

Abre una incidencia en [GitHub](https://github.com/ix-xs/metamob.api/issues) con la versión del paquete, tu entorno de ejecución, `error.code` y el código más pequeño que muestre el problema. Quita tu clave API de todo lo que pegues.

## Ver también

- [Códigos de error](/reference/errors/)
- [Errores](/basics/errors/)
- [Preguntas frecuentes](/help/faq/)
- [Entornos de ejecución](/reference/runtimes/)
