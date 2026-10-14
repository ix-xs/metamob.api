---
title: Kralamoure events
description: Opening the lair of the Giant Kralove takes a crowd, so players plan it on Metamob. Read the coming events of a server, who signed up and what was said.
sidebar:
  order: 8
---

```ts
const events = await metamob.kralove.list({ server: "Draconiros" });

for (const event of events) {
  console.log(event.event_datetime, `${event.character_count} characters signed up`);
}
```

## Listing events

Without filters, `kralove.list()` returns the events from today on, on every server. Past events are left out unless you ask from an earlier day.

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// From a given day: a Date or "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

A server is a name, an id or an object, see [Names and ids](/basics/names-and-ids/). A `Date` is read in UTC.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`${event.messages_count} messages, organised by ${event.creator ?? "a deleted account"}`);
}
```

## Reading one event

`kralove.get()` adds the participants and the messages. It takes the id of the event, or the event itself.

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

## Names that are missing

`creator`, and the `username` of a participant or of a message, can be `null`. It happens when the account was deleted for good, or when you and that player blocked each other. Handle it wherever you print a name.

Because blocking changes the answer from one key to another, events are not cached by default.

## Announcing the next opening

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime);
  await notify(`Kralamoure on ${when.toLocaleString("fr-FR")}: ${next.character_count} characters so far.`);
}
```

Checking once every few minutes is plenty. To check more often without more requests, cache the list: `cache: { methods: { "kralove.list": "5m" } }`.

## Limits and errors

- The API reads events. Creating one, signing up and posting a message are done on the site.
- `NOT_FOUND` for an event that does not exist.
- `from` in another format than `YYYY-MM-DD` throws `INVALID_ARGUMENT` before a request is spent.

## Reference

| Method | Returns |
| --- | --- |
| `kralove.list({ server, from }, options?)` | `KraloveEvent[]` |
| `kralove.get(id, options?)` | `KraloveEventDetail` |

An event:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `number` | |
| `event_datetime` | `string` | When, as an ISO 8601 date in UTC: `2026-01-27T20:00:00Z` |
| `description` | `string` | What the organiser wrote |
| `creator` | `string \| null` | The organiser |
| `server` | `Server \| null` | Where |
| `participants_count`, `character_count`, `messages_count` | `number` | Only from `list()` |
| `participants` | `{ username, character_count }[]` | Only from `get()` |
| `messages` | `{ username, content, created_at }[]` | Only from `get()` |

## See also

- [Reference data](/resources/reference-data/)
- [Caching](/basics/caching/)
- [Names and ids](/basics/names-and-ids/)
- [Other players](/resources/users/)
