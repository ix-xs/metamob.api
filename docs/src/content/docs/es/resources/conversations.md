---
title: Conversaciones
description: "Leer las conversaciones privadas de la cuenta, marcarlas como leídas y enviar un mensaje."
sidebar:
  order: 7
---

## Listar las conversaciones

`conversations.list()` da una conversación por interlocutor, la más reciente primero. Es una [lista](/basics/lists/) de 50 por página como máximo:

```ts
const page = await metamob.conversations.list();

for (const { username, unread_count } of page.items) {
  console.log(username, `${unread_count} unread`);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Sin `status`, se listan las conversaciones activas.

## Leer una conversación

`conversations.messages()` da lo que se ha intercambiado con un jugador, del más reciente al más antiguo. Los mensajes y las propuestas de intercambio llegan juntos, y `kind` los distingue:

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

Para mostrarlos en orden de lectura, invierte el array:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Retroceder en el tiempo

Los mensajes se paginan con un cursor: cada página da el de la siguiente, que se devuelve tal cual. `for await` se encarga de ello. A mano:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const beforeId = page.nextBeforeId;
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId });
}
```

No hay total para los mensajes: `page.total` y `count()` valen `undefined`. El número de elementos de una conversación es `message_count`, en la lista de conversaciones.

## Propuestas de intercambio

Una propuesta aparece en la conversación como un elemento cuyo `kind` vale `"proposal"`. Para todas las propuestas de la cuenta, filtradas por estado, por misión o por fecha, consulta [Propuestas de intercambio](/resources/trade-proposals/).

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const { monster_id, quantity } of item.monsters_given) {
    console.log("  given:", quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Una propuesta designa sus monstruos por su identificador: [`data.monster()`](/basics/embedded-data/) convierte un identificador en un monstruo sin solicitud.

Cuando eres el destinatario, recibes `monsters_given` y das `monsters_received`. Una propuesta tiene aquí los mismos campos que en [`tradeProposals.list()`](/resources/trade-proposals/), con `kind` además.

## Mensajes no leídos

`unread_count` cuenta lo que has recibido sin haberlo leído, propuestas incluidas. En una conversación, un elemento no leído tiene `read_at` a `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marcar como leído

`conversations.markAsRead()` marca como leído todo lo recibido de un jugador, como al abrir la conversación en el sitio. Devuelve el número de elementos marcados, `0` si no había ninguno:

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

## Enviar un mensaje

`conversations.send()` envía un mensaje privado de 1000 caracteres como máximo, y lo devuelve tal como aparece en la conversación:

```ts
const text = "Salut, ton Tofu Maléfique est toujours dispo ?";
const message = await metamob.conversations.send(username, text);
console.log(message.id, message.created_at);
```

:::note
El envío está cerrado por defecto: Metamob lo abre cuenta por cuenta, a petición, y sin eso la API responde `FORBIDDEN`. Las reglas son las del sitio: también `FORBIDDEN` cuando uno de los dos jugadores ha bloqueado al otro, `RATE_LIMITED` por encima de los límites antispam.
:::

Un mensaje nunca se reintenta, sea cual sea el fallo: enviado dos veces, llegaría dos veces. Después de un tiempo agotado o un corte de red, lee la conversación antes de reenviarlo.

## Límites y errores

- Confirmar o cancelar una propuesta se hace en el sitio.
- Un mensaje vacío, o de más de 1000 caracteres, se rechaza antes de enviarse.
- `markAsRead()` responde `NOT_FOUND` para un nombre de usuario que no existe.
- Un interlocutor puede no tener ya perfil: una cuenta borrada conserva sus conversaciones legibles durante 30 días, mientras que `users.get()` responde `NOT_FOUND`.
- Las conversaciones pertenecen a la cuenta de la clave. Nada de esto se guarda en caché por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `conversations.list({ status, limit, offset }, options?)` | una lista de `Conversation` |
| `conversations.messages(username, { limit, beforeId }, options?)` | una lista de `ConversationItem`, por cursor |
| `conversations.markAsRead(username, options?)` | `{ marked_count }` |
| `conversations.send(username, content, options?)` | `ConversationMessage` |

Una `Conversation`:

| Campo | Tipo |
| --- | --- |
| `username` | `string`, el interlocutor |
| `message_count` | `number`, propuestas incluidas |
| `unread_count` | `number`, recibidos y todavía no leídos |
| `has_priority_unread` | `boolean`, hay un mensaje prioritario del staff de Metamob sin leer |
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
| `is_priority` | `boolean`, un mensaje prioritario del staff de Metamob, que el sitio muestra en una ventana dorada mientras no se lee |

Una propuesta:

| Campo | Tipo |
| --- | --- |
| `kind` | `"proposal"` |
| `id` | `number` |
| `sender`, `recipient` | `string`, nombres de usuario |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null` |
| `quest_template` | `{ id, quest_type } \| null`, `null` cuando la misión se ha borrado |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null` |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, quién ha confirmado |
| `cancelled_at`, `cancelled_by` | `string \| null` |
| `created_at` | `string` |
| `read_at` | `string \| null` |
