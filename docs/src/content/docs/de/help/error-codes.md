---
title: Fehlercodes
description: "Die Fehlercodes, ihre Ursache, ob sie wiederholt werden, und die Eigenschaften jeder Fehlerklasse."
---

Jeder Fehler erweitert `MetamobError` und trägt einen `code`. [Fehler](/basics/errors/) erklärt, wie man sie behandelt; diese Seite listet sie auf.

## Codes

`code` ist ein `MetamobErrorCode`. Es gibt 15 davon.

"Wiederholt" bedeutet standardmäßig bis zu 3 weitere Versuche. Die Wartezeit beginnt bei 500 ms und verdoppelt sich, bis zu 60 Sekunden. Wenn die API ein `Retry-After` sendet, wird diese Wartezeit verwendet, es sei denn, sie ist länger als `retry.maxDelay`: Dann wird der Fehler sofort geworfen, mit seinem `retryAfter`.

Von der API, als `MetamobApiError`:

| Code | Status | Ursache | Wiederholt |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | Ein Parameter, den die API ablehnt | Nein |
| `UNAUTHORIZED` | 401 | Der Schlüssel fehlt, ist ungültig oder wurde widerrufen | Nein |
| `FORBIDDEN` | 403 | Der Schlüssel darf das nicht: Das Senden ist für das Konto nicht freigeschaltet, oder einer der beiden Spieler hat den anderen blockiert | Nein |
| `NOT_FOUND` | 404 | Es existiert nicht, oder es gehört nicht Ihnen: eine Quest eines anderen Kontos, eine versteckte Quest, ein gelöschter Spieler | Nein |
| `CONFLICT` | 409 | Der Zustand erlaubt es nicht: ein Vorschlag, der bereits abgebrochen oder von Ihnen bereits angewendet wurde, oder einer, für den Ihnen Exemplare fehlen | Nein |
| `RATE_LIMITED` | 429 | Mehr als 60 Anfragen in einer Minute mit diesem Schlüssel, oder die Anti-Spam-Limits der Website bei einer Nachricht oder einem Vorschlag | Ja, außer bei einer Nachricht oder einem Vorschlag |
| `SERVER_ERROR` | 500 und höher | Die API ist fehlgeschlagen | 502, 503, 504: ja, außer bei einer Nachricht oder einem Vorschlag. 500: nur bei Lesezugriffen |
| `API_ERROR` | jeder andere | Ein anderer Fehlerstatus | Nein |

Von der Anfrage, als `MetamobRequestError`:

| Code | Ursache | Wiederholt |
| --- | --- | --- |
| `TIMEOUT` | Ein Versuch bekam innerhalb von `timeout` keine Antwort, standardmäßig 30 Sekunden | Ja, außer bei einer Nachricht oder einem Vorschlag |
| `NETWORK` | Die Anfrage konnte nicht gestellt werden: keine Verbindung, DNS, TLS | Ja, außer bei einer Nachricht oder einem Vorschlag |
| `ABORTED` | Ihr `signal` hat den Aufruf abgebrochen | Nein |
| `PARSE_ERROR` | Die API hat mit 200 und etwas geantwortet, das kein JSON ist | Nein |

Von der Bibliothek, als `MetamobArgumentError`, bevor irgendetwas gesendet wird:

| Code | Ursache |
| --- | --- |
| `MISSING_API_KEY` | Kein Schlüssel in den Optionen des Clients, in den Optionen des Aufrufs oder in `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | Ein Argument, das nicht stimmen kann: ein leerer Slug, eine negative Menge, eine Suche mit weniger als 3 Zeichen, ein Datum im falschen Format, ein leerer Stapel, eine Nachricht mit mehr als 1000 Zeichen, ein Vorschlag ohne Monster |
| `UNKNOWN_NAME` | Kein Monster, keine Zone, Unterzone, kein Server, keine Version und kein Typ hat diesen Namen. `suggestions` enthält die nächstliegenden |

## MetamobError

Die Basis aller drei.

| Eigenschaft | Typ | Bedeutung |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | Einer der Codes oben |
| `message` | `string` | Die Methode, dann was fehlgeschlagen ist |
| `name` | `string` | Der Name der Klasse |
| `cause` | `unknown` | Der ursprüngliche Fehler, wenn es einen gibt |

## MetamobApiError

| Eigenschaft | Typ | Bedeutung |
| --- | --- | --- |
| `status` | `number` | Der HTTP-Status |
| `method` | `string` | Die Methode, die fehlgeschlagen ist, zum Beispiel `quests.get` |
| `url` | `string` | Die aufgerufene Adresse. Sie enthält nie den Schlüssel |
| `messages` | `Record<string, string>` | Was die API gesagt hat, nach Feld. Oft `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | Die Anzahl der Sekunden, die die API bei einem 429 zu warten verlangt hat |
| `body` | `unknown` | Der Body der Antwort, geparst, wenn er JSON ist |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

Die Fehlermeldung der API landet in `message` und `messages`.

## MetamobRequestError

| Eigenschaft | Typ | Bedeutung |
| --- | --- | --- |
| `method` | `string` | Die Methode, die fehlgeschlagen ist |
| `cause` | `unknown` | Was `fetch` geworfen hat, oder der Grund des Abbruchs |

## MetamobArgumentError

| Eigenschaft | Typ | Bedeutung |
| --- | --- | --- |
| `suggestions` | `readonly string[]` | Bei `UNKNOWN_NAME` die nächstliegenden existierenden Namen, der beste zuerst. Sonst leer |

## isMetamobError

```ts
function handle(error: unknown) {
  if (isMetamobError(error)) error.code; // jeder Fehler der Bibliothek
  if (isMetamobError(error, "NOT_FOUND")) error.message; // ein Code
}
```

Es ist ein Type Guard: Innerhalb des Zweigs ist `error` ein `MetamobError`.
