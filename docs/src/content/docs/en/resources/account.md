---
title: Account
description: "metamob.me() tells which account an API key belongs to."
sidebar:
  order: 1
---

## What comes back

`metamob.me()` returns the username, the bio, the avatar and the last activity of the account of the key. Nothing private: it is what the public profile shows, without the quests.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // the avatar is a monster
  console.log(urls.monsterImage(me.avatar)); // its picture
}
```

## From a key to everything else

The public endpoints need a username, which `me()` gives:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // as others see it
console.log(`${profile.quests.length} public quests`);
```

The quests of the account, hidden ones included, are under [`metamob.quests`](/resources/quests/). The profile and the public quests of any player are under [`metamob.users`](/resources/users/).

## Validating a key

`me()` is the lightest call that requires a valid key: it is the right test when a player gives you theirs.

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

`metamob.me(options?)` returns an `Account`:

| Field | Type | Meaning |
| --- | --- | --- |
| `username` | `string` | The username of the account |
| `bio` | `string` | The text of the profile, empty when there is none |
| `avatar` | `Avatar \| null` | The monster chosen as avatar: `id`, `name`, `image` |
| `last_active` | `string` | Last activity, as an ISO 8601 date in UTC: `2026-10-14T09:12:45Z` |

| Error | When |
| --- | --- |
| `UNAUTHORIZED` | The key is invalid or was revoked |
| `MISSING_API_KEY` | No key was given anywhere |
