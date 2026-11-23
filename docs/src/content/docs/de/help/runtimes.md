---
title: Laufzeitumgebungen
description: "Node.js 20 und neuer, Bun, Deno, Edge-Plattformen und Browser, als ES-Modul oder als CommonJS."
---

## Was es braucht

`fetch`, `AbortController` und `URL`, die jede aktuelle Laufzeitumgebung bereitstellt. Das Paket hat keine Abhängigkeit, und nichts darin ist spezifisch für Node.js. Es lässt sich als ES-Modul oder als CommonJS importieren:

```ts
import { Metamob } from "@ix-xs/metamob.api"; // ES-Module
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

| Laufzeitumgebung | Funktioniert | Hinweise |
| --- | --- | --- |
| Node.js 20 und neuer | Ja | ES-Module und CommonJS |
| Bun | Ja | |
| Deno | Ja | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Ja | Siehe den Hinweis zum Zustand unten |
| Browser | Ja | Siehe den Hinweis zu den Schlüsseln unten |

## Der API-Schlüssel

Wenn Sie kein `apiKey` übergeben, liest der Client die Umgebungsvariable `METAMOB_API_KEY`, sofern die Laufzeitumgebung eine hat. Anderswo übergeben Sie den Schlüssel.

```ts
// Cloudflare Workers: Der Schlüssel ist ein Secret des Workers.
export default {
  async fetch(request: Request, env: { METAMOB_API_KEY: string }) {
    const metamob = new Metamob({ apiKey: env.METAMOB_API_KEY });
    const servers = await metamob.servers.list();
    return Response.json(servers);
  },
};
```

## Browser

Alles funktioniert auf einer Webseite, aber ein Schlüssel dort kann von jedem gelesen werden, der die Seite öffnet. Zwei Fälle sind in Ordnung:

- Ein Werkzeug, das jeder Spieler mit seinem eigenen Schlüssel nutzt, eingegeben und auf seinem Gerät gespeichert.
- [`data`](/basics/embedded-data/) allein, das keinen Schlüssel braucht: Suche, Autovervollständigung, "wo lebt dieses Monster".

Für alles andere rufen Sie die API von Ihrem Server aus auf.

Ob ein Browser die API von Ihrer Domain aus aufrufen darf, hängt von der CORS-Richtlinie von metamob.fr ab. Wenn ein Aufruf auf einer Seite fehlschlägt, aber auf einem Server funktioniert, ist das der Grund: Gehen Sie über Ihren Server.

## Zustand auf Serverless-Plattformen

Der Limiter und der Cache leben im Client, im Speicher. Auf einer Plattform, die für jede Anfrage eine neue Instanz startet, beginnt jede Instanz bei null zu zählen.

- Erstellen Sie den Client außerhalb des Handlers, damit bereits gestartete Instanzen ihn wiederverwenden.
- Geben Sie dem Cache einen Speicher, der die Instanz überdauert, siehe [Cache](/basics/caching/#a-cache-that-outlives-the-process).
- Vermeiden Sie Schwälle. Wenn mehrere Instanzen einen Schlüssel teilen, kann die API mit 429 antworten: Der Client wartet die verlangte Zeit und versucht es dann erneut.

## Bundle-Größe

Das Paket passt in eine Datei pro Modulsystem, etwa 160 kB vor der Komprimierung, mehr als die Hälfte davon für die Referenzdaten. Mit einem Bundler bleibt der Client außen vor, wenn Sie nur `data` importieren. `Metamob` behält die Daten, die es zum Lesen von Namen nutzt.

## Typen

Die Deklarationen werden mit dem Paket ausgeliefert, für ES-Module und für CommonJS. Sie werden unter jeder Einstellung von `moduleResolution` in TypeScript aufgelöst. TypeScript 5 oder neuer wird empfohlen.

Die Namen der Monster sind große Union-Typen, die nur der Vervollständigung dienen. Wenn Ihr Editor langsamer wird, vermeidet die Annotation einer Variable als `string` sie.

## Ihren Code testen

Geben Sie dem Client Ihr eigenes `fetch`, um ohne Netzwerk zu testen:

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () =>
    Response.json({
      data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14T09:12:45Z" },
    }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```
