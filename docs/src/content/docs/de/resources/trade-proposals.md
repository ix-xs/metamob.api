---
title: Tauschvorschläge
description: "Die gesendeten und empfangenen Tauschvorschläge lesen, und einen senden."
sidebar:
  order: 8
---

Ein Tauschvorschlag geht von einer Ihrer Quests an einen anderen Spieler. Mit der API können Sie sie lesen, Ihre Seite anwenden, sie rückgängig machen oder die Vorschläge abbrechen, und sie senden, wenn das Senden für das Konto freigeschaltet ist. Jeder erscheint auch in der [Unterhaltung](/resources/conversations/#trade-proposals) mit diesem Spieler.

## Vorschläge auflisten

`tradeProposals.list()` liefert die Vorschläge des Kontos, die neuesten zuerst. Es ist eine [Liste](/basics/lists/) mit höchstens 50 pro Seite, wie Nachrichten mit einem Cursor seitenweise geliefert:

```ts
const pending = { direction: "received", status: "pending" } as const;

const waiting = await metamob.tradeProposals.list(pending).all();
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const done = await metamob.tradeProposals.list({ quest: slug, status: "completed" });
const going = await metamob.tradeProposals.list({ status: "open" });
```

| Filter | Werte |
| --- | --- |
| `direction` | `"received"`: an Sie gerichtet. `"sent"`: von Ihnen gemacht. `"all"`, der Standard: beides |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"`, oder `"open"` für die noch laufenden: `pending` und `half_applied` |
| `quest` | Der Slug einer Ihrer Quests |
| `since` | Ein `Date` oder ein ISO-8601-Datum mit Zeitzone wie `"2026-01-27T14:00:00Z"`: nur die Vorschläge, die ab diesem Moment erstellt wurden, einschließlich |

Ein Datum ohne Zeitzone oder eines, das die API nicht lesen könnte, wird vor jeder Anfrage abgelehnt.

## Wer was gibt

`monsters_given` ist das, was der Absender gibt, `monsters_received` das, was der Absender erhält. Wenn Sie der Empfänger sind, lesen Sie sie umgekehrt: Sie erhalten `monsters_given` und geben `monsters_received`.

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

Ein Vorschlag bezeichnet seine Monster über ihre ID: [`data.monster()`](/basics/embedded-data/) macht aus einer ID ein Monster, ohne Anfrage.

| `status` | Bedeutung |
| --- | --- |
| `pending` | Noch niemand hat seine Seite angewendet |
| `half_applied` | Einer der beiden Spieler hat seine Seite angewendet: siehe `applications` |
| `completed` | Beide Seiten sind angewendet |
| `cancelled` | Abgebrochen von `cancelled_by`, oder abgelaufen, wenn `cancelled_by` `null` ist |

Ein Vorschlag mit `pending` trägt `expires_at`, den Zeitpunkt, zu dem er von selbst abgebrochen wird: Wenn nach 30 Tagen niemand seine Seite angewendet hat, wird er `cancelled`, ohne `cancelled_by`. Die Zeit ist ungefähr, der Abbruch läuft einmal am Tag. In jedem anderen Zustand ist `expires_at` `null`.

## Einen Vorschlag lesen

`tradeProposals.get()` nimmt eine ID oder einen Vorschlag aus einer Liste. Die Antwort fügt `viewer` hinzu, Ihre Seite des Vorschlags: Ihre Rolle, ob Sie Ihre Seite angewendet haben und bis wann Sie sie rückgängig machen können (`unapply_until`), was Ihre Quest verlässt (`removed`) und was in sie hineinkommt (`added`).

```ts
const proposal = await metamob.tradeProposals.get(57);

proposal.viewer.role; // "sender" oder "recipient"
proposal.viewer.applied; // Sie haben Ihre Seite angewendet

for (const { monster_id, owned, quantity } of proposal.viewer.added) {
  const name = data.monster(monster_id)?.name.fr;
  console.log(name, `${owned ?? 0} owned, ${quantity} coming`);
}
```

Jedes Monster von `removed` und `added` trägt `owned`: die Anzahl der Exemplare, die Sie jetzt davon besitzen. Sobald Ihre Seite angewendet ist, ist sie schon eingerechnet. Es ist `null`, wenn Sie auf diesem Server keine Quest dieses Typs haben.

`create()`, `apply()`, `unapply()` und `cancel()` antworten mit dem Vorschlag in derselben Form.

## Einen Vorschlag machen

`tradeProposals.create()` sendet einen Vorschlag von einer Ihrer Quests. Seine Felder heißen wie beim Lesen: `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` und `monsters_received`. Die Monster werden wie bei [`quests.setMonsters()`](/resources/quests/#recording-many-monsters) geschrieben, über ID oder Namen:

```ts
// Ein Partner und seine Quest, so wie matches() sie findet.
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

`recipient`, `sender_quest` und `recipient_quest` sind Pflicht. `recipient_quest` ist der Slug der Quest des anderen Spielers, den `quests.matches()` für jeden Partner liefert. Beide Quests müssen vom selben Typ und auf demselben Server sein. Mindestens ein Monster ist nötig, auf der einen oder der anderen Seite, und höchstens 200 auf jeder Seite.

:::note
Das Senden ist standardmäßig gesperrt: Metamob schaltet es Konto für Konto frei, auf Anfrage, und ohne Freischaltung antwortet die API `FORBIDDEN`. [`features`](/resources/account/#what-the-account-can-do) sagt, ob es freigeschaltet ist. Die Regeln sind die der Website: `FORBIDDEN`, wenn einer der beiden Spieler den anderen blockiert hat, `RATE_LIMITED` jenseits der Anti-Spam-Limits.
:::

Ein Vorschlag wird nie wiederholt, egal welcher Fehler: Zweimal gesendet, gäbe es ihn zweimal. Sehen Sie nach einer Zeitüberschreitung oder einem Netzwerkfehler in `list({ direction: "sent" })` nach, bevor Sie ihn erneut senden.

## Einen Vorschlag anwenden

`tradeProposals.apply()` wendet Ihre Seite des Vorschlags auf Ihre Quest an: Was Sie geben, verlässt sie, was Sie erhalten, kommt hinein. Es funktioniert für den Absender und für den Empfänger, und der Vorschlag wird `completed`, sobald beide Seiten angewendet sind. Anders als das Senden ist es für jeden Schlüssel freigeschaltet:

```ts
const proposal = await metamob.tradeProposals.apply(57);

proposal.status; // "half_applied", oder "completed", wenn die andere Seite es schon war
proposal.viewer.applied; // true
```

Wenn Ihnen Exemplare eines Monsters fehlen, das Sie geben, ändert sich nichts, und die API antwortet `CONFLICT`, mit dem, was Sie besitzen, und dem, was verlangt wird. Mit `allowPartial: true` wird der Vorschlag trotzdem angewendet, jede Menge auf das reduziert, was Sie besitzen: `viewer.clamped` ist dann `true`, und `applied_quantity` gibt für jedes Monster an, was wirklich bewegt wurde. `clamped` ist auch `true`, wenn ein Monster, das Sie erhalten, die Höchstmenge überschreiten würde.

```ts
const proposal = await metamob.tradeProposals.apply(57, { allowPartial: true });
const { clamped, removed } = proposal.viewer;

if (clamped) {
  for (const { monster_id, quantity, applied_quantity } of removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // was wirklich bewegt wurde
  }
}
```

Zweimal anwenden oder einen abgebrochenen Vorschlag anwenden antwortet ebenfalls `CONFLICT`. `apply()` wird nie wiederholt: Lesen Sie nach einer Zeitüberschreitung den Vorschlag mit `get()` erneut, bevor Sie es noch einmal versuchen.

## Ihre Anwendung rückgängig machen

2 Stunden lang, nachdem Sie Ihre Seite angewendet haben, macht `tradeProposals.unapply()` sie rückgängig: Was Sie gegeben haben, kommt in Ihre Quest zurück, was Sie erhalten haben, verlässt sie, für die Mengen, die wirklich bewegt wurden. Der andere Spieler wird weder geändert noch benachrichtigt. `viewer.unapply_until` gibt die Frist an und ist `null`, wenn es nichts rückgängig zu machen gibt:

```ts
const proposal = await metamob.tradeProposals.get(57);

if (proposal.viewer.unapply_until) {
  const undone = await metamob.tradeProposals.unapply(proposal);

  for (const { monster_id, quantity, applied_quantity } of undone.viewer.removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // was in Ihre Quest zurückkam
  }
}
```

Die Antwort ist der Vorschlag, mit `viewer.applied` wieder auf `false`. Wenn Sie Ihre Mengen in der Zwischenzeit geändert haben, kann das Rückgängigmachen teilweise sein: ein Monster, das Sie erhalten und schon verwendet haben, oder die Höchstmenge ist erreicht. `viewer.clamped` ist dann `true`, und `applied_quantity` sagt, was wirklich bewegt wurde.

Es funktioniert auch, wenn der Vorschlag inzwischen abgebrochen wurde. Andernfalls können Sie ihn danach erneut anwenden oder abbrechen. Nach Ablauf der Frist, bei einem Vorschlag, den Sie nicht angewendet haben, oder bei einem, der angewendet wurde, bevor Metamob dies hinzugefügt hat, antwortet die API `CONFLICT`: Korrigieren Sie Ihre Mengen dann von Hand. Wie `apply()` wird `unapply()` nie wiederholt.

## Abbrechen oder ablehnen

`tradeProposals.cancel()` bricht einen Vorschlag ab, den Sie gesendet haben, oder lehnt einen ab, den Sie erhalten haben. Es funktioniert, solange Sie Ihre Seite nicht angewendet haben, auch wenn der andere Spieler seine angewendet hat:

```ts
const proposal = await metamob.tradeProposals.cancel(57);

proposal.status; // "cancelled"
```

Ein bereits abgebrochener oder von Ihnen bereits angewendeter Vorschlag antwortet `CONFLICT`. Wie `apply()` wird `cancel()` nie wiederholt.

## Auf neue Vorschläge achten

Regelmäßig mit `since` abgefragt, liefert die Liste, was seit dem letzten Mal angekommen ist, zum Beispiel für einen Bot, der Sie benachrichtigt:

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

`read_at` bleibt `null`, bis der Empfänger den Vorschlag auf der Website öffnet.

## Grenzen und Fehler

- `apply()`, `unapply()` und `cancel()` antworten `NOT_FOUND` für einen Vorschlag, der nicht existiert oder an dem Sie nicht beteiligt sind, und `CONFLICT` für einen Vorschlag, der bereits abgebrochen, von Ihnen bereits angewendet wurde, oder dessen Quest auf Ihrer Seite gelöscht wurde.
- `create()` lehnt vor dem Senden einen Vorschlag ohne Monster ab, eine Menge außerhalb von 1 bis 99, ein Monster, das auf derselben Seite zweimal genannt wird, oder mehr als 200 Monster auf einer Seite.
- Die API antwortet `BAD_REQUEST` für ein Monster, das nicht in der Quest ist, für ein Monster, von dem Sie mehr Exemplare geben, als Sie besitzen, oder für zwei Quests unterschiedlichen Typs oder auf unterschiedlichen Servern, und `NOT_FOUND` für eine Quest, die nicht existiert oder, bei `sender_quest`, die nicht Ihnen gehört.
- `NOT_FOUND` für einen Vorschlag, der nicht existiert oder der nicht Ihnen gehört.
- `BAD_REQUEST` für eine `quest`, die keine Ihrer Quests ist, und für eine `direction` oder einen `status`, die die API nicht kennt.
- Eine ungültige ID, Quest oder ein ungültiges Datum wird vor dem Senden abgelehnt.
- Vorschläge gehören zum Konto des Schlüssels. Nichts hier wird standardmäßig zwischengespeichert.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`TradeProposals`](/reference/trade-proposals/) | Die Tauschvorschläge des Kontos: die, die Sie gesendet haben, und die, die Sie erhalten haben, für jede Quest. |
| [`ApplyProposalOptions`](/reference/apply-proposal-options/) | Optionen von [`TradeProposals.apply`](/reference/trade-proposals/). |
| [`ConversationProposal`](/reference/conversation-proposal/) | Ein Tauschvorschlag, wie er in einer Unterhaltung zwischen den Nachrichten erscheint. |
| [`NewTradeProposal`](/reference/new-trade-proposal/) | Was [`TradeProposals.create`](/reference/trade-proposals/) sendet. |
| [`ProposalMonster`](/reference/proposal-monster/) | Eine Menge eines Monsters in einem Tauschvorschlag. |
| [`ProposalMonsterDetail`](/reference/proposal-monster-detail/) | Ein Monster, das mit einem Tauschvorschlag Ihre Quest verlässt oder in sie kommt, mit dem, was Sie jetzt davon besitzen. |
| [`ProposalQuest`](/reference/proposal-quest/) | Die Quest einer Partei eines Tauschvorschlags. |
| [`ProposalQuestTemplate`](/reference/proposal-quest-template/) | Die Quest-Vorlage eines Tauschvorschlags: welche Questart, in welcher Spielversion. |
| [`ProposalViewer`](/reference/proposal-viewer/) | Ihr Teil eines Tauschvorschlags. |
| [`TradeProposal`](/reference/trade-proposal/) | Ein Tauschvorschlag zwischen zwei Spielern. |
| [`TradeProposalDetail`](/reference/trade-proposal-detail/) | Ein einzeln gelesener Tauschvorschlag, mit Ihrem Teil davon. |
| [`TradeProposalListParams`](/reference/trade-proposal-list-params/) | Filter von [`TradeProposals.list`](/reference/trade-proposals/). |
<!-- exports:end -->
