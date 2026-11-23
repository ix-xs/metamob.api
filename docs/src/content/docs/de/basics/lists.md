---
title: Listen
description: "Eine paginierte Methode gibt eine Anfrage zurück: mit await eine Seite, durchlaufen jedes Element. Vorher wird nichts gesendet."
sidebar:
  order: 2
---

Eine paginierte Methode gibt eine Anfrage zurück, die sich auf drei Arten lesen lässt:

```ts
const request = metamob.monsters.list({ type: "archimonstre" });

// Eine Seite.
const page = await request;

// Jedes Element, Seite für Seite.
for await (const monster of request) {
  console.log(monster.name.fr);
}

// Ein Array.
const everything = await request.all();
```

## Eine Seite

Eine Liste mit `await` abzuwarten, liefert ihre erste Seite.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

page.items; // die Monster
page.total; // wie viele es mit diesen Filtern gibt
page.limit; // 20
page.offset; // 0
page.hasNext; // ob es weitere gibt
```

Eine Seite ist iterierbar, und `next()` holt die folgende. Nach der letzten gibt es `null` zurück.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

for (const monster of page) console.log(monster.name.fr);

const second = await page.next();
```

Um woanders zu beginnen, übergeben Sie `offset`:

```ts
const third = await metamob.monsters.list({ limit: 20, offset: 40 });
```

## Alles

`for await` durchläuft jedes Element. Eine Seite wird erst angefordert, wenn die Schleife sie erreicht: Wer die Schleife verlässt, beendet die Anfragen.

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  if (monster.step > 20) break; // nichts weiter wird geholt
  console.log(monster.name.fr);
}
```

Wenn Sie kein `limit` angeben, nutzt ein Durchlauf die größte Seite, die der Endpunkt akzeptiert: 200 für Monster und Quests, 50 für Benutzer, Unterhaltungen und Treffer. Das ergibt weniger Anfragen für dieselben Daten.

## Arrays

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

Ohne Limit holt `all()` jede Seite: Geben Sie bei einer Suche eines an.

## Das erste Element oder die Anzahl

Beide senden nur eine Anfrage, für ein einziges Element.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined, wenn es keines gibt

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Seite für Seite

`pages()` liefert ganze Seiten, für den Fall, dass die Seite wichtig ist: ein Fortschrittsbalken, ein gesammeltes Einfügen.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Seiten, die mehr mitbringen

Drei Listen kommen auf jeder Seite mit dem, wozu sie gehören:

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // die Vorlage, zu der die Monster gehören

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // die Quest, zu der die Monster gehören

const mine = await metamob.quests.monsters(slug);
mine.slug; // der Slug der Quest
```

## Nachrichten und Vorschläge nutzen einen Cursor

Die Nachrichten einer Unterhaltung und die Tauschvorschläge sind nicht nummeriert: Die API liefert sie seitenweise von der neuesten zur ältesten, mit einem Cursor, den sie Seite für Seite mitgibt. Dieselben Methoden gelten, aber `total` und `count()` sind `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // wo die nächste Seite beginnt, undefined am Ende

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // von der neuesten zur ältesten
}
```

## Listen ohne Paginierung

Manche Endpunkte antworten alles auf einmal und geben ein einfaches Array zurück: `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` und die Referenzlisten (`servers.list()` und die anderen derselben Art).

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`ListRequest`](/reference/list-request/) | Was jede paginierte Methode zurückgibt. |
| [`Page`](/reference/page/) | Eine Ergebnisseite. |
| [`CollectOptions`](/reference/collect-options/) | Optionen von [`ListRequest.all`](/reference/list-request/) und [`ListRequest.pages`](/reference/list-request/). |
| [`PageParams`](/reference/page-params/) | Seitengröße und Startpunkt einer paginierten Liste. |
<!-- exports:end -->
