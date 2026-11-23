---
title: Installation
description: "Der JavaScript- und TypeScript-Client der Metamob-API: ihre 43 Endpunkte, typisiert, ganz ohne Abhängigkeiten."
---

```bash
npm install @ix-xs/metamob.api
```

Oder `pnpm add`, `yarn add`, `bun add`. Die Typen sind enthalten.

| Voraussetzung | |
| --- | --- |
| Node.js | 20 oder neuer |
| Module | ES-Module und CommonJS |
| Andere Laufzeitumgebungen | Bun, Deno, Browser, Edge-Plattformen: siehe [Laufzeitumgebungen](/help/runtimes/) |
| API-Schlüssel | Ein Metamob-Schlüssel, siehe [Ihr API-Schlüssel](/start/api-key/) |

## Erster Aufruf

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const quests = await metamob.quests.list();
const needed = await metamob.quests.monsters(quests[0]!.slug, { status: "needed" }).count();
```

In CommonJS:

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

Ohne `apiKey` liest der Client die Umgebungsvariable `METAMOB_API_KEY`. [Konfiguration](/basics/configuration/) listet alle seine Optionen auf.

## Was der Client übernimmt

| | |
| --- | --- |
| Typen | Jede Antwort der API ist typisiert: siehe die [Referenz](/reference/) |
| Namen | Monster, Zonen und Server über ihren Namen, in den fünf Sprachen der Website: [Namen und IDs](/basics/names-and-ids/) |
| Listen | Paginierung per Offset oder Cursor, durchlaufen mit `for await`: [Listen](/basics/lists/) |
| Das Anfragelimit | 60 Anfragen pro Minute und Schlüssel, Aufrufe darüber hinaus warten, bis sie an der Reihe sind: [Das Anfragelimit](/basics/rate-limit/) |
| Fehler | Ein stabiler `code` pro Fall und Wiederholungen bei vorübergehenden Fehlern: [Fehler](/basics/errors/) |
| Cache | Referenzdaten im Speicher, ein austauschbarer Speicher: [Cache](/basics/caching/) |
| Spieldaten | Monster, Zonen und Server enthalten, durchsuchbar ohne Anfrage: [Die Daten im Paket](/basics/embedded-data/) |

## Metamob

Alles beruht auf [Metamob](https://www.metamob.fr), der Website der Archimonster-Jäger, und auf ihrer API. Dieses Paket ruft sie nur auf: Die [offizielle API-Dokumentation](https://www.metamob.fr/help/api) bleibt die Referenz.
