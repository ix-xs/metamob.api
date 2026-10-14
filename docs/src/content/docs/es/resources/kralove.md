---
title: Eventos Kralamar
description: Abrir la guarida del Kralamar gigante requiere mucha gente, así que los jugadores lo organizan en Metamob. Lee los próximos eventos de un servidor, quién se ha apuntado y qué se ha dicho.
sidebar:
  order: 8
---

```ts
const events = await metamob.kralove.list({ server: "Draconiros" });

for (const event of events) {
  console.log(event.event_datetime, `${event.character_count} characters signed up`);
}
```

## Listar los eventos

Sin filtros, `kralove.list()` devuelve los eventos a partir de hoy, en todos los servidores. Los eventos pasados quedan fuera, salvo que pidas desde un día anterior.

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// A partir de un día concreto: un Date o "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

Un servidor es un nombre, un identificador o un objeto, ver [Nombres e identificadores](/basics/names-and-ids/). Un `Date` se lee en UTC.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`${event.messages_count} messages, organised by ${event.creator ?? "a deleted account"}`);
}
```

## Leer un evento

`kralove.get()` añade los participantes y los mensajes. Acepta el identificador del evento, o el propio evento.

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const event = await metamob.kralove.get(next);

  for (const participant of event.participants) {
    console.log(participant.username ?? "a deleted account", `x${participant.character_count}`);
  }
  for (const message of event.messages) {
    console.log(`${message.username ?? "a deleted account"}: ${message.content}`);
  }
}
```

## Nombres que faltan

`creator`, y el `username` de un participante o de un mensaje, pueden valer `null`. Ocurre cuando la cuenta se ha eliminado definitivamente, o cuando hay un bloqueo mutuo entre ese jugador y tú. Tenlo en cuenta allí donde muestres un nombre.

Como el bloqueo cambia la respuesta de una clave a otra, los eventos no se guardan en caché por defecto.

## Anunciar la próxima apertura

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime);
  await notify(`Kralamoure on ${when.toLocaleString("fr-FR")}: ${next.character_count} characters so far.`);
}
```

Comprobarlo una vez cada pocos minutos es más que suficiente. Para comprobarlo más a menudo sin gastar más solicitudes, guarda la lista en caché: `cache: { methods: { "kralove.list": "5m" } }`.

## Límites y errores

- La API lee los eventos. Crear uno, apuntarse y publicar un mensaje se hace en el sitio.
- `NOT_FOUND` para un evento que no existe.
- `from` en un formato distinto de `YYYY-MM-DD` lanza `INVALID_ARGUMENT` antes de gastar una solicitud.

## Referencia

| Método | Devuelve |
| --- | --- |
| `kralove.list({ server, from }, options?)` | `KraloveEvent[]` |
| `kralove.get(id, options?)` | `KraloveEventDetail` |

Un evento:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `id` | `number` | |
| `event_datetime` | `string` | Cuándo, como fecha ISO 8601 en UTC: `2026-01-27T20:00:00Z` |
| `description` | `string` | Lo que ha escrito el organizador |
| `creator` | `string \| null` | El organizador |
| `server` | `Server \| null` | Dónde |
| `participants_count`, `character_count`, `messages_count` | `number` | Solo con `list()` |
| `participants` | `{ username, character_count }[]` | Solo con `get()` |
| `messages` | `{ username, content, created_at }[]` | Solo con `get()` |

## Ver también

- [Datos de referencia](/resources/reference-data/)
- [Caché](/basics/caching/)
- [Nombres e identificadores](/basics/names-and-ids/)
- [Otros jugadores](/resources/users/)
