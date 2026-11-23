---
title: Krakamor-Events
description: "Die Krakamor-Events eines Servers lesen, ihre Teilnehmer und ihre Nachrichten."
sidebar:
  order: 9
---

Um das Versteck von Krakamor zu öffnen, braucht es viele Leute: Die Spieler organisieren sich auf Metamob, rund um Events.

## Events auflisten

Ohne Filter gibt `kralove.list()` die Events ab heute zurück, auf allen Servern. `from` beginnt an einem anderen Tag:

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// Ab einem bestimmten Tag: ein Date oder "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

Ein Server ist ein Name, eine ID oder ein Objekt, siehe [Namen und IDs](/basics/names-and-ids/). Ein `Date` wird in UTC gelesen.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`organised by ${event.creator ?? "a deleted account"}`);
}
```

## Ein Event lesen

`kralove.get()` fügt die Teilnehmer und die Nachrichten hinzu. Es nimmt die ID des Events oder das Event selbst:

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

`updated_at` gibt die letzte Änderung am Event selbst an: sein Datum oder seine Beschreibung. Anmeldungen und Nachrichten ändern es nicht.

## Fehlende Namen

`creator` und der `username` eines Teilnehmers oder einer Nachricht können `null` sein: wenn das Konto gelöscht wurde oder wenn einer von Ihnen den anderen blockiert hat. Berücksichtigen Sie das überall, wo Sie einen Namen anzeigen.

Da eine Blockierung die Antwort von einem Schlüssel zum anderen ändert, werden Events standardmäßig nicht zwischengespeichert.

## Die nächste Öffnung ankündigen

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime).toLocaleString("fr-FR");
  await notify(`Kralamoure on ${when}: ${next.character_count} characters so far.`);
}
```

Eine Prüfung alle paar Minuten genügt. Um die Liste öfter zu lesen, ohne mehr Anfragen, speichern Sie sie zwischen: `cache: { methods: { "kralove.list": "5m" } }`.

## Grenzen und Fehler

- Die API liest Events. Eines erstellen, sich anmelden und eine Nachricht schreiben geschieht auf der Website.
- `NOT_FOUND` für ein Event, das nicht existiert oder das sein Ersteller abgesagt hat: Ein abgesagtes Event wird gelöscht.
- `from` in einem anderen Format als `YYYY-MM-DD` wirft `INVALID_ARGUMENT` vor dem Senden.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Kralove`](/reference/kralove/) | Die Krakamor-Events: Treffen, die Spieler organisieren, um gegen den Krakamor zu kämpfen. |
| [`KraloveEvent`](/reference/kralove-event/) | Ein Krakamor-Event, wie die Liste es zurückgibt. |
| [`KraloveEventDetail`](/reference/kralove-event-detail/) | Ein Krakamor-Event mit seinen Teilnehmern und seinen Nachrichten. |
| [`KraloveListParams`](/reference/kralove-list-params/) | Filter von [`Kralove.list`](/reference/kralove/). |
| [`KraloveMessage`](/reference/kralove-message/) | Eine Nachricht, die zu einem Krakamor-Event geschrieben wurde. |
| [`KraloveParticipant`](/reference/kralove-participant/) | Jemand, der an einem Krakamor-Event teilnimmt. |
<!-- exports:end -->
