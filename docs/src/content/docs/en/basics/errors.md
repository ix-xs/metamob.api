---
title: Errors
description: "A call returns the data or throws an error. The kinds of errors, their codes, and what is retried."
sidebar:
  order: 3
---

A call returns the data you asked for, or throws an error when it fails. Every error carries a `code` to test:

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Three kinds of errors

| Class | When | Extra |
| --- | --- | --- |
| `MetamobApiError` | The API answered with an error status | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | No usable answer: network failure, timeout, abort, invalid JSON | `method`, `cause` |
| `MetamobArgumentError` | The call was refused before being sent: bad argument, unknown name, no key | `suggestions` |

All three extend `MetamobError`, which has a `code`.

## Testing an error

`isMetamobError(error)` tells whether an error comes from the library. With a code, it also checks the code.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // a typo in the name of the monster
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // the quest does not exist, or is not yours
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // the key was revoked
  } else {
    throw error;
  }
}
```

An API error also has shortcuts for the most common cases:

```ts
try {
  await metamob.quests.get(slug);
} catch (error) {
  if (error instanceof MetamobApiError) {
    error.isNotFound; // 404
    error.isUnauthorized; // 401
    error.isRateLimited; // 429
    error.status; // the HTTP status
    error.messages; // what the API said, by field: { error: "Quest not found" }
  }
}
```

## What a 404 means

The API answers 404 for what does not exist and for what is not yours. `quests.get()`, `quests.monsters()` and every write answer `NOT_FOUND` on a quest of another account, whether it exists or not. `users.quest()` answers `NOT_FOUND` on a hidden quest.

## What is retried

Some failures are temporary. In those cases, the library sends the request again before throwing the error:

| Failure | Retried |
| --- | --- |
| 429, rate limit | Yes, after the wait the API asks for |
| 502, 503, 504 | Yes |
| 500 | On reads only |
| Network failure, timeout | Yes |
| 400, 401, 403, 404 | No |
| Aborted with your `signal` | No |

By default there are up to 3 more attempts. The delay starts at 500 ms and doubles each time, up to 60 seconds. When the API sends `Retry-After`, that wait is used. A `Retry-After` longer than `maxDelay` is not waited for: the error is thrown at once, with its `retryAfter` in seconds.

The writes that set a value, on a quest or a conversation, give the same result when sent twice: they are retried too. Sending a message or a trade proposal never is, since it would arrive twice. After a timeout, check that it did not go out before sending it again.

The number of attempts can be set for the client or for a call:

```ts
// For the whole client.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// For one call.
await metamob.quests.get(slug, { retry: false });
```

To see retries as they happen:

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Timeouts and cancellation

One attempt has 30 seconds by default. `timeout` changes this delay, for the client or for a call. A `signal` cancels a call from outside, including while it waits for the rate limiter.

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

## Arguments are checked first

An argument the API would surely refuse is refused before sending, with `INVALID_ARGUMENT`: an empty slug, a negative quantity, a search of fewer than 3 characters, a date in the wrong format, a message longer than 1000 characters, a proposal without monsters.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`MetamobApiError`](/reference/metamob-api-error/) | The API answered with an error status. |
| [`MetamobArgumentError`](/reference/metamob-argument-error/) | Thrown before the call it is about is sent: an invalid argument, a missing API key, or a name that matches no monster, zone or server. |
| [`MetamobError`](/reference/metamob-error/) | Base class of everything thrown by this library. |
| [`MetamobRequestError`](/reference/metamob-request-error/) | The request never produced a usable response: timeout, network failure, abort or unreadable body. |
| [`isMetamobError`](/reference/is-metamob-error/) | Type guard for errors thrown by this library, optionally narrowed to a code. |
| [`MetamobErrorCode`](/reference/metamob-error-code/) | The `code` of every error this library throws. |
<!-- exports:end -->
