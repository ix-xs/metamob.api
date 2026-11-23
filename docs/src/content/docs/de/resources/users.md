---
title: Andere Spieler
description: "Spieler suchen, ein öffentliches Profil lesen und die Monster einer öffentlichen Quest."
sidebar:
  order: 6
---

## Spieler suchen

`users.search()` sucht nach einem Teil des Benutzernamens, ab 3 Zeichen, unter den Spielern, die mindestens eine öffentliche Quest haben. Es ist eine [Liste](/basics/lists/) mit höchstens 50 Spielern pro Seite. Durchsucht werden nur Spieler, die in den letzten 90 Tagen gesehen wurden; `activeWithinDays` ändert diese Dauer, bis zu 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// Auf einem Server, unter den Spielern, die in den letzten 30 Tagen gesehen wurden.
const filters = { server: "Draconiros", activeWithinDays: 30 };
const active = await metamob.users.search("ix-", filters).all();
```

## Ein Profil lesen

`users.get()` gibt das öffentliche Profil eines Spielers zurück, mit der Liste seiner öffentlichen Quests:

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // die Adresse des Profils auf metamob.fr
```

Die Groß-/Kleinschreibung des Benutzernamens spielt keine Rolle: `"ix-xs"` findet `"Ix-xs"`, und die Antwort schreibt ihn so, wie sein Besitzer es tut.

## Öffentliche Quests

`users.quests()` liefert die öffentlichen Quests eines Spielers, mit der Anzahl der Monster, die jede sucht und anbietet:

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Die Monster einer öffentlichen Quest

`users.quest()` ist eine [Liste](/basics/lists/) der Monster einer Quest, mit dem, was ihr Besitzer besitzt, sucht und anbietet. Jede Seite enthält auch die Quest:

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Es gelten dieselben Filter wie für Ihre Quests:

```ts
// Was sie unter den Archimonstern suchen.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Alles auf Stufe 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` und `offer` sind das, was die Quest wirklich sucht und anbietet, nach Anwendung der Tauscheinstellungen ihres Besitzers. Ein Spieler kann überzählige Exemplare haben und keines anbieten.

## Ihre eigenen Quests

Mit diesen Methoden erscheinen Ihre Quests so, wie andere sie sehen: nur die öffentlichen, ohne Ihre Einstellungen. Für die vollständige Ansicht und um sie zu ändern, nutzen Sie [`metamob.quests`](/resources/quests/).

## Grenzen und Fehler

- `NOT_FOUND` für einen Spieler, der nicht existiert, dessen Konto gelöscht wurde, oder für eine versteckte Quest.
- Eine Suche mit weniger als 3 Zeichen wirft `INVALID_ARGUMENT` vor dem Senden.
- Nichts hier wird standardmäßig zwischengespeichert. Für ein oft angezeigtes Profil: `cache: { methods: { "users.get": "1m" } }`, siehe [Cache](/basics/caching/).

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Users`](/reference/users/) | Andere Spieler: ihr Profil und ihre öffentlichen Quests. |
| [`PublicQuest`](/reference/public-quest/) | Eine öffentliche Quest in einem Profil. |
| [`PublicQuestParams`](/reference/public-quest-params/) | Filter von [`Users.quest`](/reference/users/). |
| [`PublicQuestSummary`](/reference/public-quest-summary/) | Eine öffentliche Quest in der Liste der Quests eines Benutzers. |
| [`UserProfile`](/reference/user-profile/) | Das öffentliche Profil eines Benutzers. |
| [`UserSearchParams`](/reference/user-search-params/) | Filter von [`Users.search`](/reference/users/). |
<!-- exports:end -->
