---
title: Errores
description: "Una llamada devuelve los datos o lanza un error. Los tipos de error, sus códigos, y lo que se reintenta."
sidebar:
  order: 3
---

Una llamada devuelve los datos pedidos, o lanza un error cuando falla. Cada error lleva un `code` que comprobar:

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Tres tipos de error

| Clase | Cuándo | Además |
| --- | --- | --- |
| `MetamobApiError` | La API respondió con un estado de error | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | Ninguna respuesta utilizable: fallo de red, tiempo agotado, cancelación, JSON no válido | `method`, `cause` |
| `MetamobArgumentError` | La llamada se rechazó antes de enviarse: argumento incorrecto, nombre desconocido, sin clave | `suggestions` |

Las tres extienden `MetamobError`, que tiene un `code`.

## Comprobar un error

`isMetamobError(error)` indica si un error viene de la biblioteca. Con un código, también comprueba el código.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // una errata en el nombre del monstruo
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // la misión no existe, o no es tuya
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // la clave se ha revocado
  } else {
    throw error;
  }
}
```

Un error de la API también tiene atajos para los casos más comunes:

```ts
try {
  await metamob.quests.get(slug);
} catch (error) {
  if (error instanceof MetamobApiError) {
    error.isNotFound; // 404
    error.isUnauthorized; // 401
    error.isRateLimited; // 429
    error.status; // el estado HTTP
    error.messages; // lo que dijo la API, por campo: { error: "Quest not found" }
  }
}
```

## Lo que significa un 404

La API responde 404 para lo que no existe y para lo que no es tuyo. `quests.get()`, `quests.monsters()` y todas las escrituras responden `NOT_FOUND` en una misión de otra cuenta, exista o no. `users.quest()` responde `NOT_FOUND` en una misión oculta.

## Lo que se reintenta

Algunos fallos son pasajeros. En esos casos, la biblioteca reenvía la solicitud antes de lanzar el error:

| Fallo | Se reintenta |
| --- | --- |
| 429, límite de solicitudes | Sí, tras la espera que pide la API |
| 502, 503, 504 | Sí |
| 500 | Solo en las lecturas |
| Fallo de red, tiempo agotado | Sí |
| 400, 401, 403, 404 | No |
| Cancelado con tu `signal` | No |

Por defecto, hay hasta 3 intentos más. La espera empieza en 500 ms y se duplica cada vez, hasta 60 segundos. Cuando la API envía `Retry-After`, se usa esa espera. Un `Retry-After` más largo que `maxDelay` no se espera: el error se lanza enseguida, con su `retryAfter` en segundos.

Las escrituras que fijan un valor, en una misión o en una conversación, dan el mismo resultado si se envían dos veces: también se reintentan. El envío de un mensaje o de una propuesta de intercambio nunca se reintenta, ya que llegaría dos veces. Después de un tiempo agotado, comprueba que no ha salido antes de reenviarlo.

El número de intentos se ajusta para el cliente o para una llamada:

```ts
// Para todo el cliente.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// Para una sola llamada.
await metamob.quests.get(slug, { retry: false });
```

Para ver los reintentos en el momento en que ocurren:

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Tiempos de espera y cancelación

Un intento dispone de 30 segundos por defecto. `timeout` cambia ese tiempo, para el cliente o para una llamada. Un `signal` cancela una llamada desde fuera, incluso mientras espera al limitador.

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 2000);

try {
  await metamob.quests.matches(slug, {}, { signal: controller.signal, timeout: "5s" });
} catch (error) {
  if (isMetamobError(error, "ABORTED")) console.log("Cancelled.");
  if (isMetamobError(error, "TIMEOUT")) console.log("Too slow.");
}
```

## Los argumentos se comprueban primero

Un argumento que la API rechazaría con seguridad se rechaza antes del envío, con `INVALID_ARGUMENT`: un slug vacío, una cantidad negativa, una búsqueda de menos de 3 caracteres, una fecha con un formato incorrecto, un mensaje de más de 1000 caracteres, una propuesta sin monstruos.

## Referencia

| Código | Significado |
| --- | --- |
| `BAD_REQUEST` | 400: la API rechazó los parámetros |
| `UNAUTHORIZED` | 401: clave ausente, no válida o revocada |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404: no existe, o no es tuyo |
| `CONFLICT` | 409: el estado no lo permite, por ejemplo una propuesta ya aplicada |
| `RATE_LIMITED` | 429, después de los reintentos |
| `SERVER_ERROR` | 5xx, después de los reintentos |
| `API_ERROR` | Cualquier otro estado de error |
| `TIMEOUT` | Sin respuesta a tiempo |
| `NETWORK` | No se pudo hacer la solicitud |
| `ABORTED` | Cancelado con tu `signal` |
| `PARSE_ERROR` | La respuesta no era JSON válido |
| `MISSING_API_KEY` | No hay clave en las opciones, la llamada ni el entorno |
| `INVALID_ARGUMENT` | Un argumento es incorrecto |
| `UNKNOWN_NAME` | Ningún monstruo, zona o servidor tiene ese nombre |

[Códigos de error](/reference/errors/) lista las propiedades de cada clase.
