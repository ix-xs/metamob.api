---
title: Errores
description: "Una llamada devuelve los datos o lanza un error. Cada error tiene un código tipado, y los que vienen de la API llevan además el estado y el mensaje que envió. Esta página muestra cómo distinguirlos y qué se reintenta por ti."
sidebar:
  order: 3
---

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Tres tipos de errores

| Clase | Cuándo | Extra |
| --- | --- | --- |
| `MetamobApiError` | La API respondió con un estado de error | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | Ninguna respuesta utilizable: fallo de red, tiempo de espera agotado, cancelación, JSON no válido | `method`, `cause` |
| `MetamobArgumentError` | La llamada se rechazó antes de enviarse: argumento incorrecto, nombre desconocido, falta la clave | `suggestions` |

Las tres extienden `MetamobError`, que tiene un `code`.

## Comprobar un error

`isMetamobError(error)` indica si un error viene de la biblioteca. Con un código, comprueba también el código.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // una errata en el nombre del monstruo
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // la misión no existe, o no es tuya
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // la clave fue revocada
  } else {
    throw error;
  }
}
```

Un error de la API tiene atajos para los tres que más compruebas:

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

## Qué significa un 404

La API responde 404 para lo que no existe y para lo que no es tuyo. `quests.get()`, `quests.monsters()` y todas las escrituras responden `NOT_FOUND` en una misión de otra cuenta, exista o no. `users.quest()` responde `NOT_FOUND` en una misión oculta.

## Qué se reintenta

Antes de que un error llegue hasta ti, la biblioteca ya ha vuelto a intentarlo cuando volver a intentarlo puede servir.

| Fallo | Se reintenta |
| --- | --- |
| 429, límite de solicitudes | Sí, tras la espera que pide la API |
| 502, 503, 504 | Sí |
| 500 | Solo en las lecturas |
| Fallo de red, tiempo de espera agotado | Sí |
| 400, 401, 403, 404 | No |
| Cancelada con tu `signal` | No |

Por defecto hay hasta 3 intentos más. La espera empieza en 500 ms y se duplica cada vez, hasta 60 segundos. Cuando la API envía `Retry-After`, se usa esa espera en su lugar. Un `Retry-After` más largo que `maxDelay` no se espera: el error se lanza de inmediato, con su `retryAfter` en segundos.

Cada escritura de esta API fija un valor, así que enviar una dos veces da el mismo resultado. Por eso también se reintentan las escrituras.

```ts
// Para todo el cliente.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// Para una llamada.
await metamob.quests.get(slug, { retry: false });
```

Para ver los reintentos a medida que ocurren:

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Tiempos de espera y cancelación

Un intento dispone de 30 segundos por defecto. `timeout` lo cambia, para el cliente o para una llamada. Un `signal` cancela una llamada desde fuera, incluso mientras espera al limitador.

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

Lo que se puede saber que es incorrecto sin preguntar a la API se rechaza en local, con `INVALID_ARGUMENT`: un slug vacío, una cantidad negativa, una búsqueda de menos de 3 caracteres, una fecha con un formato incorrecto. No se gasta ninguna solicitud.

## Referencia

| Código | Significado |
| --- | --- |
| `BAD_REQUEST` | 400: la API rechazó los parámetros |
| `UNAUTHORIZED` | 401: clave ausente, no válida o revocada |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404: no existe, o no es tuyo |
| `RATE_LIMITED` | 429, tras los reintentos |
| `SERVER_ERROR` | 5xx, tras los reintentos |
| `API_ERROR` | Cualquier otro estado de error |
| `TIMEOUT` | Sin respuesta a tiempo |
| `NETWORK` | No se pudo hacer la solicitud |
| `ABORTED` | Cancelada con tu `signal` |
| `PARSE_ERROR` | La respuesta no era JSON válido |
| `MISSING_API_KEY` | Ninguna clave en las opciones, la llamada o el entorno |
| `INVALID_ARGUMENT` | Un argumento es incorrecto |
| `UNKNOWN_NAME` | Ningún monstruo, zona o servidor tiene este nombre |

[Códigos de error](/reference/errors/) detalla las propiedades de cada clase.

## Ver también

- [El límite de solicitudes](/basics/rate-limit/)
- [Nombres e identificadores](/basics/names-and-ids/)
- [Configuración](/basics/configuration/)
- [Solución de problemas](/help/troubleshooting/)
