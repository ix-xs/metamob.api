---
title: Fehlerbehebung
description: "Die häufigsten Probleme, was sie bedeuten und wie man sie behebt."
---

## MISSING_API_KEY

Kein Schlüssel hat den Client erreicht. Prüfen Sie, in dieser Reihenfolge:

- Die Umgebungsvariable `METAMOB_API_KEY` ist in dem Prozess gesetzt, der Ihren Code ausführt. Node.js liest eine Datei `.env` nicht von selbst: Starten Sie mit `node --env-file=.env app.mjs` oder laden Sie sie mit Ihrem Framework.
- Sie haben `apiKey` übergeben, und es ist nicht `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` mit einer falsch geschriebenen Variable ist die übliche Ursache.
- Auf einer Edge-Plattform gibt es vielleicht keine Umgebungsvariable: Übergeben Sie den Schlüssel selbst, siehe [Laufzeitumgebungen](/help/runtimes/#the-api-key).

## UNAUTHORIZED

Die API akzeptiert den Schlüssel nicht: falsch kopiert, oder widerrufen, weil ein neuer erstellt wurde. Erzeugen Sie einen auf metamob.fr, unter Einstellungen > API-Schlüssel, und prüfen Sie ihn mit `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND bei einer meiner Quests

Die API antwortet 404 für das, was nicht Ihnen gehört, wie für das, was nicht existiert.

- Der Slug gehört zu einer Quest eines anderen Kontos. `quests.list()` liefert die Slugs des verwendeten Schlüssels.
- Sie nutzen den Schlüssel eines anderen Spielers mit Ihrem Slug, oder umgekehrt. Mit [`withKey()`](/basics/many-keys/) gehören Slugs zu ihrem Schlüssel.
- Bei `users.quest()` ist die Quest im öffentlichen Profil versteckt. Ihr Besitzer liest sie weiterhin mit `quests.monsters()`.

## UNKNOWN_NAME für einen Namen, der existiert

- Prüfen Sie die Schreibweise mit `error.suggestions`. Akzente und Groß-/Kleinschreibung werden verziehen, ein fehlender oder zusätzlicher Buchstabe nicht.
- Der Name kann neuer sein als Ihre Version des Pakets. Die Bibliothek sucht ihn dann in der API, außer bei einer allein angegebenen Unterzone, die die API nur innerhalb einer Zone sucht: Übergeben Sie `{ zone }`, siehe [Zonen](/resources/zones/#subzones).
- Aktualisieren Sie das Paket: Jede Version enthält die aktuellen Namen.

## Das falsche Monster bei einem geteilten Namen

Jede Spielversion hat ihre eigenen Monster, und die meisten haben von einer Version zur nächsten denselben Namen. `monsters.get("Crognan le Barbare")` gibt das von Dofus (Unity) zurück. Fügen Sie `{ gameVersion }` hinzu oder nutzen Sie die ID. Schreibzugriffe auf eine Quest sind nicht betroffen: Sie nehmen das Monster dieser Quest. Siehe [Namen und IDs](/basics/names-and-ids/#monsters-that-share-a-name).

## Mein Skript ist langsam

Es wartet wahrscheinlich wegen des Limits von 60 Anfragen pro Minute. Das Ereignis `rateLimit` bestätigt es:

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Um weniger Anfragen zu senden: ein `setMonsters()` statt mehrerer `setMonster()`, `count()` statt Seiten zu zählen, [`data`](/basics/embedded-data/) statt der Referenzaufrufe. Siehe [Das Anfragelimit](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED, obwohl der Limiter aktiv ist

Der Client zählt nur seine eigenen Anfragen. Der Schlüssel wird wahrscheinlich auch anderswo genutzt: ein anderer Prozess, eine andere Instanz des Servers, ein zweiter Client im selben Programm. Teilen Sie einen einzigen Client, oder senken Sie das Limit jedes einzelnen mit `rateLimit: { requests: 30 }`.

## Ein gerade geschriebener Wert wird unverändert gelesen

Lesezugriffe, die an das Konto gebunden sind, werden nur zwischengespeichert, wenn Sie es verlangt haben. Mit einer Gültigkeitsdauer für `quests.get` oder `quests.monsters` in `cache.methods` leert ein Schreibzugriff mit demselben Client den Cache, aber nicht ein Schreibzugriff anderswo, zum Beispiel auf der Website. Übergeben Sie `{ cache: false }` beim Lesen oder verkürzen Sie die Gültigkeitsdauer.

## setMonster hat nicht eins hinzugefügt

Es setzt die Menge, es addiert nicht dazu. Lesen, dann schreiben:

```ts
const tofu = data.monster("Tofu Maléfique");
const monsters = await metamob.quests.monsters(slug).all();
const owned = monsters.find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT oder NETWORK

Die Anfrage kam nicht durch, auch nach 3 Wiederholungen. Prüfen Sie die Verbindung des Rechners, dann, ob metamob.fr antwortet. Hinter einem Proxy geben Sie dem Client ein `fetch`, das ihn nutzt, siehe [Konfiguration](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

Die API ist auf ihrer Seite fehlgeschlagen, und Lesezugriffe wurden bereits wiederholt. Wenn es andauert, wird die Website vielleicht gewartet: Warten Sie, statt eine Schleife laufen zu lassen.

Eine Nachricht oder ein Vorschlag wird nicht wiederholt: Sehen Sie nach einem `SERVER_ERROR` in der Unterhaltung oder in `tradeProposals.list()` nach, bevor Sie sie erneut senden, sie ist vielleicht durchgegangen.

## Es funktioniert auf meinem Server und schlägt im Browser fehl

Eine Seite kann nur eine API aufrufen, die ihren Ursprung erlaubt. Rufen Sie Metamob von Ihrem Server aus auf und lassen Sie die Seite Ihren Server aufrufen: So bleibt auch der Schlüssel aus der Seite heraus. Siehe [Laufzeitumgebungen](/help/runtimes/#browsers).

## require() gibt etwas ohne Metamob zurück

Version 5 hat benannte Exporte. `const MetamobAPI = require("@ix-xs/metamob.api")` wird zu `const { Metamob } = require("@ix-xs/metamob.api")`. Siehe [Von Version 4 umsteigen](/help/migrating-from-v4/).

## Immer noch nicht weiter

Öffnen Sie ein Issue auf [GitHub](https://github.com/ix-xs/metamob.api/issues) mit der Version des Pakets, Ihrer Laufzeitumgebung, `error.code` und dem kleinsten Code, der das Problem zeigt. Entfernen Sie Ihren API-Schlüssel aus allem, was Sie einfügen.
