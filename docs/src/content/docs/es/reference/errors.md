---
title: Códigos de error
description: "Todos los códigos de error que lanza la biblioteca, su causa, si ya hubo un reintento y las propiedades de cada clase de error. Úsala para saber qué significa un fallo."
---

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);
} catch (error) {
  if (error instanceof MetamobError) {
    error.code; // definido por la biblioteca, por ejemplo "NOT_FOUND"
    error.message; // "quests.setMonster: Quest not found"
  }
  throw error;
}
```

Todos los errores extienden `MetamobError` y llevan un `code`. [Errores](/basics/errors/) explica cómo tratarlos. Esta página es la tabla de consulta.

## Códigos

`code` es un `MetamobErrorCode`. Hay 14.

«Reintentada» significa hasta 3 intentos más por defecto. La espera empieza en 500 ms y se duplica, hasta 60 segundos. Cuando la API envía un `Retry-After`, se usa esa espera en su lugar, salvo si es más larga que `retry.maxDelay`: entonces el error se lanza de inmediato, con su `retryAfter`.

De la API, como `MetamobApiError`:

| Código | Estado | Causa | Reintentada |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | Un parámetro que la API rechaza. La biblioteca comprueba la mayoría antes del envío | No |
| `UNAUTHORIZED` | 401 | La clave falta, no es válida o fue revocada | No |
| `FORBIDDEN` | 403 | La clave no tiene permiso para hacer esto | No |
| `NOT_FOUND` | 404 | No existe, o no es tuyo: una misión de otra cuenta, una misión oculta, un jugador eliminado | No |
| `RATE_LIMITED` | 429 | Más de 60 solicitudes en un minuto con esta clave | Sí |
| `SERVER_ERROR` | 500 o más | La API falló | 502, 503, 504: sí. 500: solo las lecturas |
| `API_ERROR` | cualquier otro | Un estado de error para el que la biblioteca no tiene nombre | No |

De la solicitud, como `MetamobRequestError`:

| Código | Causa | Reintentada |
| --- | --- | --- |
| `TIMEOUT` | Un intento no obtuvo respuesta dentro de `timeout`, 30 segundos por defecto | Sí |
| `NETWORK` | No se pudo hacer la solicitud: sin conexión, DNS, TLS | Sí |
| `ABORTED` | Tu `signal` canceló la llamada | No |
| `PARSE_ERROR` | La API respondió 200 con algo que no es JSON | No |

De la biblioteca, como `MetamobArgumentError`, antes de enviar nada:

| Código | Causa |
| --- | --- |
| `MISSING_API_KEY` | Ninguna clave en las opciones del cliente, en las opciones de la llamada ni en `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | Un argumento que no puede ser correcto: un slug vacío, una cantidad negativa, una búsqueda de menos de 3 caracteres, una fecha con formato incorrecto, un lote vacío |
| `UNKNOWN_NAME` | Ningún monstruo, zona, subzona, servidor, versión o tipo tiene este nombre. `suggestions` contiene los más parecidos |

## MetamobError

La base de las tres clases.

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | Uno de los códigos anteriores |
| `message` | `string` | El método, y luego lo que falló |
| `name` | `string` | El nombre de la clase |
| `cause` | `unknown` | El error subyacente, cuando lo hay |

## MetamobApiError

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `status` | `number` | El estado HTTP |
| `method` | `string` | El método que falló, por ejemplo `quests.get` |
| `url` | `string` | La dirección llamada. Nunca contiene la clave |
| `messages` | `Record<string, string>` | Lo que dijo la API, por campo. A menudo `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | Segundos que la API pidió esperar, en un 429 |
| `body` | `unknown` | El cuerpo de la respuesta, analizado cuando es JSON |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

La API redacta sus errores de tres maneras según el endpoint. La biblioteca las lee todas y las pone en `message` y `messages`, así que nunca analizas `body` tú mismo.

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

## Ver también

- [Errores](/basics/errors/)
- [Solución de problemas](/help/troubleshooting/)
- [El límite de solicitudes](/basics/rate-limit/)
- [Todas las exportaciones](/reference/exports/)
