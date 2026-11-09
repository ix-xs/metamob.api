---
title: Kralamoure events
description: "Read the Kralamoure events of a server, their participants and their messages."
sidebar:
  order: 9
---

Opening the lair of the Giant Kralove takes a lot of people: players organise it on Metamob, around events.

## Listing events

Without filters, `kralove.list()` returns the events from today on, on every server. `from` starts from another day:

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
  console.log(`organised by ${event.creator ?? "a deleted account"}`);
}
```

## Reading one event

`kralove.get()` adds the participants and the messages. It takes the id of the event, or the event itself:

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

## Names that are missing

`creator`, and the `username` of a participant or of a message, can be `null`: when the account was deleted, or when one of you blocked the other. Plan for it wherever you show a name.

Because a block changes the answer from one key to another, events are not cached by default.

## Announcing the next opening

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime).toLocaleString("fr-FR");
  await notify(`Kralamoure on ${when}: ${next.character_count} characters so far.`);
}
```

A check every few minutes is enough. To read the list more often without more requests, cache it: `cache: { methods: { "kralove.list": "5m" } }`.

## Limits and errors

- The API reads events. Creating one, signing up and posting a message are done on the site.
- `NOT_FOUND` for an event that does not exist.
- `from` in another format than `YYYY-MM-DD` throws `INVALID_ARGUMENT` before sending.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Kralove`](/reference/kralove/) | The Kralamoure events: meetings players organise to fight the Kralove. |
| [`KraloveEvent`](/reference/kralove-event/) | A Kralamoure event, as the list returns it. |
| [`KraloveEventDetail`](/reference/kralove-event-detail/) | A Kralamoure event with its participants and its messages. |
| [`KraloveListParams`](/reference/kralove-list-params/) | Filters of [`Kralove.list`](/reference/kralove/). |
| [`KraloveMessage`](/reference/kralove-message/) | A message posted on a Kralamoure event. |
| [`KraloveParticipant`](/reference/kralove-participant/) | Someone taking part in a Kralamoure event. |
<!-- exports:end -->
