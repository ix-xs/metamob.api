---
title: Das Anfragelimit
description: "Metamob erlaubt 60 Anfragen pro Minute und Schlüssel. Wie der Client sie zählt, und wie man das Limit beobachtet und einstellt."
sidebar:
  order: 4
---

## Was die API erlaubt

60 Anfragen pro Minute, gezählt pro API-Schlüssel. Darüber hinaus antwortet die API mit 429 und einem Header `Retry-After`.

Das Limit hält die Website für alle verfügbar: Bleiben Sie darunter und versuchen Sie nicht, es zu umgehen.

## Was der Client tut

Der Client zählt die Anfragen, die mit jedem Schlüssel in der letzten Minute gesendet wurden. Wenn 60 hinausgegangen sind, wartet der nächste Aufruf, bis die älteste eine Minute alt ist, und geht dann los. Die Aufrufe behalten ihre Reihenfolge.

Eine Schleife mit 300 Anfragen dauert daher etwa fünf Minuten, ohne Fehler.

Wenn trotzdem ein 429 kommt, zum Beispiel weil ein anderes Programm denselben Schlüssel nutzt, wartet der Client die Zeit, die die API verlangt, und versucht es dann erneut. Siehe [was wiederholt wird](/basics/errors/#what-is-retried).

## Es beobachten

`metamob.rateLimit` sagt, wo der Schlüssel des Clients steht, so wie dieser Client zählt: Von den Anfragen, die anderswo mit demselben Schlüssel gemacht werden, weiß er nichts.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

Das Ereignis `rateLimit` wird jedes Mal ausgegeben, wenn ein Aufruf warten musste, mit der Dauer der Wartezeit:

```ts
metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Weniger Anfragen verbrauchen

Das Limit zählt Anfragen, nicht Elemente. Der Client sendet bereits so wenige, wie er kann:

- Das Durchlaufen einer Liste nutzt die größte Seite, die die API akzeptiert, siehe [Listen](/basics/lists/).
- `count()` und `first()` fragen nach einem Element statt nach einer Seite.
- Referenzdaten werden [zwischengespeichert](/basics/caching/), und zwei identische laufende Aufrufe teilen sich eine Anfrage.
- Namen werden aus [den Daten im Paket](/basics/embedded-data/) aufgelöst, ohne Anfrage.
- `quests.setMonsters()` schreibt bis zu 200 Monster in einer Anfrage.

Auf Ihrer Seite:

```ts
import { data } from "@ix-xs/metamob.api";

// Referenzdaten lesen: das Paket fragen, nicht die API.
const monster = data.monster("Tofu Maléfique"); // keine Anfrage
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 Anfrage, mit den Zonen

// Viele Mengen: ein Stapel, keine Schleife.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## Es einstellen

```ts
// Unter dem Limit, um Platz für ein anderes Programm zu lassen.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Aus: Ein Schwall bekommt 429, wiederholt nach der Wartezeit, die die API verlangt.
const unlimited = new Metamob({ rateLimit: false });
```

`requests` über 60 zu setzen, erhöht nicht, was die API erlaubt: Es verlagert das Warten nur vom Client zu 429-Antworten.

## Mehrere Schlüssel

Jeder Schlüssel hat sein eigenes Zeitfenster. Ein mit [`withKey()`](/basics/many-keys/) erstellter Client teilt den Limiter des Clients, von dem er stammt, und dieser zählt jeden Schlüssel getrennt.

## Eine Wartezeit abbrechen

Ein Aufruf, der wartet, bis er an der Reihe ist, lässt sich mit einem `signal` abbrechen. Er wirft einen Fehler mit dem Code `ABORTED` und gibt seinen Platz frei.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`RateLimitOptions`](/reference/rate-limit-options/) | Einstellungen des eingebauten Anfragebegrenzers. |
| [`RateLimitState`](/reference/rate-limit-state/) | Wo ein API-Schlüssel gegenüber seinem Anfragelimit steht, so wie dieser Client zählt. |
<!-- exports:end -->
