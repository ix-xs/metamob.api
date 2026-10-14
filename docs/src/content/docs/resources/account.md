---
title: Account
description: One call tells which account an API key belongs to. It is how you greet a user, validate a key they gave you, and get the username the public endpoints need.
sidebar:
  order: 1
---

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.bio);
console.log(me.last_active); // "2026-10-14T09:12:45Z"
```

## What comes back

The username, the bio, the avatar and the last activity of the account. Nothing private: it is what the public profile shows, minus the quests.

```ts
const me = await metamob.me();

if (me.avatar) {
  console.log(me.avatar.name.fr); // the avatar is a monster
  console.log(urls.monsterImage(me.avatar)); // its picture
}
```

## From a key to everything else

A key does not contain a username. `me()` gives it, and with it the public side of the account:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // as others see it
const hidden = (await metamob.quests.list()).filter((quest) => !quest.show_trades);
console.log(`${profile.quests.length} public quests, ${hidden.length} hidden`);
```

The quests of the account, hidden ones included, are under [`metamob.quests`](/resources/quests/). The profile and public quests of any player are under [`metamob.users`](/resources/users/).

## Validating a key

`me()` is the lightest call that needs a working key, which makes it the right test when a player submits theirs.

```ts
async function whose(key: string) {
  try {
    return (await metamob.withKey(key).me()).username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined;
    throw error;
  }
}
```

## Reference

`metamob.me(options?)` resolves to an `Account`:

| Field | Type | Meaning |
| --- | --- | --- |
| `username` | `string` | The name of the account |
| `bio` | `string` | The text of the profile, empty when there is none |
| `avatar` | `Avatar \| null` | The monster chosen as avatar: `id`, `name`, `image` |
| `last_active` | `string` | Last activity, as an ISO 8601 date in UTC: `2026-10-14T09:12:45Z` |

| Error | When |
| --- | --- |
| `UNAUTHORIZED` | The key is invalid or was revoked |
| `MISSING_API_KEY` | No key was given anywhere |

## See also

- [Your API key](/start/api-key/)
- [Acting for other players](/basics/many-keys/)
- [Your quests](/resources/quests/)
- [Other players](/resources/users/)
