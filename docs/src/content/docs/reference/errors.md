---
title: Error codes
description: Every error code the library throws, what causes it, whether a retry already happened, and the properties of each error class. Use it to look up what a failure means.
---

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);
} catch (error) {
  if (error instanceof MetamobError) {
    error.code; // set by the library, for example "NOT_FOUND"
    error.message; // "quests.setMonster: Quest not found"
  }
  throw error;
}
```

Every error extends `MetamobError` and carries a `code`. [Errors](/basics/errors/) explains how to handle them. This page is the lookup table.

## Codes

`code` is a `MetamobErrorCode`. There are 14 of them.

"Retried" means up to 3 more attempts by default. The delay starts at 500 ms and doubles, up to 60 seconds. When the API sends a `Retry-After`, that wait is used instead, unless it is longer than `retry.maxDelay`: the error is then thrown at once, with its `retryAfter`.

From the API, as a `MetamobApiError`:

| Code | Status | Cause | Retried |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | A parameter the API refuses: a quantity out of range, an unknown filter value | No |
| `UNAUTHORIZED` | 401 | The key is missing, invalid or was revoked | No |
| `FORBIDDEN` | 403 | The key may not do this | No |
| `NOT_FOUND` | 404 | It does not exist, or it is not yours: a quest of another account, a hidden quest, a deleted player | No |
| `RATE_LIMITED` | 429 | More than 60 requests in a minute with this key | Yes |
| `SERVER_ERROR` | 500 and up | The API failed | 502, 503, 504: yes. 500: reads only |
| `API_ERROR` | any other | An error status the library has no name for | No |

From the request, as a `MetamobRequestError`:

| Code | Cause | Retried |
| --- | --- | --- |
| `TIMEOUT` | One attempt got no answer within `timeout`, 30 seconds by default | Yes |
| `NETWORK` | The request could not be made: no connection, DNS, TLS | Yes |
| `ABORTED` | Your `signal` cancelled the call | No |
| `PARSE_ERROR` | The API answered 200 with something that is not JSON | No |

From the library, as a `MetamobArgumentError`, before anything is sent:

| Code | Cause |
| --- | --- |
| `MISSING_API_KEY` | No key in the options of the client, in the options of the call or in `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | An argument that cannot be right: an empty slug, a negative quantity, a search of fewer than 3 characters, a date in the wrong format, an empty batch |
| `UNKNOWN_NAME` | No monster, zone, subzone, server, version or kind has this name. `suggestions` holds the closest ones |

## MetamobError

The base of all three.

| Property | Type | Meaning |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | One of the codes above |
| `message` | `string` | The method, then what went wrong |
| `name` | `string` | The name of the class |
| `cause` | `unknown` | The underlying error, when there is one |

## MetamobApiError

| Property | Type | Meaning |
| --- | --- | --- |
| `status` | `number` | The HTTP status |
| `method` | `string` | The method that failed, for example `quests.get` |
| `url` | `string` | The address called. It never contains the key |
| `messages` | `Record<string, string>` | What the API said, by field. Often `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | Seconds the API asked to wait, on a 429 |
| `body` | `unknown` | The body of the answer, parsed when it is JSON |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

The API words its errors in three ways depending on the endpoint. The library reads all of them into `message` and `messages`, so you never parse `body` yourself.

## MetamobRequestError

| Property | Type | Meaning |
| --- | --- | --- |
| `method` | `string` | The method that failed |
| `cause` | `unknown` | What `fetch` threw, or the reason of the abort |

## MetamobArgumentError

| Property | Type | Meaning |
| --- | --- | --- |
| `suggestions` | `readonly string[]` | For `UNKNOWN_NAME`, the closest names that exist, best first. Empty otherwise |

## isMetamobError

```ts
function handle(error: unknown) {
  if (isMetamobError(error)) error.code; // any error of the library
  if (isMetamobError(error, "NOT_FOUND")) error.message; // one code
}
```

It is a type guard: inside the branch, `error` is a `MetamobError`.

## See also

- [Errors](/basics/errors/)
- [Troubleshooting](/help/troubleshooting/)
- [The rate limit](/basics/rate-limit/)
- [All exports](/reference/exports/)
