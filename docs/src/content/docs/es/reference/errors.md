---
title: Códigos de error
description: "Los códigos de error, su causa, si se reintentan, y las propiedades de cada clase de error."
---

Todos los errores extienden `MetamobError` y llevan un `code`. [Errores](/basics/errors/) explica cómo tratarlos; esta página los lista.

## Códigos

`code` es un `MetamobErrorCode`. Hay 15.

«Se reintenta» significa hasta 3 intentos más por defecto. La espera empieza en 500 ms y se duplica, hasta 60 segundos. Cuando la API envía un `Retry-After`, se usa esa espera, salvo que supere `retry.maxDelay`: el error se lanza entonces enseguida, con su `retryAfter`.

Desde la API, como `MetamobApiError`:

| Código | Estado | Causa | Se reintenta |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | Un parámetro que la API rechaza | No |
| `UNAUTHORIZED` | 401 | La clave falta, no es válida o se ha revocado | No |
| `FORBIDDEN` | 403 | La clave no tiene derecho a hacer eso: el envío no está abierto en la cuenta, o uno de los dos jugadores ha bloqueado al otro | No |
| `NOT_FOUND` | 404 | No existe, o no es tuyo: una misión de otra cuenta, una misión oculta, un jugador borrado | No |
| `CONFLICT` | 409 | El estado no lo permite: una propuesta ya cancelada o ya aplicada por ti, o para la que te faltan ejemplares | No |
| `RATE_LIMITED` | 429 | Más de 60 solicitudes en un minuto con esta clave, o los límites antispam del sitio en un mensaje o una propuesta | Sí, salvo un mensaje o una propuesta |
| `SERVER_ERROR` | 500 o más | La API ha fallado | 502, 503, 504: sí, salvo un mensaje o una propuesta. 500: solo las lecturas |
| `API_ERROR` | cualquier otro | Otro estado de error | No |

Desde la solicitud, como `MetamobRequestError`:

| Código | Causa | Se reintenta |
| --- | --- | --- |
| `TIMEOUT` | Un intento no recibió ninguna respuesta en el plazo `timeout`, 30 segundos por defecto | Sí, salvo un mensaje o una propuesta |
| `NETWORK` | No se pudo hacer la solicitud: sin conexión, DNS, TLS | Sí, salvo un mensaje o una propuesta |
| `ABORTED` | Tu `signal` canceló la llamada | No |
| `PARSE_ERROR` | La API respondió 200 con algo que no es JSON | No |

Desde la biblioteca, como `MetamobArgumentError`, antes de cualquier envío:

| Código | Causa |
| --- | --- |
| `MISSING_API_KEY` | Ninguna clave en las opciones del cliente, ni en las opciones de la llamada, ni en `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | Un argumento que no puede ser correcto: un slug vacío, una cantidad negativa, una búsqueda de menos de 3 caracteres, una fecha con un formato incorrecto, un lote vacío, un mensaje de más de 1000 caracteres, una propuesta sin monstruos |
| `UNKNOWN_NAME` | Ningún monstruo, zona, subzona, servidor, versión o tipo tiene ese nombre. `suggestions` contiene los más parecidos |

## MetamobError

La base de las tres.

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | Uno de los códigos de arriba |
| `message` | `string` | El método, y luego lo que falló |
| `name` | `string` | El nombre de la clase |
| `cause` | `unknown` | El error de origen, cuando lo hay |

## MetamobApiError

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `status` | `number` | El estado HTTP |
| `method` | `string` | El método que falló, por ejemplo `quests.get` |
| `url` | `string` | La dirección llamada. Nunca contiene la clave |
| `messages` | `Record<string, string>` | Lo que dijo la API, por campo. A menudo `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | El número de segundos que la API pidió esperar, en un 429 |
| `body` | `unknown` | El cuerpo de la respuesta, analizado cuando es JSON |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

El mensaje de error de la API se encuentra en `message` y `messages`.

## MetamobRequestError

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `method` | `string` | El método que falló |
| `cause` | `unknown` | Lo que lanzó `fetch`, o el motivo de la cancelación |

## MetamobArgumentError

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `suggestions` | `readonly string[]` | Para `UNKNOWN_NAME`, los nombres existentes más parecidos, el mejor primero. Vacío en los demás casos |

## isMetamobError

```ts
function handle(error: unknown) {
  if (isMetamobError(error)) error.code; // cualquier error de la biblioteca
  if (isMetamobError(error, "NOT_FOUND")) error.message; // un solo código
}
```

Es una guarda de tipo: dentro de la rama, `error` es un `MetamobError`.
