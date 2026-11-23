<div align="center">

# @ix-xs/metamob.api

Ein JavaScript- und TypeScript-Client für die API von [Metamob](https://www.metamob.fr).

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI)](https://github.com/ix-xs/metamob.api/actions)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Dokumentation](https://ix-xs.github.io/metamob.api/de/)** ·
[Français](./README.md) ·
[English](./README.en.md) ·
[Español](./README.es.md) ·
[Português](./README.pt.md) ·
[Änderungsprotokoll](./CHANGELOG.md)

</div>

## Installation

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 oder neuer. Läuft auch auf Bun, Deno, im Browser und auf Edge-Plattformen. Das Paket hat keine Abhängigkeit.

## Beispiel

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const [quest] = await metamob.quests.list();

if (quest) {
  // Die Monster, die der Quest noch fehlen.
  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  // Ein Monster eintragen, über seinen Namen oder seine ID.
  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
}
```

Der API-Schlüssel wird auf metamob.fr erstellt, unter **Einstellungen > API-Schlüssel**.

## Was das Paket abdeckt

- **Die 43 Endpunkte der API**, typisiert: Konto, Quests, Tauschpartner, Tauschvorschläge, private Nachrichten, Monster, Zonen, Spieler, Krakamor-Events und Referenzdaten.
- **Namen**: Ein Monster, eine Zone, ein Server oder eine Monsterart wird über die ID oder über den Namen angegeben, auf Französisch, Englisch, Spanisch, Portugiesisch oder Deutsch. Ein unbekannter Name wirft einen Fehler, der die ähnlichsten Namen vorschlägt.
- **Listen**: Eine paginierte Methode wird mit await für eine Seite abgewartet oder mit `for await` durchlaufen.
- **Das Anfragelimit**: Der Client zählt die 60 Anfragen pro Minute und Schlüssel und lässt die nächsten Aufrufe warten.
- **Wiederholungen** nach einem 429, einem Serverfehler oder einem Netzwerkausfall. Das Senden einer Nachricht oder eines Vorschlags wird nie wiederholt.
- **Ein Cache** für Referenzdaten, der eingestellt oder ausgeschaltet werden kann.
- **`data`**: die im Paket enthaltenen Monster, Zonen, Server und Quest-Vorlagen, für eine Suche ohne Anfrage.
- **`withKey()`**: mit dem Schlüssel eines anderen Spielers handeln, für einen Bot oder eine Website, die mehreren Spielern dient.

```ts
import { data, isMetamobError } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 5 }); // keine Anfrage

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
}
```

## Dokumentation

Die vollständige Dokumentation finden Sie unter **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/de/)**, auf Deutsch, [Französisch](https://ix-xs.github.io/metamob.api/), [Englisch](https://ix-xs.github.io/metamob.api/en/), [Spanisch](https://ix-xs.github.io/metamob.api/es/) und [Portugiesisch](https://ix-xs.github.io/metamob.api/pt/):

- [Konfiguration](https://ix-xs.github.io/metamob.api/de/basics/configuration/)
- [Alle Methoden](https://ix-xs.github.io/metamob.api/de/resources/methods/)
- [API-Referenz](https://ix-xs.github.io/metamob.api/de/reference/)
- [Umstieg von Version 4](https://ix-xs.github.io/metamob.api/de/help/migrating-from-v4/)

## Metamob

[Metamob](https://www.metamob.fr) ist die Website, auf der Dofus-Spieler ihre Archimonster-Quests verfolgen und jemanden zum Tauschen finden. Die Website, ihre Daten und ihre API sind ihr eigenes Werk: Diese Bibliothek ruft sie nur auf. Die [offizielle API-Dokumentation](https://www.metamob.fr/help/api) bleibt die Referenz.

## Lizenz

[MIT](./LICENSE). Ein unabhängiges Projekt, nicht mit Metamob oder Ankama verbunden. Dofus ist eine Marke von Ankama Games. Die im Paket enthaltenen Daten stammen aus der Metamob-API; die Nutzung der API bedeutet, [ihre Regeln](https://www.metamob.fr/help/api) einzuhalten, angefangen beim Anfragelimit.
