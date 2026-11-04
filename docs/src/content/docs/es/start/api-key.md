---
title: Tu clave API
description: "Crear una clave API de Metamob, dársela al cliente, comprobarla y mantenerla segura."
---

## Crear una clave

Inicia sesión en [metamob.fr](https://www.metamob.fr), abre **Configuración** y luego la sección **Clave API**, y genera una clave. Cópiala enseguida: el sitio solo la muestra una vez.

La clave pertenece a tu cuenta. Cada llamada hecha con ella se hace en tu nombre, y siempre da acceso completo: no existen claves de solo lectura.

## Lo que permite una clave

| Con cualquier clave | Solo con la clave de la cuenta |
| --- | --- |
| Monstruos, zonas, servidores, plantillas de misión | `metamob.me()` |
| Perfiles y misiones públicos de cualquier jugador | `metamob.quests`: ajustes, monstruos, coincidencias, progreso y escrituras |
| Eventos Kralamar | `metamob.conversations` y `metamob.tradeProposals`. Metamob abre el envío de mensajes y de propuestas cuenta por cuenta |

La API pide una clave para cada llamada, incluso para los datos públicos.

## Dar la clave al cliente

El cliente busca la clave en tres sitios, del más general al más preciso:

1. la variable de entorno `METAMOB_API_KEY`;
2. la opción `apiKey` del cliente;
3. `{ apiKey }` como último argumento de una llamada, o [`metamob.withKey()`](/basics/many-keys/), para actuar con la clave de otro jugador.

```bash title=".env"
METAMOB_API_KEY=your-key
```

```ts
const metamob = new Metamob(); // lee METAMOB_API_KEY

const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);

const quests = await metamob.quests.list({ apiKey: theirKey });
```

Sin clave, la primera llamada lanza un error `MISSING_API_KEY`.

## Comprobar una clave

`metamob.me()` es la llamada más sencilla para saber si una clave funciona y a quién pertenece:

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
  console.log("This key is not valid, or was revoked.");
}
```

## Mantenerla segura

- Nunca publiques una clave: ni en un commit, ni en una issue, ni en un registro. La biblioteca nunca la pone en una URL, un error o un evento.
- En una página web, una clave queda a la vista de todos los que abren la página. Llama a la API desde un servidor, salvo en una página que solo usa el dueño de la clave.
- Si unos jugadores te confían su clave, trátala como una contraseña: cifrada, y borrada cuando se vayan.
- Si una clave se filtra, genera una nueva en metamob.fr: la antigua deja de funcionar.

## Un límite por clave

Cada clave tiene sus propias 60 solicitudes por minuto. Así, un bot puede actuar por varios jugadores, cada uno con su clave. Usar varias claves para ir más rápido no es el objetivo: el límite protege el servidor de Metamob. Consulta [El límite de solicitudes](/basics/rate-limit/).
