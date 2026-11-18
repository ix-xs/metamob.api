---
title: Account
description: "metamob.me() tells which account an API key belongs to."
sidebar:
  order: 1
---

## What comes back

`metamob.me()` returns the username, the bio, the avatar and the last activity of the account of the key, and what Metamob opened to it. Nothing private: it is what the public profile shows, without the quests.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // the avatar is a monster
  console.log(urls.monsterImage(me.avatar)); // its picture
}
```

## What the account can do

Sending messages and trade proposals is opened account by account by Metamob, on request. `features` says what is, to show or hide sending in your application without trying the call:

```ts
const { features } = await metamob.me();

if (features.trade_proposals_create) {
  // show the button that sends a proposal
}
```

| Field | `true` when this call is open |
| --- | --- |
| `messages_send` | `conversations.send()` |
| `trade_proposals_create` | `tradeProposals.create()` |

On an account where it is `false`, the call answers `FORBIDDEN`. More fields may come: ignore the ones you do not know.

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

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Account`](/reference/account/) | The account an API key belongs to. |
| [`AccountFeatures`](/reference/account-features/) | What Metamob opened to an account on request: `true` when the endpoint answers, `false` when it would answer `FORBIDDEN`. |
| [`Avatar`](/reference/avatar/) | The monster a user picked as their avatar. |
| [`UserSummary`](/reference/user-summary/) | A user as a search or a trade match returns them. |
<!-- exports:end -->
