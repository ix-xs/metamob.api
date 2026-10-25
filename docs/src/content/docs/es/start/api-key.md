---
title: Tu clave API
description: "De dónde sale una clave API de Metamob, a qué da acceso, cómo pasársela al cliente y cómo protegerla."
---

```ts
// Lee la variable de entorno METAMOB_API_KEY.
const metamob = new Metamob();

// O pásala tú mismo.
const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);
```

## Crear una clave

Inicia sesión en [metamob.fr](https://www.metamob.fr), abre **Configuración** y, en la sección **Clave API**, genera una clave. Cópiala enseguida: el sitio solo la muestra una vez. La clave es una cadena larga de letras y cifras. Pertenece a tu cuenta, y cada llamada hecha con ella se hace en tu nombre.

Una clave no se puede limitar a la lectura: siempre da acceso completo.

## A qué da acceso una clave

| Con cualquier clave | Solo con la clave de la cuenta |
| --- | --- |
| Monstruos, zonas, servidores, plantillas de misión | `metamob.me()` |
| Perfiles públicos y misiones públicas de cualquier jugador | `metamob.quests`: ajustes, monstruos, coincidencias, progreso y todas las escrituras |
| Eventos Kralamar | `metamob.conversations` y `metamob.tradeProposals`: mensajes privados y propuestas de intercambio |

No hay ninguna llamada sin clave, ni siquiera para los datos públicos.

## Dar la clave al cliente

Por orden de preferencia:

1. La variable de entorno `METAMOB_API_KEY`. Nada que escribir, nada que pueda filtrarse en un commit.
2. La opción `apiKey` del cliente.
3. `{ apiKey }` como último argumento de una llamada, o [`metamob.withKey()`](/basics/many-keys/), cuando actúas por otro jugador.

```bash
# .env, fuera de git
METAMOB_API_KEY=your-key
```

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
```

Sin clave en ningún sitio, la primera llamada lanza un error con el código `MISSING_API_KEY`.

## Comprobar una clave

`metamob.me()` es la forma más barata de saber si una clave funciona y de quién es.

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key is not valid, or was revoked.");
  else throw error;
}
```

## Protegerla

- Nunca incluyas una clave en un commit, ni la pegues en una issue, ni la escribas en un registro. La biblioteca nunca la pone en una URL, un error o un evento.
- Una clave en un navegador queda a la vista de quien abra la página. Llama a la API desde tu servidor, salvo que la página solo la use el dueño de la clave.
- Cuando los jugadores te den su clave, guárdala como una contraseña: cifrada, y borrada cuando se vayan.
- Si una clave se filtra, crea una nueva en la misma página de metamob.fr. La antigua deja de funcionar.

## El límite de solicitudes va con la clave

Cada clave tiene sus propias 60 solicitudes por minuto. Eso es lo que hace posible un bot para muchos jugadores, cada uno con su clave. No es una invitación a reunir claves para ir más rápido: el límite protege un servidor que mantiene una sola persona. Consulta [El límite de solicitudes](/basics/rate-limit/).

## Ver también

- [Inicio rápido](/start/quick-start/)
- [Actuar por otros jugadores](/basics/many-keys/)
- [Cuenta](/resources/account/)
- [Errores](/basics/errors/)
