---
title: Fehler
description: "Ein Aufruf gibt die Daten zurück oder wirft einen Fehler. Die Arten von Fehlern, ihre Codes, und was wiederholt wird."
sidebar:
  order: 3
---

Ein Aufruf gibt die angeforderten Daten zurück oder wirft einen Fehler, wenn er fehlschlägt. Jeder Fehler trägt einen `code`, den Sie prüfen können:

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Drei Arten von Fehlern

| Klasse | Wann | Zusätzlich |
| --- | --- | --- |
| `MetamobApiError` | Die API hat mit einem Fehlerstatus geantwortet | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | Keine verwertbare Antwort: Netzwerkfehler, Zeitüberschreitung, Abbruch, ungültiges JSON | `method`, `cause` |
| `MetamobArgumentError` | Der Aufruf wurde vor dem Senden abgelehnt: falsches Argument, unbekannter Name, kein Schlüssel | `suggestions` |

Alle drei erweitern `MetamobError`, das einen `code` hat.

## Einen Fehler prüfen

`isMetamobError(error)` sagt, ob ein Fehler von der Bibliothek stammt. Mit einem Code prüft es auch den Code.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // ein Tippfehler im Namen des Monsters
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // die Quest existiert nicht oder gehört nicht Ihnen
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // der Schlüssel wurde widerrufen
  } else {
    throw error;
  }
}
```

Ein API-Fehler hat außerdem Abkürzungen für die häufigsten Fälle:

```ts
try {
  await metamob.quests.get(slug);
} catch (error) {
  if (error instanceof MetamobApiError) {
    error.isNotFound; // 404
    error.isUnauthorized; // 401
    error.isRateLimited; // 429
    error.status; // der HTTP-Status
    error.messages; // was die API gesagt hat, nach Feld: { error: "Quest not found" }
  }
}
```

## Was ein 404 bedeutet

Die API antwortet 404 für das, was nicht existiert, und für das, was nicht Ihnen gehört. `quests.get()`, `quests.monsters()` und jeder Schreibzugriff antworten `NOT_FOUND` auf eine Quest eines anderen Kontos, ob sie existiert oder nicht. `users.quest()` antwortet `NOT_FOUND` auf eine versteckte Quest.

## Was wiederholt wird

Manche Fehler sind vorübergehend. In diesen Fällen sendet die Bibliothek die Anfrage erneut, bevor sie den Fehler wirft:

| Fehler | Wiederholt |
| --- | --- |
| 429, Anfragelimit | Ja, nach der Wartezeit, die die API verlangt |
| 502, 503, 504 | Ja |
| 500 | Nur bei Lesezugriffen |
| Netzwerkfehler, Zeitüberschreitung | Ja |
| 400, 401, 403, 404 | Nein |
| Abgebrochen mit Ihrem `signal` | Nein |

Standardmäßig gibt es bis zu 3 weitere Versuche. Die Wartezeit beginnt bei 500 ms und verdoppelt sich jedes Mal, bis zu 60 Sekunden. Wenn die API `Retry-After` sendet, wird diese Wartezeit verwendet. Auf ein `Retry-After`, das länger als `maxDelay` ist, wird nicht gewartet: Der Fehler wird sofort geworfen, mit seinem `retryAfter` in Sekunden.

Die Schreibzugriffe, die einen Wert setzen, auf einer Quest oder einer Unterhaltung, liefern dasselbe Ergebnis, wenn sie zweimal gesendet werden: Sie werden ebenfalls wiederholt. Das Senden einer Nachricht oder eines Tauschvorschlags wird nie wiederholt, da er zweimal ankäme. Prüfen Sie nach einer Zeitüberschreitung, dass er nicht schon hinausgegangen ist, bevor Sie ihn erneut senden.

Die Anzahl der Versuche lässt sich für den Client oder für einen Aufruf einstellen:

```ts
// Für den ganzen Client.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// Für einen Aufruf.
await metamob.quests.get(slug, { retry: false });
```

Um Wiederholungen zu sehen, während sie geschehen:

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Zeitüberschreitungen und Abbruch

Ein Versuch hat standardmäßig 30 Sekunden. `timeout` ändert diese Frist, für den Client oder für einen Aufruf. Ein `signal` bricht einen Aufruf von außen ab, auch während er auf den Limiter wartet.

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 2000);

try {
  await metamob.quests.matches(slug, {}, { signal: controller.signal, timeout: "5s" });
} catch (error) {
  if (isMetamobError(error, "ABORTED")) console.log("Cancelled.");
  if (isMetamobError(error, "TIMEOUT")) console.log("Too slow.");
}
```

## Argumente werden zuerst geprüft

Ein Argument, das die API sicher ablehnen würde, wird vor dem Senden abgelehnt, mit `INVALID_ARGUMENT`: ein leerer Slug, eine negative Menge, eine Suche mit weniger als 3 Zeichen, ein Datum im falschen Format, eine Nachricht mit mehr als 1000 Zeichen, ein Vorschlag ohne Monster.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`MetamobApiError`](/reference/metamob-api-error/) | Die API hat mit einem Fehlerstatus geantwortet. |
| [`MetamobArgumentError`](/reference/metamob-argument-error/) | Wird geworfen, bevor der betreffende Aufruf gesendet wird: ein ungültiges Argument, ein fehlender API-Schlüssel oder ein Name, der zu keinem Monster, keiner Zone und keinem Server passt. |
| [`MetamobError`](/reference/metamob-error/) | Basisklasse von allem, was diese Bibliothek wirft. |
| [`MetamobRequestError`](/reference/metamob-request-error/) | Die Anfrage hat nie eine verwertbare Antwort geliefert: Zeitüberschreitung, Netzwerkausfall, Abbruch oder unlesbarer Inhalt. |
| [`isMetamobError`](/reference/is-metamob-error/) | Type Guard für die von dieser Bibliothek geworfenen Fehler, optional auf einen Code eingegrenzt. |
| [`MetamobErrorCode`](/reference/metamob-error-code/) | Der `code` jedes Fehlers, den diese Bibliothek wirft. |
<!-- exports:end -->
