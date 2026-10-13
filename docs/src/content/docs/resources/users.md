---
title: Other players
description: Search players by name, read a public profile, and look into a public quest to see what its owner offers and looks for.
sidebar:
  order: 6
---

```ts
const profile = await metamob.users.get("Ix-xs");

for (const quest of profile.quests) {
  console.log(quest.character_name, quest.server?.name, `step ${quest.current_step}`);
}
```

## Searching players

A search matches a part of the username, among players who have at least one public quest. It needs 3 characters at least and is a [list](/basics/lists/), 50 players per page at most.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// On one server, among players seen in the last 30 days.
const active = await metamob.users.search("ix-", { server: "Draconiros", activeWithinDays: 30 }).all();
```

## Reading a profile

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // the address of the profile on metamob.fr
```

Usernames are case-sensitive: `"ix-xs"` is not `"Ix-xs"`. A profile lists the public quests of the player, without their monsters.

## Public quests

`users.quests()` adds, for each quest, how many monsters it looks for and offers.

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## The monsters of a public quest

`users.quest()` is a [list](/basics/lists/) of the monsters of one quest, with what its owner owns, wants and offers. Each page also carries the quest itself.

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Filters:

```ts
// What they look for among archmonsters.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Everything of step 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` and `offer` are what the quest really puts on the market, after the trade settings of its owner. A player can own spares and offer none.

## Your own quests

Through these methods your quests look the way others see them: only the public ones, without your trade settings. For the full picture, and to change anything, use [`metamob.quests`](/resources/quests/).

## Limits and errors

- `NOT_FOUND` for a player who does not exist, whose account was deleted, or for a quest that is hidden.
- A search shorter than 3 characters throws `INVALID_ARGUMENT` before a request is spent.
- Nothing here is cached by default. A profile page with many visitors can cache it: `cache: { methods: { "users.get": "1m" } }`, see [Caching](/basics/caching/).

## Reference

| Method | Returns |
| --- | --- |
| `users.search(query, { server, activeWithinDays, limit, offset }, options?)` | a list of `UserSummary` |
| `users.get(username, options?)` | `UserProfile` |
| `users.quests(username, options?)` | `PublicQuestSummary[]` |
| `users.quest(username, slug, { type, status, step, limit, offset }, options?)` | a list of `QuestMonster`, with `page.quest` |

A public quest:

| Field | Meaning |
| --- | --- |
| `slug` | Its identifier |
| `character_name` | The character doing the quest |
| `current_step` | The step the character is at |
| `parallel_quests` | Quests done in parallel, which is how many of each monster is needed |
| `server` | The server, with its version of the game |
| `quest_template` | The kind of quest, its number of monsters and of steps |
| `wanted_count`, `offered_count` | Only from `users.quests()` |

A monster of a public quest is a `Monster` with `step`, `quantity`, `want` and `offer`.

## See also

- [Trading](/resources/trading/)
- [Your quests](/resources/quests/)
- [Conversations](/resources/conversations/)
- [Account](/resources/account/)
