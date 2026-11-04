---
title: Actuar por otros jugadores
description: "Usar las claves que unos jugadores te han confiado, con un solo cliente."
sidebar:
  order: 7
---

## Para qué sirve

Una clave API actúa en nombre de su dueño: lee sus misiones y sus mensajes, y escribe en sus misiones. Un bot o un sitio que gestiona las misiones de varios jugadores necesita, por tanto, la clave de cada uno, dada por voluntad propia.

Es el único uso previsto. Cada clave tiene sus propias 60 solicitudes por minuto: usar varias claves para enviar más solicitudes para ti equivale a eludir el límite. Consulta [El límite de solicitudes](/basics/rate-limit/).

## Un cliente por jugador

`withKey()` devuelve un cliente que usa otra clave. Es ligero: crea uno en cada petición de un jugador.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

Comparte con el cliente del que viene:

- las opciones: tiempo de espera, reintentos, URL base, cabeceras;
- la caché de los datos de referencia;
- los oyentes: `metamob.on("retry", ...)` escucha a todos los clientes;
- el limitador, que cuenta cada clave por separado.

Lo que depende de la cuenta se guarda en caché aparte para cada clave: un jugador nunca ve las misiones de otro.

## Una clave para una sola llamada

Para una llamada aislada, la clave va en las opciones, como último argumento:

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Saber a quién pertenece una clave

`me()` da el nombre de usuario del dueño de la clave, útil para los puntos de acceso públicos:

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

También es la forma de validar una clave cuando un jugador la proporciona:

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

Un servicio que solo actúa por jugadores no necesita su propia clave. Crea el cliente sin clave, y deriva de él uno por jugador. `METAMOB_API_KEY` no debe estar definida, si no se usaría.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Una llamada hecha directamente con `base` lanza entonces `MISSING_API_KEY`.

## Guardar las claves

Una clave es una contraseña para una cuenta de Metamob.

- Guárdala cifrada, y nunca la escribas en un registro. La biblioteca no la pone ni en las URL, ni en los errores, ni en los eventos.
- Pídela por HTTPS, en un formulario o un comando privado, nunca en un canal público.
- Bórrala cuando el jugador se vaya, y dile que puede revocarla en cualquier momento en metamob.fr, en Configuración > Clave API.
- Un `401` con una clave que funcionaba significa que se ha revocado: deja de usarla.

## Referencia

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Un cliente para esta clave, que comparte las opciones, la caché, los oyentes y el limitador |
| `{ apiKey }` como último argumento | La clave para una sola llamada |
| `metamob.me()` | La cuenta de la clave usada |
