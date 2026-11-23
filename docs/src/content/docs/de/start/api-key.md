---
title: Ihr API-Schlüssel
description: "Einen Metamob-API-Schlüssel erstellen, ihn dem Client übergeben, ihn prüfen und sicher aufbewahren."
---

## Einen Schlüssel erstellen

Melden Sie sich auf [metamob.fr](https://www.metamob.fr) an, öffnen Sie **Einstellungen > API-Schlüssel** und erzeugen Sie einen Schlüssel. Kopieren Sie ihn sofort: Die Website zeigt ihn nur einmal an.

Der Schlüssel gehört zu Ihrem Konto. Jeder Aufruf mit ihm erfolgt in Ihrem Namen, und er gibt immer vollen Zugriff: Es gibt keinen Schlüssel nur zum Lesen.

## Worauf ein Schlüssel Zugriff gibt

| Mit jedem Schlüssel | Nur mit dem Schlüssel des Kontos |
| --- | --- |
| Monster, Zonen, Server, Quest-Vorlagen | `metamob.me()` |
| Öffentliche Profile und Quests jedes Spielers | `metamob.quests`: Einstellungen, Monster, Treffer, Fortschritt und Schreibzugriffe |
| Krakamor-Events | `metamob.conversations` und `metamob.tradeProposals`. Das Senden von Nachrichten und Vorschlägen schaltet Metamob Konto für Konto frei |

Die API verlangt bei jedem Aufruf einen Schlüssel, auch für öffentliche Daten.

## Den Schlüssel an den Client übergeben

Der Client sucht den Schlüssel an drei Stellen, von der allgemeinsten zur genauesten:

1. die Umgebungsvariable `METAMOB_API_KEY`;
2. die Option `apiKey` des Clients;
3. `{ apiKey }` als letztes Argument eines Aufrufs, oder [`metamob.withKey()`](/basics/many-keys/), um mit dem Schlüssel eines anderen Spielers zu handeln.

```bash title=".env"
METAMOB_API_KEY=your-key
```

```ts
const metamob = new Metamob(); // liest METAMOB_API_KEY

const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);

const quests = await metamob.quests.list({ apiKey: theirKey });
```

Ohne Schlüssel wirft der erste Aufruf einen Fehler `MISSING_API_KEY`.

## Einen Schlüssel prüfen

`metamob.me()` ist der einfachste Aufruf, um zu erfahren, ob ein Schlüssel funktioniert und wem er gehört:

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
  console.log("This key is not valid, or was revoked.");
}
```

## Ihn sicher aufbewahren

- Veröffentlichen Sie nie einen Schlüssel: nicht in einem Commit, nicht in einem Issue, nicht in einem Log. Die Bibliothek setzt ihn nie in eine URL, einen Fehler oder ein Ereignis.
- Auf einer Webseite ist ein Schlüssel für alle sichtbar, die die Seite öffnen. Rufen Sie die API von einem Server aus auf, außer bei einer Seite, die nur der Besitzer des Schlüssels nutzt.
- Wenn Spieler Ihnen ihren Schlüssel geben, behandeln Sie ihn wie ein Passwort: verschlüsselt, und gelöscht, wenn sie gehen.
- Wenn ein Schlüssel nach außen gelangt, erzeugen Sie auf metamob.fr einen neuen: Der alte funktioniert dann nicht mehr.

## Das Anfragelimit gilt pro Schlüssel

Jeder Schlüssel hat seine eigenen 60 Anfragen pro Minute. Ein Bot kann daher für mehrere Spieler handeln, jeder mit seinem Schlüssel. Mehrere Schlüssel zu nutzen, um schneller zu sein, ist nicht der Sinn: Das Limit schützt den Server von Metamob. Siehe [Das Anfragelimit](/basics/rate-limit/).
