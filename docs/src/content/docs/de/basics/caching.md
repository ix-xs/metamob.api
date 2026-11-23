---
title: Cache
description: "Was zwischengespeichert wird, wie lange, und wie man es einstellt."
sidebar:
  order: 5
---

## Was standardmäßig zwischengespeichert wird

Nur Referenzdaten: Spielversionen, Server, Monstertypen, Questtypen, Quest-Vorlagen, Monster, Zonen und Unterzonen. Sie ändern sich nur mit dem Spiel. Eine Antwort wird 10 Minuten im Speicher gehalten und von allen Schlüsseln geteilt, da sie für alle gleich ist.

Der Rest (Profile, Quests, Treffer, Unterhaltungen, Tauschvorschläge, Krakamor-Events) wird bei jedem Aufruf von der API gelesen.

Zwei identische Lesezugriffe, die im selben Moment gesendet werden, teilen sich immer eine Anfrage, mit oder ohne Cache.

## Mehr zwischenspeichern

`ttl` ändert die Gültigkeitsdauer der Referenzdaten, und `methods` gibt jeder Methode eine Gültigkeitsdauer, über ihren Namen, wie er in [Alle Methoden](/resources/methods/) steht:

```ts
const metamob = new Metamob({
  cache: {
    ttl: "1h",
    methods: {
      "users.get": "1m",
      "quests.matches": "5m",
      "monsters.get": "1d",
      "zones.list": false, // nie zwischengespeichert
    },
  },
});
```

Was vom Konto abhängt, wird für jeden Schlüssel getrennt gehalten: Ein Spieler sieht nie die Antworten eines anderen. Die Einträge eines Schlüssels werden verworfen, sobald dieser Schlüssel etwas schreibt, sodass ein Lesezugriff nach einem Schreibzugriff aktuell ist.

## Für einen Aufruf

```ts
// Den Cache für diesen Aufruf umgehen.
const fresh = await metamob.servers.list({ cache: false });

// Diese Antwort fünf Minuten behalten, egal was der Client sagt.
const profile = await metamob.users.get(username, { cache: "5m" });
```

## Ihn leeren

```ts
await metamob.clearCache();
```

## Ihn abschalten

```ts
const metamob = new Metamob({ cache: false });
```

## Ein Cache, der den Prozess überdauert

Standardmäßig liegt der Cache im Speicher und fasst 500 Einträge. Um ihn zwischen mehreren Prozessen zu teilen, geben Sie ihm einen Speicher: ein Objekt mit `get` und `set`, die asynchron sein dürfen, und optional `delete` und `clear`. Zum Beispiel mit Redis:

```ts
import type { CacheEntry, CacheStore } from "@ix-xs/metamob.api";

const store: CacheStore = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : undefined;
  },
  async set(key, entry) {
    const seconds = Math.ceil((entry.expires - Date.now()) / 1000);
    if (seconds > 0) await redis.set(key, JSON.stringify(entry), "EX", seconds);
  },
  async delete(key) {
    await redis.del(key);
  },
};

const metamob = new Metamob({ cache: { store } });
```

Die Schlüssel des Speichers enthalten nie einen API-Schlüssel, nur einen Hash davon. Wenn der Speicher fehlschlägt, läuft der Aufruf ohne Cache weiter, und der Fehler wird als Ereignis `error` ausgegeben.

## Cache oder eingebettete Daten

Die Referenzdaten sind auch im Paket enthalten: [`data`](/basics/embedded-data/) liest sie ohne Anfrage. Gehen Sie über die API, wenn Sie die Daten von heute wollen, zum Beispiel direkt nach einem Spielupdate.

## Zeitangaben

Überall, wo eine Zeitangabe erwartet wird, schreiben Sie eine Zahl in Millisekunden oder einen String mit Einheit: `"500ms"`, `"30s"`, `"10m"`, `"1h"`, `"1d"`.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`MemoryCache`](/reference/memory-cache/) | Speicher im Arbeitsspeicher, der den am längsten nicht genutzten Eintrag entfernt, sobald er voll ist. |
| [`CacheEntry`](/reference/cache-entry/) | Was der Client für eine zwischengespeicherte Antwort speichert. |
| [`CacheOptions`](/reference/cache-options/) | Cache-Einstellungen des Clients. |
| [`CacheStore`](/reference/cache-store/) | Wo zwischengespeicherte Antworten liegen. |
| [`Duration`](/reference/duration/) | Eine Zeitdauer: Millisekunden als Zahl, oder ein kurzer String wie `"30s"`, `"5m"`, `"2h"` oder `"1d"`. |
<!-- exports:end -->
