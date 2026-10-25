---
title: Conversaciones
description: Lee las conversaciones privadas de la cuenta y, dentro de cada una, los mensajes y las propuestas de intercambio cruzados con un jugador, ve lo que está sin leer y márcalo como leído. La API no envía mensajes.
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
  console.log(conversation.username, `${conversation.unread_count} unread of ${conversation.message_count}`);
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

Una propuesta hecha en el sitio aparece en la conversación como un elemento de tipo `"proposal"`. Para seguir todas las propuestas de la cuenta a la vez, filtradas por estado, misión o fecha, consulta [Propuestas de intercambio](/resources/trade-proposals/).

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

Cuando eres el destinatario, recibes `monsters_given` y das `monsters_received`. Una propuesta tiene aquí los mismos campos que en [`tradeProposals.list()`](/resources/trade-proposals/), con `kind` además.

## Mensajes no leídos

Cada conversación cuenta en `unread_count` lo que has recibido y todavía no has leído, propuestas de intercambio incluidas. Dentro de una conversación, un elemento que no has abierto tiene `read_at` a `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marcar como leído

`conversations.markAsRead()` marca como leído todo lo recibido de un jugador, propuestas incluidas, como lo haría abrir la conversación en el sitio. Responde cuántos elementos ha marcado: `0` cuando no había nada sin leer.

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

Es la única escritura de las conversaciones: la API no envía mensajes.

## Límites y errores

- La API no envía mensajes, y no crea, confirma ni cancela propuestas.
- `markAsRead()` responde `NOT_FOUND` para un nombre de usuario que no existe.
- Un interlocutor puede no tener ya perfil: las conversaciones de una cuenta eliminada siguen siendo legibles durante 30 días, mientras que `users.get()` responde `NOT_FOUND`.
- Las conversaciones pertenecen a la cuenta de la clave. Nada de esto se guarda en caché por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | una lista de `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | una lista de `ConversationItem`, por cursor |
| `conversations.markAsRead(username, options?)` | `{ marked_count }` |

Una `Conversation`:

| Campo | Tipo |
| --- | --- |
| `username` | `string`, el interlocutor |
| `message_count` | `number`, propuestas incluidas |
| `unread_count` | `number`, recibidos y todavía no leídos |
| `last_message_at` | `string` |

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
| `server` | `Server \| null` |
| `quest_template` | `{ id, quest_type } \| null`, `null` cuando la misión ha sido eliminada |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null` |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, quién ha confirmado |
| `cancelled_at`, `cancelled_by` | `string \| null` |
| `created_at` | `string` |
| `read_at` | `string \| null` |

## Ver también

- [Listas](/basics/lists/)
- [Propuestas de intercambio](/resources/trade-proposals/)
- [Intercambios](/resources/trading/)
- [Otros jugadores](/resources/users/)
- [Los datos del paquete](/basics/embedded-data/)
