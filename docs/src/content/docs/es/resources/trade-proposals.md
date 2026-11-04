---
title: Propuestas de intercambio
description: Sigue las propuestas de intercambio que has enviado y recibido en todas tus misiones, fíltralas por dirección, estado, misión o fecha, mira cuántos tienes de cada monstruo antes de responder, y propón un intercambio.
sidebar:
  order: 8
---

```ts
const waiting = await metamob.tradeProposals.list({ direction: "received", status: "pending" }).all();

for (const proposal of waiting) {
  console.log(`${proposal.sender} proposes a trade on ${proposal.server?.name}`);
}
```

Una propuesta de intercambio se hace desde una misión, a otro jugador. La API las lee, y crea nuevas cuando el envío está abierto en la cuenta. Confirmarlas o cancelarlas se hace en el sitio. Cada una aparece también en la [conversación](/resources/conversations/#trade-proposals) con ese jugador.

## Listar las propuestas

`tradeProposals.list()` da las propuestas de la cuenta, la más reciente primero. Es una [lista](/basics/lists/), de 50 por página como máximo, paginada con un cursor como los mensajes.

```ts
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const onQuest = await metamob.tradeProposals.list({ quest: slug, status: "completed" }).all();
```

| Filtro | Valores |
| --- | --- |
| `direction` | `"received"`: las que te han hecho. `"sent"`: las que has hecho tú. `"all"`, por defecto: las dos |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"` |
| `quest` | El slug de una de tus misiones |
| `since` | Un `Date`, o una fecha ISO 8601 con su zona horaria como `"2026-01-27T14:00:00Z"`: solo las propuestas creadas a partir de ese momento, incluido |

Una fecha sin zona horaria, o una que la API no sabría leer, se rechaza antes de cualquier solicitud.

## Quién da qué

`monsters_given` es lo que da el remitente, `monsters_received` lo que recibe el remitente. Cuando eres el destinatario, léelo al revés: recibes `monsters_given` y das `monsters_received`.

```ts
const me = await metamob.me();

for await (const proposal of metamob.tradeProposals.list({ status: "pending" })) {
  const mine = proposal.recipient === me.username;
  const incoming = mine ? proposal.monsters_given : proposal.monsters_received;
  console.log(proposal.id, incoming.map((monster) => `${monster.quantity} x ${data.monster(monster.monster_id)?.name.fr}`));
}
```

Una propuesta designa sus monstruos por identificador: [`data.monster()`](/basics/embedded-data/) convierte un identificador en un monstruo sin ninguna solicitud.

| `status` | Significado |
| --- | --- |
| `pending` | Nadie ha confirmado todavía |
| `half_applied` | Una de las partes ha confirmado: ver `applications` |
| `completed` | Las dos partes han confirmado |
| `cancelled` | Cancelada por `cancelled_by`, o caducada cuando `cancelled_by` vale `null` |

## Leer una propuesta

`tradeProposals.get()` recibe un identificador, o una propuesta de una lista. Leída por separado, cada monstruo llega con `owned`: cuántos tienes ahora en tu misión afectada por la propuesta.

```ts
const proposal = await metamob.tradeProposals.get(57);

for (const monster of proposal.monsters_given) {
  console.log(data.monster(monster.monster_id)?.name.fr, `${monster.owned ?? 0} owned, ${monster.quantity} in the proposal`);
}
```

`owned` es la cantidad de ahora, no la del día en que se hizo la propuesta: una vez aplicado el intercambio, ya lo incluye. Vale `null` cuando no tienes ninguna misión de ese tipo en ese servidor.

## Hacer una propuesta

`tradeProposals.create()` propone un intercambio desde una de tus misiones. Recibe los mismos nombres que la API devuelve al leer: `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` y `monsters_received`. Los monstruos llegan en las formas que acepta [`quests.setMonsters()`](/resources/quests/#recording-many-monsters), designados por identificador o por nombre en cualquier idioma.

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

Los tres son obligatorios: `recipient`, tu `sender_quest`, y `recipient_quest`, el slug de la misión del otro jugador, tal como lo da `quests.matches()`. Las dos misiones deben ser del mismo tipo y estar en el mismo servidor. Una propuesta necesita al menos un monstruo, de un lado o del otro, y acepta 200 como máximo en cada lado. Lo que encuentra `quests.matches()` es un buen punto de partida: cada coincidencia indica el jugador y lo que puede ir en un sentido y en el otro.

El envío está cerrado por defecto: Metamob lo abre cuenta por cuenta, a petición, y sin él la API responde `FORBIDDEN`. Las reglas son las del sitio: `FORBIDDEN` cuando uno de los dos jugadores ha bloqueado al otro, `RATE_LIMITED` al superar sus límites antispam.

Una propuesta nunca se reintenta, sea cual sea el fallo: enviada dos veces, existiría dos veces. Tras un tiempo de espera agotado o un fallo de red, mira `list({ direction: "sent" })` antes de volver a proponer.

## Vigilar las nuevas propuestas

Consultada cada pocos minutos con `since`, la lista te dice lo que ha llegado entretanto, por ejemplo para un bot que te avise.

```ts
let lastCheck = new Date();

setInterval(async () => {
  const now = new Date();
  const fresh = await metamob.tradeProposals.list({ direction: "received", since: lastCheck }).all();
  lastCheck = now;
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` sigue a `null` hasta que el destinatario abre la propuesta en el sitio.

## Límites y errores

- Confirmar o cancelar una propuesta se hace en el sitio.
- `create()` rechaza antes de enviarla una propuesta sin ningún monstruo, una cantidad fuera de 1 a 99, un monstruo nombrado dos veces en un mismo lado, o más de 200 en un lado.
- La API responde `BAD_REQUEST` para un monstruo que no está en la misión o para dos misiones de tipos o servidores distintos, y `NOT_FOUND` para una misión que no existe o, para `sender_quest`, que no es tuya.
- La API no comprueba que tengas lo que das.
- `NOT_FOUND` para una propuesta que no existe o que no es tuya.
- `BAD_REQUEST` para una `quest` que no es una de tus misiones, y para un `direction` o un `status` que la API no conoce.
- Un identificador, una misión o una fecha no válidos se rechazan antes de enviarse.
- Las propuestas pertenecen a la cuenta de la clave. Nada de esto se guarda en caché por defecto.

## Referencia

| Método | Devuelve |
| --- | --- |
| `tradeProposals.list({ direction, status, quest, since, limit, beforeId }, options?)` | una lista de `TradeProposal`, por cursor |
| `tradeProposals.get(id, options?)` | `TradeProposalDetail` |
| `tradeProposals.create({ recipient, sender_quest, recipient_quest, monsters_given, monsters_received }, options?)` | `TradeProposal` |

Una `TradeProposal`:

| Campo | Tipo |
| --- | --- |
| `id` | `number` |
| `sender`, `recipient` | `string`, nombres de usuario |
| `status` | `"pending" \| "half_applied" \| "completed" \| "cancelled"` |
| `server` | `Server \| null`, con su versión del juego |
| `quest_template` | `{ id, quest_type } \| null`, `null` cuando la misión ha sido eliminada |
| `sender_quest`, `recipient_quest` | `{ slug, character_name } \| null`, `null` cuando no es visible |
| `monsters_given`, `monsters_received` | `{ monster_id, quantity }[]` |
| `applications` | `{ username, created_at }[]`, quién ha confirmado |
| `cancelled_at` | `string \| null` |
| `cancelled_by` | `string \| null`, `null` cuando ha caducado |
| `created_at` | `string` |
| `read_at` | `string \| null`, `null` mientras el destinatario no la ha leído |

Una `TradeProposalDetail` es igual, con `owned: number | null` en cada monstruo.

## Ver también

- [Conversaciones](/resources/conversations/)
- [Intercambios](/resources/trading/)
- [Listas](/basics/lists/)
- [Los datos del paquete](/basics/embedded-data/)
