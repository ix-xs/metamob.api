---
title: Errors
description: A call returns the data or throws. Every error has a typed code, and the ones that come from the API also carry the status and the message it sent. This page shows how to tell them apart and what is retried for you.
sidebar:
  order: 3
---

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

An API error has shortcuts for the three you test most:

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

Before an error reaches you, the library has already tried again when trying again can help.

| Failure | Retried |
| --- | --- |
| 429, rate limit | Yes, after the wait the API asks for |
| 502, 503, 504 | Yes |
| 500 | On reads only |
| Network failure, timeout | Yes |
| 400, 401, 403, 404 | No |
| Aborted with your `signal` | No |

By default there are up to 3 more attempts. The delay starts at 500 ms and doubles each time, up to 60 seconds. When the API sends `Retry-After`, that wait is used instead. A `Retry-After` longer than `maxDelay` is not waited for: the error is thrown at once, with its `retryAfter` in seconds.

Every write of this API sets a value, so sending one twice gives the same result. That is why writes are retried too.

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

One attempt has 30 seconds by default. `timeout` changes it, for the client or for a call. A `signal` cancels a call from outside, including while it waits for the rate limiter.

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

What can be known to be wrong without asking the API is refused locally, with `INVALID_ARGUMENT`: an empty slug, a negative quantity, a search of fewer than 3 characters, a date in the wrong format. No request is spent.

## Reference

| Code | Meaning |
| --- | --- |
| `BAD_REQUEST` | 400: the API refused the parameters |
| `UNAUTHORIZED` | 401: missing, invalid or revoked key |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404: does not exist, or is not yours |
| `RATE_LIMITED` | 429, after the retries |
| `SERVER_ERROR` | 5xx, after the retries |
| `API_ERROR` | Any other error status |
| `TIMEOUT` | No answer in time |
| `NETWORK` | The request could not be made |
| `ABORTED` | Cancelled with your `signal` |
| `PARSE_ERROR` | The answer was not valid JSON |
| `MISSING_API_KEY` | No key in the options, the call or the environment |
| `INVALID_ARGUMENT` | An argument is wrong |
| `UNKNOWN_NAME` | No monster, zone or server has this name |

[Error codes](/reference/errors/) lists the properties of each class.

## See also

- [The rate limit](/basics/rate-limit/)
- [Names and ids](/basics/names-and-ids/)
- [Configuration](/basics/configuration/)
- [Troubleshooting](/help/troubleshooting/)
