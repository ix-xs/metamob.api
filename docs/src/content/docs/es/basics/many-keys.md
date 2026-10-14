---
title: Actuar por otros jugadores
description: "Un bot o un sitio web suele trabajar para jugadores que le han dado cada uno su propia clave API. Esta página muestra cómo usar esas claves con un solo cliente, qué comparten y qué queda separado."
sidebar:
  order: 7
---

```ts
const theirs = metamob.withKey(theirKey);

const account = await theirs.me();
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

## Para qué sirve

Una clave API actúa como su dueño: lee sus misiones y sus mensajes, y escribe en sus misiones. Una herramienta que gestiona las misiones de varios jugadores necesita por tanto la clave de cada uno, dada voluntariamente.

Ese es el único propósito de lo que sigue. Cada clave tiene sus propias 60 solicitudes por minuto, y usar varias claves para enviar más solicitudes para ti mismo es justo lo que el límite pretende impedir. Consulta [El límite de solicitudes](/basics/rate-limit/).

## Un cliente por jugador

`withKey()` devuelve un cliente que usa otra clave. Crearlo cuesta poco: crea uno cuando llegue la petición de un jugador y suéltalo después.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

El nuevo cliente comparte, con aquel del que procede:

- las opciones: tiempo de espera, reintentos, URL base, encabezados;
- la caché: los datos de referencia obtenidos para un jugador sirven a todos los demás;
- los oyentes: `metamob.on("retry", ...)` escucha a todos los clientes;
- el limitador, que mantiene una ventana por clave.

No comparte la cuenta. Lo que depende de una clave se guarda en caché aparte para cada clave, así que dos jugadores nunca pueden ver las misiones del otro.

## Una clave para una llamada

Para una sola llamada, la clave va en las opciones, como último argumento.

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Saber de quién es una clave

Una clave no dice nada de su dueño hasta que preguntas. `me()` responde con el nombre de usuario, que necesitas para los endpoints públicos.

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

También es la forma de validar una clave cuando un jugador la envía:

```ts
async function register(playerKey: string) {
  try {
    const { username } = await metamob.withKey(playerKey).me();
    await db.players.save({ username, key: playerKey });
    return username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined; // no es una clave válida
    throw error;
  }
}
```

## Un cliente sin clave propia

Un servicio que solo actúa por jugadores no necesita una clave propia. Crea el cliente sin clave y deriva de él. Asegúrate de que `METAMOB_API_KEY` no esté definida, o se usaría.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Llamar a `base` directamente lanza entonces `MISSING_API_KEY`, que es lo que quieres: nada puede ejecutarse sin decir para quién.

## Guardar las claves

Una clave es una contraseña de una cuenta de Metamob.

- Guárdala cifrada y nunca la escribas en un registro. La biblioteca la mantiene fuera de las URL, los errores y los eventos.
- Pídela por HTTPS, en un formulario o un comando privado, nunca en un canal público.
- Bórrala cuando el jugador se vaya, y dile que puede revocarla en cualquier momento en metamob.fr, en Configuración > Clave API.
- Un `401` en una clave que antes funcionaba significa que fue revocada: deja de usarla.

## Referencia

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Un cliente para esa clave, que comparte opciones, caché, oyentes y limitador |
| `{ apiKey }` como último argumento | La clave para una llamada |
| `metamob.me()` | La cuenta de la clave en uso |

## Ver también

- [Tu clave API](/start/api-key/)
- [El límite de solicitudes](/basics/rate-limit/)
- [Cuenta](/resources/account/)
- [Un comando de Discord con autocompletado](/recipes/discord-command/)
