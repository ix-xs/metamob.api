---
title: Lists
description: Every paginated method returns a request you can await for one page, iterate to the end, or collect into an array. Nothing is sent until you do one of the three.
sidebar:
  order: 2
---

```ts
const request = metamob.monsters.list({ type: "archimonstre" });

// One page.
const page = await request;

// Every item, page after page.
for await (const monster of request) {
  console.log(monster.name.fr);
}

// An array.
const everything = await request.all();
```

## One page

Awaiting a list gives its first page.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

page.items; // the monsters
page.total; // how many there are with these filters
page.limit; // 20
page.offset; // 0
page.hasNext; // whether there is more
```

A page is iterable, and `next()` fetches the following one. It resolves to `null` after the last.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

for (const monster of page) console.log(monster.name.fr);

const second = await page.next();
```

To start somewhere else, pass `offset`:

```ts
const third = await metamob.monsters.list({ limit: 20, offset: 40 });
```

## Everything

`for await` walks every item. Pages are fetched as the loop reaches them, so leaving the loop early stops the requests.

```ts
for await (const monster of metamob.quests.monsters(slug, { status: "needed" })) {
  if (monster.step > 20) break; // nothing more is fetched
  console.log(monster.name.fr);
}
```

When you give no `limit`, a walk uses the largest page the endpoint accepts: 200 for monsters and quests, 50 for users, conversations and matches. That is the fewest requests for the same data, and the rate limit counts requests.

## Arrays

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

`all()` without a limit fetches every page: on a search, give one.

## The first item, or the count

Both send a single request for a single item.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined when there is none

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Page by page

`pages()` yields whole pages, for when the page itself matters: a progress bar, a batch insert.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Pages that carry more

Three lists come with what they belong to, on every page:

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // the template the monsters belong to

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // the quest the monsters belong to

const mine = await metamob.quests.monsters(slug);
mine.slug; // the slug of the quest
```

## Messages use a cursor

The messages of a conversation are not numbered: the API pages them from the most recent backwards, with the id of the oldest message seen. The same methods work, and `total` and `count()` are `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // where the next page starts, undefined at the end

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // from the most recent to the oldest
}
```

## Lists that are not paginated

Some endpoints answer everything at once and return a plain array: `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` and the reference lists (`servers.list()` and the like).

## Reference

What a list request offers:

| Member | Result | Requests |
| --- | --- | --- |
| `await request` | `Page` | 1 |
| `for await (const item of request)` | each item | 1 per page, as reached |
| `request.all({ limit })` | `T[]` | 1 per page |
| `request.take(n)` | `T[]` of `n` items at most | 1 per page |
| `request.first()` | `T \| undefined` | 1 |
| `request.count()` | `number \| undefined` | 1 |
| `request.pages({ limit })` | each `Page` | 1 per page |

What a page holds:

| Member | Meaning |
| --- | --- |
| `items` | The items of the page |
| `total` | Items across all pages, `undefined` for messages |
| `limit`, `offset` | What the API applied |
| `nextBeforeId` | For messages, the cursor of the next page |
| `hasNext` | Whether another page exists |
| `next()` | The next page, or `null` |
| `raw` | The body the API sent |

The methods that return a list request:

| Method | Largest page |
| --- | --- |
| `monsters.list`, `monsters.search` | 200 |
| `questTemplates.monsters` | 200 |
| `quests.monsters` | 200 |
| `users.quest` | 200 |
| `users.search` | 50 |
| `quests.matches` | 50 |
| `conversations.list` | 50 |
| `conversations.messages` | 50, by cursor |

## See also

- [The rate limit](/basics/rate-limit/)
- [Your quests](/resources/quests/)
- [Conversations](/resources/conversations/)
- [Every method](/reference/methods/)
