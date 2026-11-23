---
title: Konto
description: "metamob.me() sagt, zu welchem Konto ein API-Schlüssel gehört."
sidebar:
  order: 1
---

## Was zurückkommt

`metamob.me()` gibt den Benutzernamen, die Bio, den Avatar und die letzte Aktivität des Kontos des Schlüssels zurück, sowie das, was Metamob dafür freigeschaltet hat. Nichts Privates: Es ist das, was das öffentliche Profil zeigt, ohne die Quests.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // der Avatar ist ein Monster
  console.log(urls.monsterImage(me.avatar)); // sein Bild
}
```

## Was das Konto tun kann

Das Senden von Nachrichten und Tauschvorschlägen schaltet Metamob Konto für Konto frei, auf Anfrage. `features` sagt, was freigeschaltet ist, um das Senden in Ihrer Anwendung anzuzeigen oder auszublenden, ohne den Aufruf zu versuchen:

```ts
const { features } = await metamob.me();

if (features.trade_proposals_create) {
  // den Button anzeigen, der einen Vorschlag sendet
}
```

| Feld | `true`, wenn dieser Aufruf freigeschaltet ist |
| --- | --- |
| `messages_send` | `conversations.send()` |
| `trade_proposals_create` | `tradeProposals.create()` |

Bei einem Konto, wo es `false` ist, antwortet der Aufruf `FORBIDDEN`. Weitere Felder können hinzukommen: Ignorieren Sie die, die Sie nicht kennen.

## Von einem Schlüssel zu allem anderen

Die öffentlichen Endpunkte brauchen einen Benutzernamen, den `me()` liefert:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // wie andere es sehen
console.log(`${profile.quests.length} public quests`);
```

Die Quests des Kontos, versteckte eingeschlossen, finden Sie unter [`metamob.quests`](/resources/quests/). Das Profil und die öffentlichen Quests jedes Spielers finden Sie unter [`metamob.users`](/resources/users/).

## Einen Schlüssel prüfen

`me()` ist der leichteste Aufruf, der einen gültigen Schlüssel verlangt: Er ist der richtige Test, wenn ein Spieler Ihnen seinen gibt.

```ts
async function whose(key: string) {
  try {
    return (await metamob.withKey(key).me()).username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined;
    throw error;
  }
}
```

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Account`](/reference/account/) | Das Konto, zu dem ein API-Schlüssel gehört. |
| [`AccountFeatures`](/reference/account-features/) | Was Metamob einem Konto auf Anfrage freigeschaltet hat: `true`, wenn der Endpunkt antwortet, `false`, wenn er `FORBIDDEN` antworten würde. |
| [`Avatar`](/reference/avatar/) | Das Monster, das ein Benutzer als Avatar gewählt hat. |
| [`UserSummary`](/reference/user-summary/) | Ein Benutzer, wie eine Suche oder ein Tauschtreffer ihn zurückgibt. |
<!-- exports:end -->
