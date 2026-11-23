---
title: Für andere Spieler handeln
description: "Die Schlüssel, die Ihnen Spieler gegeben haben, mit einem einzigen Client nutzen."
sidebar:
  order: 7
---

## Wofür das gedacht ist

Ein API-Schlüssel handelt im Namen seines Besitzers: Er liest dessen Quests und Nachrichten und schreibt in dessen Quests. Ein Bot oder eine Website, die die Quests mehrerer Spieler verwaltet, braucht daher den Schlüssel jedes Einzelnen, freiwillig gegeben.

Das ist die einzige vorgesehene Verwendung. Jeder Schlüssel hat seine eigenen 60 Anfragen pro Minute: Mehrere Schlüssel zu nutzen, um für sich selbst mehr Anfragen zu senden, läuft darauf hinaus, das Limit zu umgehen. Siehe [Das Anfragelimit](/basics/rate-limit/).

## Ein Client pro Spieler

`withKey()` gibt einen Client zurück, der einen anderen Schlüssel nutzt. Er ist leichtgewichtig: Erstellen Sie bei jeder Anfrage eines Spielers einen.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

Er teilt mit dem Client, von dem er stammt:

- die Optionen: Zeitlimit, Wiederholungen, Basis-URL, Header;
- den Cache der Referenzdaten;
- die Listener: `metamob.on("retry", ...)` hört jeden Client;
- den Limiter, der jeden Schlüssel getrennt zählt.

Was vom Konto abhängt, wird für jeden Schlüssel getrennt zwischengespeichert: Ein Spieler sieht nie die Quests eines anderen.

## Ein Schlüssel für einen Aufruf

Für einen einzelnen Aufruf steht der Schlüssel in den Optionen, als letztes Argument:

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Herausfinden, wem der Schlüssel gehört

`me()` liefert den Benutzernamen des Besitzers des Schlüssels, was für die öffentlichen Endpunkte nützlich ist:

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

So lässt sich auch ein Schlüssel prüfen, wenn ein Spieler ihn angibt:

```ts
async function register(playerKey: string) {
  try {
    const { username } = await metamob.withKey(playerKey).me();
    await db.players.save({ username, key: playerKey });
    return username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined; // kein gültiger Schlüssel
    throw error;
  }
}
```

## Ein Client ohne eigenen Schlüssel

Ein Dienst, der nur für Spieler handelt, braucht keinen eigenen Schlüssel. Erstellen Sie den Client ohne Schlüssel und leiten Sie daraus einen pro Spieler ab. `METAMOB_API_KEY` darf nicht gesetzt sein, sonst würde es verwendet.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Ein Aufruf direkt mit `base` wirft dann `MISSING_API_KEY`.

## Schlüssel speichern

Ein Schlüssel ist ein Passwort für ein Metamob-Konto.

- Speichern Sie ihn verschlüsselt und schreiben Sie ihn nie in ein Log. Die Bibliothek hält ihn aus URLs, Fehlern und Ereignissen heraus.
- Fragen Sie ihn über HTTPS ab, in einem Formular oder einem privaten Befehl, nie in einem öffentlichen Kanal.
- Löschen Sie ihn, wenn der Spieler geht, und sagen Sie ihm, dass er ihn jederzeit auf metamob.fr widerrufen kann, unter Einstellungen > API-Schlüssel.
- Ein `401` bei einem Schlüssel, der bisher funktioniert hat, bedeutet, dass er widerrufen wurde: Nutzen Sie ihn nicht mehr.

## Referenz

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Ein Client für diesen Schlüssel, der Optionen, Cache, Listener und Limiter teilt |
| `{ apiKey }` als letztes Argument | Der Schlüssel für einen Aufruf |
| `metamob.me()` | Das Konto des verwendeten Schlüssels |
