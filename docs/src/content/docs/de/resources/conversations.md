---
title: Unterhaltungen
description: "Die privaten Unterhaltungen des Kontos lesen, als gelesen markieren und eine Nachricht senden."
sidebar:
  order: 7
---

## Unterhaltungen auflisten

`conversations.list()` liefert eine Unterhaltung pro Gesprächspartner, die neueste zuerst. Es ist eine [Liste](/basics/lists/) mit höchstens 50 pro Seite:

```ts
const page = await metamob.conversations.list();

for (const { username, unread_count } of page.items) {
  console.log(username, `${unread_count} unread`);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Ohne `status` werden die aktiven Unterhaltungen aufgelistet.

## Eine Unterhaltung lesen

`conversations.messages()` liefert, was mit einem Spieler ausgetauscht wurde, vom neuesten zum ältesten. Nachrichten und Tauschvorschläge kommen zusammen, und `kind` unterscheidet sie:

```ts
const latest = await metamob.conversations.messages(username).take(10);

for (const item of latest) {
  if (item.kind === "message") {
    item.content;
    item.sender;
    item.read_at; // null, solange sie ungelesen ist
  }
}
```

Um sie in Lesereihenfolge anzuzeigen, kehren Sie das Array um:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## In der Zeit zurückgehen

Nachrichten werden mit einem Cursor seitenweise geliefert: Jede Seite gibt den der nächsten an, der unverändert zurückzusenden ist. `for await` übernimmt das. Von Hand:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const beforeId = page.nextBeforeId;
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId });
}
```

Für Nachrichten gibt es keine Gesamtzahl: `page.total` und `count()` sind `undefined`. Die Anzahl der Elemente einer Unterhaltung ist `message_count`, in der Liste der Unterhaltungen.

## Tauschvorschläge

Ein Vorschlag erscheint in der Unterhaltung als Element, dessen `kind` `"proposal"` ist. Für alle Vorschläge des Kontos, gefiltert nach Zustand, Quest oder Datum, siehe [Tauschvorschläge](/resources/trade-proposals/).

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const { monster_id, quantity } of item.monsters_given) {
    console.log("  given:", quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Ein Vorschlag bezeichnet seine Monster über ihre ID: [`data.monster()`](/basics/embedded-data/) macht aus einer ID ein Monster, ohne Anfrage.

Wenn Sie der Empfänger sind, erhalten Sie `monsters_given` und geben `monsters_received`. Ein Vorschlag hat hier dieselben Felder wie in [`tradeProposals.list()`](/resources/trade-proposals/), mit `kind` obendrauf.

## Ungelesene Nachrichten

`unread_count` zählt, was Sie erhalten haben, ohne es zu lesen, Vorschläge eingeschlossen. Innerhalb einer Unterhaltung hat ein ungelesenes Element `read_at` auf `null` gesetzt.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Als gelesen markieren

`conversations.markAsRead()` markiert alles, was von einem Spieler empfangen wurde, als gelesen, so wie das Öffnen der Unterhaltung auf der Website. Es gibt die Anzahl der markierten Elemente zurück, `0`, wenn es keine gab:

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

## Eine Nachricht senden

`conversations.send()` sendet eine private Nachricht mit höchstens 1000 Zeichen und gibt sie so zurück, wie sie in der Unterhaltung erscheint:

```ts
const text = "Salut, ton Tofu Maléfique est toujours dispo ?";
const message = await metamob.conversations.send(username, text);
console.log(message.id, message.created_at);
```

:::note
Das Senden ist standardmäßig gesperrt: Metamob schaltet es Konto für Konto frei, auf Anfrage, und ohne Freischaltung antwortet die API `FORBIDDEN`. [`features`](/resources/account/#what-the-account-can-do) sagt, ob es freigeschaltet ist. Die Regeln sind die der Website: ebenfalls `FORBIDDEN`, wenn einer der beiden Spieler den anderen blockiert hat, `RATE_LIMITED` jenseits der Anti-Spam-Limits.
:::

Eine Nachricht wird nie wiederholt, egal welcher Fehler: Zweimal gesendet, käme sie zweimal an. Lesen Sie nach einer Zeitüberschreitung oder einem Netzwerkfehler die Unterhaltung, bevor Sie sie erneut senden.

## Grenzen und Fehler

- Einen Vorschlag anwenden, rückgängig machen oder abbrechen geschieht mit [`tradeProposals`](/resources/trade-proposals/).
- Eine leere Nachricht oder eine mit mehr als 1000 Zeichen wird vor dem Senden abgelehnt.
- `markAsRead()` antwortet `NOT_FOUND` für einen Benutzernamen, der nicht existiert.
- Ein Gesprächspartner hat vielleicht kein Profil mehr: Ein gelöschtes Konto lässt seine Unterhaltungen 30 Tage lang lesbar, während `users.get()` `NOT_FOUND` antwortet.
- Unterhaltungen gehören zum Konto des Schlüssels. Nichts hier wird standardmäßig zwischengespeichert.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Conversations`](/reference/conversations/) | Die privaten Nachrichten des Kontos, zu dem der API-Schlüssel gehört. |
| [`Conversation`](/reference/conversation/) | Eine Unterhaltung: eine pro Gesprächspartner. |
| [`ConversationListParams`](/reference/conversation-list-params/) | Filter von [`Conversations.list`](/reference/conversations/). |
| [`ConversationMessage`](/reference/conversation-message/) | Eine Textnachricht einer Unterhaltung. |
| [`MarkAsReadResult`](/reference/mark-as-read-result/) | Was das Markieren einer Unterhaltung als gelesen antwortet. |
| [`MessagesParams`](/reference/messages-params/) | Wo das Lesen einer Unterhaltung beginnt. |
| [`ConversationItem`](/reference/conversation-item/) | Woraus eine Unterhaltung besteht. |
<!-- exports:end -->
