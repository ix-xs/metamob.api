---
title: Conversaciones
description: Lee las conversaciones privadas de la cuenta y, dentro de cada una, los mensajes y las propuestas de intercambio cruzados con un jugador. La API los lee, no envía ninguno.
sidebar:
  order: 7
---

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind === "message") console.log(`${item.sender}: ${item.content}`);
  else console.log(`${item.sender} proposed a trade (${item.status})`);
}
```

## Listar las conversaciones

Hay una conversación por interlocutor, la más reciente primero. Es una [lista](/basics/lists/), de 50 por página como máximo.

```ts
const page = await metamob.conversations.list();

for (const conversation of page.items) {
  console.log(conversation.username, conversation.message_count, conversation.last_message_at);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Sin `status`, se listan las conversaciones activas.

## Leer una conversación

`conversations.messages()` da lo que se ha cruzado con un jugador, de lo más reciente a lo más antiguo. Llegan mezclados dos tipos de elementos, que se distinguen por `kind`.

```ts
const latest = await metamob.conversations.messages(username).take(10);

for (const item of latest) {
  if (item.kind === "message") {
    item.content;
    item.sender;
    item.read_at; // null mientras no se ha leído
  }
}
```

Para mostrarlos en orden de lectura, invierte lo que has recogido:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Retroceder en el tiempo

Los mensajes se paginan con un cursor, no con un desplazamiento: cada página llega con el cursor de la siguiente. Reenvíalo tal cual: no es el identificador de un mensaje. Al recorrer la lista, se hace por ti. A mano:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId: page.nextBeforeId });
  older.items;
}
```

No hay total para los mensajes: `page.total` y `count()` valen `undefined`. El número de elementos de una conversación es `message_count` en la lista de conversaciones.

## Propuestas de intercambio

Una propuesta hecha en el sitio aparece en la conversación como un elemento de tipo `"proposal"`.

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const given of item.monsters_given) {
    console.log(`  given: ${given.quantity} x ${data.monster(given.monster_id)?.name.fr}`);
  }
  for (const received of item.monsters_received) {
    console.log(`  received: ${received.quantity} x ${data.monster(received.monster_id)?.name.fr}`);
  }
}
```

Una propuesta designa sus monstruos por identificador: [`data.monster()`](/basics/embedded-data/) convierte un identificador en un monstruo sin ninguna solicitud.

| `status` | Significado |
| --- | --- |
| `pending` | Nadie ha confirmado todavía |
| `half_applied` | Una de las partes ha confirmado: ver `applications` |
| `completed` | Las dos partes han confirmado |
| `cancelled` | Cancelada, en la fecha `cancelled_at` |

## Mensajes no leídos

La API no tiene contador de mensajes no leídos. Un mensaje que has recibido y no has abierto tiene `read_at` a `null`:

```ts
const me = await metamob.me();
const recent = await metamob.conversations.messages(username).take(50);

const unread = recent.filter((item) => item.kind === "message" && item.sender !== me.username && item.read_at === null);
```

## Límites y errores

- La API no envía mensajes, y no crea, confirma ni cancela propuestas.
- Un interlocutor puede no tener ya perfil: las conversaciones de una cuenta eliminada siguen siendo legibles durante 30 días, mientras que `users.get()` responde `NOT_FOUND`.
- Las conversaciones pertenecen a la cuenta de la clave. Nada de esto se guarda en caché por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | una lista de `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | una lista de `ConversationItem`, por cursor |

Un mensaje:

| Campo | Tipo |
| --- | --- |
| `kind` | `"message"` |
| `id` | `number` |
| `content` | `string` |
| `sender` | `string`, un nombre de usuario |
| `created_at` | `string` |
| `read_at` | `string \| null` |

Una propuesta:

| Campo | Tipo |
| --- | --- |
| `kind` | `"proposal"` |
| `id` | `number` |
| `sender`, `recipient` | `string`, nombres de usuario |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server_id` | `number` |
| `quest_type` | `{ id, slug } \| null`, `null` cuando la misión ha sido eliminada |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, quién ha confirmado |
| `cancelled_at` | `string \| null` |
| `created_at` | `string` |

## Ver también

- [Listas](/basics/lists/)
- [Intercambios](/resources/trading/)
- [Otros jugadores](/resources/users/)
- [Los datos del paquete](/basics/embedded-data/)
