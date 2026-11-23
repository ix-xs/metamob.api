---
title: FAQ
description: "Kurze Antworten auf häufige Fragen."
---

## Ist es offiziell?

Nein. `@ix-xs/metamob.api` ist ein unabhängiges Open-Source-Projekt unter der MIT-Lizenz, weder mit Metamob noch mit Ankama verbunden. Es folgt der [öffentlichen API von Metamob](https://www.metamob.fr/help/api) und wird aktualisiert, wenn sich die API ändert.

## Was ist Metamob?

[Metamob](https://www.metamob.fr) ist eine kostenlose Website, auf der Dofus-Spieler die Monster der Quests Ocker-Dofus und Dokille verfolgen und einander finden, um sie zu tauschen. Sie deckt Dofus (Unity), Dofus Retro und Dofus Touch ab.

## Deckt es die ganze API ab?

Ja, die 43 Endpunkte. [Alle Methoden](/resources/methods/) listet sie auf, mit der Methode, die jeden aufruft.

## Brauche ich einen API-Schlüssel?

Für jeden Aufruf der API, ja: siehe [Ihr API-Schlüssel](/start/api-key/). Die [Daten im Paket](/basics/embedded-data/) brauchen keinen.

## Ist es kostenlos?

Die Bibliothek ist es, und die API ebenso. Die API akzeptiert 60 Anfragen pro Minute und Schlüssel, und der Client bleibt darunter: siehe [Das Anfragelimit](/basics/rate-limit/).

## Kann ich das Anfragelimit erhöhen?

Nein, und versuchen Sie nicht, es mit mehreren Schlüsseln zu umgehen: Das Limit hält die Website für alle verfügbar. Um weniger Anfragen zu stellen, siehe [Das Anfragelimit](/basics/rate-limit/#spending-fewer-requests).

## Funktioniert es mit TypeScript? Mit reinem JavaScript?

Mit beiden. Es ist in TypeScript geschrieben und enthält seine Typen. In JavaScript zeigt Ihr Editor trotzdem die Dokumentation an und vervollständigt die Namen der Monster.

## ES-Module oder CommonJS?

Beides: `import { Metamob }` und `const { Metamob } = require(...)`. Siehe [Laufzeitumgebungen](/help/runtimes/).

## Kann ich es in einem Browser nutzen?

Ja, mit Vorsicht beim Schlüssel: siehe [Laufzeitumgebungen](/help/runtimes/#browsers). Das Objekt `data` allein ist überall sicher.

## In welcher Sprache sind die Namen?

Französisch, Englisch, Spanisch, Portugiesisch und Deutsch. Jedes Monster, jede Zone und jede Unterzone hat einen `name` mit `fr`, `en`, `es`, `pt` und `de`, und alle fünf werden überall akzeptiert, wo ein Name erwartet wird: siehe [Namen und IDs](/basics/names-and-ids/).

## Wie aktuell sind die Daten im Paket?

`data.fetchedAt` gibt das Datum an, an dem sie von der API gelesen wurden, und jede Version des Pakets aktualisiert sie. Ein Monster, das neuer ist als Ihre Version, funktioniert in Aufrufen trotzdem über den Namen: Die Bibliothek sucht den Namen dann in der API. Siehe [Die Daten im Paket](/basics/embedded-data/#when-the-game-changes).

## Kann es eine Quest erstellen, eine Nachricht senden oder einen Tausch vorschlagen?

Es kann eine Nachricht senden und einen Tausch vorschlagen, sobald Metamob das Senden für Ihr Konto freigeschaltet hat: siehe [Unterhaltungen](/resources/conversations/#sending-a-message) und [Tauschvorschläge](/resources/trade-proposals/#making-a-proposal). Es schreibt auch in Ihre Quests: Einstellungen, Mengen und manuelle Tauscheinstellungen. Es kann außerdem einen Vorschlag anwenden, Ihre Seite innerhalb von 2 Stunden rückgängig machen oder ihn abbrechen. Eine Quest wird auf der Website erstellt.

## Kann ich die Quests anderer Spieler verwalten?

Mit deren eigenem Schlüssel, freiwillig gegeben: siehe [Für andere Spieler handeln](/basics/many-keys/). Ohne ihn können Sie lesen, was sie öffentlich gemacht haben.

## Wie erhöhe ich eine Menge um eins?

Lesen Sie sie und setzen Sie sie dann: `setMonster` setzt eine Menge. Das Beispiel steht in [Fehlerbehebung](/help/troubleshooting/#setmonster-did-not-add-one).

## Wiederholt es von selbst?

Ja: Anfragelimits, Serverfehler bei Lesezugriffen, Zeitüberschreitungen und Netzwerkfehler, bis zu 3-mal mit wachsenden Wartezeiten. Außer beim Senden einer Nachricht oder eines Vorschlags, das nie wiederholt wird. Siehe [Fehler](/basics/errors/#what-is-retried).

## Ich habe Version 4 verwendet. Was ändert sich?

Die Art, die Methoden aufzurufen, nicht was sie tun. [Von Version 4 umsteigen](/help/migrating-from-v4/) gibt für jede Methode den Ersatz an.

## Wo melde ich einen Fehler oder frage nach etwas?

Auf [GitHub](https://github.com/ix-xs/metamob.api/issues). Für ein Problem mit der API selbst oder mit der Website hat Metamob einen eigenen Kontakt auf [metamob.fr](https://www.metamob.fr).
