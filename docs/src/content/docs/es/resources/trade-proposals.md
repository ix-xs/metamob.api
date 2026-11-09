---
title: Propuestas de intercambio
description: "Leer las propuestas de intercambio enviadas y recibidas, y enviar una."
sidebar:
  order: 8
---

Una propuesta de intercambio sale de una de tus misiones, hacia otro jugador. La API permite leerlas, aplicar tu lado o cancelarlas, y enviarlas cuando el envío está abierto en la cuenta. Cada una aparece también en la [conversación](/resources/conversations/#trade-proposals) con ese jugador.

## Listar las propuestas

`tradeProposals.list()` da las propuestas de la cuenta, la más reciente primero. Es una [lista](/basics/lists/) de 50 por página como máximo, paginada con un cursor como los mensajes:

```ts
const pending = { direction: "received", status: "pending" } as const;

const waiting = await metamob.tradeProposals.list(pending).all();
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const done = await metamob.tradeProposals.list({ quest: slug, status: "completed" });
```

| Filtro | Valores |
| --- | --- |
| `direction` | `"received"`: las que te han hecho. `"sent"`: las que has hecho tú. `"all"`, el valor por defecto: las dos |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"` |
| `quest` | El slug de una de tus misiones |
| `since` | Una `Date`, o una fecha ISO 8601 con su zona horaria como `"2026-01-27T14:00:00Z"`: solo las propuestas creadas a partir de ese momento, incluido |

Una fecha sin zona horaria, o que la API no sabría leer, se rechaza antes de cualquier solicitud.

## Quién da qué

`monsters_given` es lo que da el remitente, `monsters_received` lo que recibe el remitente. Cuando eres el destinatario, léelos en el otro sentido: recibes `monsters_given` y das `monsters_received`.

```ts
const me = await metamob.me();

for await (const proposal of metamob.tradeProposals.list({ status: "pending" })) {
  const mine = proposal.recipient === me.username;
  const incoming = mine ? proposal.monsters_given : proposal.monsters_received;

  for (const { monster_id, quantity } of incoming) {
    console.log(proposal.id, quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Una propuesta designa sus monstruos por su identificador: [`data.monster()`](/basics/embedded-data/) convierte un identificador en un monstruo sin solicitud.

| `status` | Significado |
| --- | --- |
| `pending` | Nadie ha aplicado todavía su lado |
| `half_applied` | Uno de los dos jugadores ha aplicado su lado: consulta `applications` |
| `completed` | Los dos lados están aplicados |
| `cancelled` | Cancelada por `cancelled_by`, o caducada cuando `cancelled_by` vale `null` |

## Leer una propuesta

`tradeProposals.get()` toma un identificador, o una propuesta sacada de una lista. La respuesta añade `viewer`, tu lado de la propuesta: tu papel, si aplicaste tu lado, lo que sale de tu misión (`removed`) y lo que entra (`added`).

```ts
const proposal = await metamob.tradeProposals.get(57);

proposal.viewer.role; // "sender" o "recipient"
proposal.viewer.applied; // aplicaste tu lado

for (const { monster_id, owned, quantity } of proposal.viewer.added) {
  const name = data.monster(monster_id)?.name.fr;
  console.log(name, `${owned ?? 0} owned, ${quantity} coming`);
}
```

Cada monstruo de `removed` y de `added` lleva `owned`: el número de ejemplares que posees ahora. Una vez aplicado tu lado, ya lo tiene en cuenta. Vale `null` cuando no tienes ninguna misión de ese tipo en ese servidor.

`create()`, `apply()` y `cancel()` devuelven la propuesta con la misma forma.

## Hacer una propuesta

`tradeProposals.create()` envía una propuesta desde una de tus misiones. Sus campos llevan los mismos nombres que en la lectura: `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` y `monsters_received`. Los monstruos se escriben como para [`quests.setMonsters()`](/resources/quests/#recording-many-monsters), por identificador o por nombre:

```ts
// Un socio y su misión, tal como los encuentra matches().
const match = await metamob.quests.matches(slug).first();

if (match) {
  const proposal = await metamob.tradeProposals.create({
    recipient: match.user.username,
    sender_quest: slug,
    recipient_quest: match.quest.slug,
    monsters_given: { "Tofu Maléfique": 1 },
    monsters_received: { "Bouftou Royal": 1 },
  });
  console.log(proposal.id, proposal.status); // "pending"
}
```

`recipient`, `sender_quest` y `recipient_quest` son obligatorios. `recipient_quest` es el slug de la misión del otro jugador, que `quests.matches()` da para cada socio. Las dos misiones deben ser del mismo tipo y estar en el mismo servidor. Hace falta al menos un monstruo, de un lado o del otro, y 200 como máximo en cada lado.

:::note
El envío está cerrado por defecto: Metamob lo abre cuenta por cuenta, a petición, y sin eso la API responde `FORBIDDEN`. Las reglas son las del sitio: `FORBIDDEN` cuando uno de los dos jugadores ha bloqueado al otro, `RATE_LIMITED` por encima de los límites antispam.
:::

Una propuesta nunca se reintenta, sea cual sea el fallo: enviada dos veces, existiría por duplicado. Después de un tiempo agotado o un corte de red, consulta `list({ direction: "sent" })` antes de reenviarla.

## Aplicar una propuesta

`tradeProposals.apply()` aplica tu lado de la propuesta a tu misión: lo que das sale de ella, lo que recibes entra. Vale para el remitente y para el destinatario, y la propuesta pasa a `completed` cuando los dos lados están aplicados. A diferencia del envío, está abierto a todas las claves:

```ts
const proposal = await metamob.tradeProposals.apply(57);

proposal.status; // "half_applied", o "completed" si el otro lado ya lo estaba
proposal.viewer.applied; // true
```

Si te faltan ejemplares de un monstruo que das, no se modifica nada y la API responde `CONFLICT`, con lo que posees y lo que se pide. Con `allowPartial: true`, la propuesta se aplica igualmente, con cada cantidad reducida a lo que posees: `viewer.clamped` vale entonces `true`, y `applied_quantity` da lo que se movió de verdad para cada monstruo.

```ts
const proposal = await metamob.tradeProposals.apply(57, { allowPartial: true });
const { clamped, removed } = proposal.viewer;

if (clamped) {
  for (const { monster_id, quantity, applied_quantity } of removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // lo que se movió de verdad
  }
}
```

Aplicar dos veces, o aplicar una propuesta cancelada, también responde `CONFLICT`. `apply()` nunca se reintenta: tras un tiempo de espera agotado, vuelve a leer la propuesta con `get()` antes de intentarlo de nuevo.

## Cancelar o rechazar

`tradeProposals.cancel()` cancela una propuesta que enviaste, o rechaza una que recibiste. Es posible mientras no hayas aplicado tu lado, aunque el otro jugador haya aplicado el suyo:

```ts
const proposal = await metamob.tradeProposals.cancel(57);

proposal.status; // "cancelled"
```

Una propuesta ya cancelada, o que ya aplicaste, responde `CONFLICT`. Como `apply()`, `cancel()` nunca se reintenta.

## Vigilar las nuevas propuestas

Consultada con regularidad con `since`, la lista da lo que ha llegado desde la última vez, por ejemplo para un bot que te avisa:

```ts
let lastCheck = new Date();

setInterval(async () => {
  const since = lastCheck;
  lastCheck = new Date();

  const fresh = await metamob.tradeProposals
    .list({ direction: "received", since })
    .all();
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` sigue a `null` mientras el destinatario no haya abierto la propuesta en el sitio.

## Límites y errores

- `apply()` y `cancel()` responden `NOT_FOUND` para una propuesta que no existe o en la que no participas, y `CONFLICT` para una propuesta ya cancelada, ya aplicada por ti, o cuya misión tuya se eliminó.
- `create()` rechaza antes del envío una propuesta sin ningún monstruo, una cantidad fuera del rango de 1 a 99, un monstruo nombrado dos veces en el mismo lado, o más de 200 monstruos en un mismo lado.
- La API responde `BAD_REQUEST` para un monstruo que no está en la misión, para un monstruo del que das más ejemplares de los que tienes, o para dos misiones de tipos o servidores distintos, y `NOT_FOUND` para una misión que no existe o, en el caso de `sender_quest`, que no es tuya.
- `NOT_FOUND` para una propuesta que no existe o que no es tuya.
- `BAD_REQUEST` para una `quest` que no es una de tus misiones, y para un `direction` o un `status` que la API no conoce.
- Un identificador, una misión o una fecha no válidos se rechazan antes de enviarse.
- Las propuestas pertenecen a la cuenta de la clave. Nada de esto se guarda en caché por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | una lista de `TradeProposal`, por cursor |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |
| `tradeProposals.create({ recipient, sender_quest, recipient_quest, monsters_given, monsters_received }, options?)` | `TradeProposalDetail` |
| `tradeProposals.apply(id, { allowPartial }?, options?)` | `TradeProposalDetail` |
| `tradeProposals.cancel(id, options?)` | `TradeProposalDetail` |

Una `TradeProposal`:

| Campo | Tipo |
| --- | --- |
| `id` | `number` |
| `sender`, `recipient` | `string`, nombres de usuario |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null`, con su versión del juego |
| `quest_template` | `{ id, quest_type } \| null`, `null` cuando la misión se ha borrado |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null`, `null` cuando no es visible |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, quién ha confirmado |
| `cancelled_at` | `string \| null` |
| `cancelled_by` | `string \| null`, `null` cuando ha caducado |
| `created_at` | `string` |
| `read_at` | `string \| null`, `null` mientras el destinatario no la ha leído |

Una `TradeProposalDetail` es una `TradeProposal` con `viewer`: `role` (`"sender" | "recipient"`), `applied` (`boolean`), `clamped` (`boolean | null`), `removed` y `added` (`{ monster_id, quantity, owned }[]`, con `applied_quantity` en la respuesta de `apply()`).
