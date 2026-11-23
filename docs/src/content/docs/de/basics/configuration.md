---
title: Konfiguration
description: "Die Optionen des Clients und eines Aufrufs, mit ihren Standardwerten."
sidebar:
  order: 8
---

Jede Option ist optional. Die Standardwerte passen zu einem Skript ebenso wie zu einem Bot:

```ts
const metamob = new Metamob({
  apiKey: process.env.METAMOB_API_KEY,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h" },
  rateLimit: { requests: 50 },
});
```

## Der Client

Der Schlüssel allein kann auch als String übergeben werden:

```ts
const fromEnvironment = new Metamob();
const fromString = new Metamob(apiKey);
const fromOptions = new Metamob({ apiKey });
```

Erstellen Sie einen Client und behalten Sie ihn: Er hält die Anzahl der Anfragen und den Cache. Zwei Clients für denselben Schlüssel zählen getrennt und können zusammen das Limit überschreiten.

## Ein Aufruf

Jede Methode nimmt zuerst ihre eigenen Argumente, dann ein Optionsobjekt nur für diesen Aufruf:

```ts
await metamob.monsters.get("Tofu", {}, { timeout: "5s", cache: false });
await metamob.quests.list({ apiKey: theirKey, retry: false });
await metamob.users.get(username, { signal });
```

Wenn eine Methode Filter hat, stehen sie vor den Optionen: `monsters.get(monster, hint, options)`, `quests.monsters(slug, filters, options)`.

## Auf den Client hören

Der Client gibt bei jedem Schritt eines Aufrufs ein Ereignis aus. `on` gibt eine Funktion zurück, die das Zuhören beendet:

```ts
const stop = metamob.on("request", ({ method, verb, url, attempt }) => {
  console.log(verb, url, attempt > 0 ? `(attempt ${attempt + 1})` : "");
});

metamob.on("response", ({ method, status, duration, cached }) => {
  console.log(method, status, cached ? "from cache" : `${duration} ms`);
});

stop();
```

| Ereignis | Wann | Inhalt |
| --- | --- | --- |
| `request` | Eine Anfrage geht hinaus | `method`, `verb`, `url`, `attempt` |
| `response` | Eine Antwort ist eingetroffen oder kam aus dem Cache | `method`, `status`, `duration`, `cached` |
| `retry` | Eine Anfrage wird erneut versucht | `method`, `attempt`, `delay`, `error` |
| `rateLimit` | Ein Aufruf hat gewartet, bis er an der Reihe war | `method`, `delay` |
| `error` | Ein Listener oder ein Cache-Speicher hat einen Fehler geworfen | der Fehler |

Eine URL in einem Ereignis enthält nie den Schlüssel.

## Zeitangaben

Überall, wo eine Zeitangabe erwartet wird, schreiben Sie eine Zahl in Millisekunden oder einen String mit Einheit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

## Ein anderes fetch, ein anderer Host

`fetch` ersetzt das globale fetch: um über einen Proxy zu gehen, um Anfragen in Tests zu beobachten, oder auf einer Laufzeitumgebung, die keines hat.

```ts
const calls: string[] = [];

const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  fetch: async (input, init) => {
    calls.push(String(input));
    return fetch(input, init);
  },
});
```

`baseUrl` richtet den Client auf einen anderen Host. Der Schlüssel wird an diesen Host gesendet: Nutzen Sie nur einen, dem Sie vertrauen.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Metamob`](/reference/metamob/) | Der Client für die Metamob-API. |
| [`VERSION`](/reference/version/) | Version des Pakets. |
| [`ClientEvents`](/reference/client-events/) | Vom Client ausgelöste Ereignisse, siehe `metamob.on()`. |
| [`MetamobOptions`](/reference/metamob-options/) | Optionen des Clients [`Metamob`](/reference/metamob/). |
| [`RequestOptions`](/reference/request-options/) | Optionen, die als letztes Argument jedes API-Aufrufs angenommen werden. |
| [`RetryOptions`](/reference/retry-options/) | Wiederholungsregel. |
<!-- exports:end -->
