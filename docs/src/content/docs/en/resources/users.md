---
title: Other players
description: "Search players, read a public profile and the monsters of a public quest."
sidebar:
  order: 6
---

## Searching players

`users.search()` looks for a part of the username, from 3 characters, among the players who have at least one public quest. It is a [list](/basics/lists/) of 50 players per page at most. Only players seen in the last 90 days are searched; `activeWithinDays` changes this length, up to 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// On one server, among players seen in the last 30 days.
const filters = { server: "Draconiros", activeWithinDays: 30 };
const active = await metamob.users.search("ix-", filters).all();
```

## Reading a profile

`users.get()` returns the public profile of a player, with the list of their public quests:

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // the address of the profile on metamob.fr
```

The case of the username does not matter: `"ix-xs"` finds `"Ix-xs"`, and the answer spells it the way its owner does.

## Public quests

`users.quests()` gives the public quests of a player, with the number of monsters each one looks for and offers:

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## The monsters of a public quest

`users.quest()` is a [list](/basics/lists/) of the monsters of a quest, with what its owner owns, looks for and offers. Each page also holds the quest:

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

The same filters as for your quests apply:

```ts
// What they look for among archmonsters.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Everything at step 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` and `offer` are what the quest really looks for and offers, once the trade settings of its owner are applied. A player can have spare copies and offer none.

## Your own quests

With these methods, your quests appear the way others see them: only the public ones, without your settings. For the full view and to change them, use [`metamob.quests`](/resources/quests/).

## Limits and errors

- `NOT_FOUND` for a player who does not exist, whose account was deleted, or for a hidden quest.
- A search of fewer than 3 characters throws `INVALID_ARGUMENT` before sending.
- Nothing here is cached by default. For a profile shown often: `cache: { methods: { "users.get": "1m" } }`, see [Caching](/basics/caching/).

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Users`](/reference/users/) | Other players: their profile and their public quests. |
| [`PublicQuest`](/reference/public-quest/) | A public quest in a profile. |
| [`PublicQuestParams`](/reference/public-quest-params/) | Filters of [`Users.quest`](/reference/users/). |
| [`PublicQuestSummary`](/reference/public-quest-summary/) | A public quest in the list of a user's quests. |
| [`UserProfile`](/reference/user-profile/) | The public profile of a user. |
| [`UserSearchParams`](/reference/user-search-params/) | Filters of [`Users.search`](/reference/users/). |
<!-- exports:end -->
