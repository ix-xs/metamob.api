---
title: Eventos Kralamar
description: "Leer los eventos Kralamar de un servidor, sus participantes y sus mensajes."
sidebar:
  order: 9
---

Abrir la guarida del Kralamar gigante requiere mucha gente: los jugadores se organizan en Metamob, alrededor de eventos.

## Listar los eventos

Sin filtro, `kralove.list()` devuelve los eventos a partir de hoy, en todos los servidores. `from` empieza en otro día:

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// A partir de un día dado: una Date o "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

Un servidor es un nombre, un identificador o un objeto, consulta [Nombres e identificadores](/basics/names-and-ids/). Una `Date` se lee en UTC.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`organised by ${event.creator ?? "a deleted account"}`);
}
```

## Leer un evento

`kralove.get()` añade los participantes y los mensajes. Toma el identificador del evento, o el propio evento:

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const event = await metamob.kralove.get(next);

  for (const { username, character_count } of event.participants) {
    console.log(username ?? "a deleted account", `x${character_count}`);
  }
  for (const { username, content } of event.messages) {
    console.log(`${username ?? "a deleted account"}: ${content}`);
  }
}
```

## Los nombres que faltan

`creator`, y el `username` de un participante o de un mensaje, pueden valer `null`: cuando la cuenta se ha borrado, o cuando uno de los dos ha bloqueado al otro. Tenlo en cuenta en todos los sitios donde muestres un nombre.

Como un bloqueo cambia la respuesta de una clave a otra, los eventos no se guardan en caché por defecto.

## Anunciar la próxima apertura

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime).toLocaleString("fr-FR");
  await notify(`Kralamoure on ${when}: ${next.character_count} characters so far.`);
}
```

Basta con una comprobación cada pocos minutos. Para leer la lista más a menudo sin más solicitudes, guárdala en caché: `cache: { methods: { "kralove.list": "5m" } }`.

## Límites y errores

- La API lee los eventos. Crear uno, apuntarse y publicar un mensaje se hacen en el sitio.
- `NOT_FOUND` para un evento que no existe.
- `from` en otro formato que `YYYY-MM-DD` lanza `INVALID_ARGUMENT` antes del envío.

## Referencia

| Método | Devuelve |
| --- | --- |
| `kralove.list({ server, from }, options?)` | `KraloveEvent[]` |
| `kralove.get(id, options?)` | `KraloveEventDetail` |

Un evento:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `id` | `number` | |
| `event_datetime` | `string` | Cuándo, en fecha ISO 8601 UTC: `2026-01-27T20:00:00Z` |
| `description` | `string` | Lo que escribió el organizador |
| `creator` | `string \| null` | El organizador |
| `server` | `Server \| null` | Dónde |
| `participants_count`, `character_count`, `messages_count` | `number` | Solo con `list()` |
| `participants` | `{ username, character_count }[]` | Solo con `get()` |
| `messages` | `{ username, content, created_at }[]` | Solo con `get()` |
