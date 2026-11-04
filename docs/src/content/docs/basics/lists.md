---
title: Listes
description: "Une méthode paginée renvoie une requête : attendue, elle donne une page ; parcourue, chaque élément. Rien n'est envoyé avant."
sidebar:
  order: 2
---

Une méthode paginée renvoie une requête, qui se lit de trois façons :

```ts
const request = metamob.monsters.list({ type: "archimonstre" });

// Une page.
const page = await request;

// Chaque élément, page après page.
for await (const monster of request) {
  console.log(monster.name.fr);
}

// Un tableau.
const everything = await request.all();
```

## Une page

Attendre une liste avec `await` donne sa première page.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

page.items; // les monstres
page.total; // combien il y en a avec ces filtres
page.limit; // 20
page.offset; // 0
page.hasNext; // indique s'il en reste
```

Une page est itérable, et `next()` récupère la suivante. Elle renvoie `null` après la dernière.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

for (const monster of page) console.log(monster.name.fr);

const second = await page.next();
```

Pour commencer ailleurs, passez `offset` :

```ts
const third = await metamob.monsters.list({ limit: 20, offset: 40 });
```

## Tout

`for await` parcourt chaque élément. Une page n'est demandée que quand la boucle y arrive : sortir de la boucle arrête les requêtes.

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  if (monster.step > 20) break; // plus rien n'est récupéré
  console.log(monster.name.fr);
}
```

Quand vous ne donnez pas de `limit`, un parcours utilise la plus grande page que le point d'accès accepte : 200 pour les monstres et les quêtes, 50 pour les utilisateurs, les conversations et les correspondances. Cela fait moins de requêtes pour les mêmes données.

## Tableaux

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

Sans limite, `all()` récupère toutes les pages : sur une recherche, donnez-en une.

## Le premier élément, ou le nombre

Chacun n'envoie qu'une requête, d'un seul élément.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined quand il n'y en a aucune

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Page par page

`pages()` donne les pages entières, pour quand la page compte : une barre de progression, une insertion par lots.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Des pages qui portent davantage

Trois listes arrivent avec ce à quoi elles appartiennent, sur chaque page :

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // le modèle auquel appartiennent les monstres

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // la quête à laquelle appartiennent les monstres

const mine = await metamob.quests.monsters(slug);
mine.slug; // le slug de la quête
```

## Les messages et les propositions utilisent un curseur

Les messages d'une conversation et les propositions d'échange ne sont pas numérotés : l'API les pagine du plus récent vers le plus ancien, avec un curseur qu'elle fournit page après page. Les mêmes méthodes s'appliquent, mais `total` et `count()` valent `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // là où commence la page suivante, undefined à la fin

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // du plus récent au plus ancien
}
```

## Les listes qui ne sont pas paginées

Certains points d'accès répondent tout en une fois et renvoient un simple tableau : `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` et les listes de référence (`servers.list()` et les autres du même genre).

## Référence

Ce qu'offre une requête de liste :

| Membre | Résultat | Requêtes |
| --- | --- | --- |
| `await request` | `Page` | 1 |
| `for await (const item of request)` | chaque élément | 1 par page, quand la boucle y arrive |
| `request.all({ limit })` | `T[]` | 1 par page |
| `request.take(n)` | `T[]` de `n` éléments au plus | 1 par page |
| `request.first()` | `T \| undefined` | 1 |
| `request.count()` | `number \| undefined` | 1 |
| `request.pages({ limit })` | chaque `Page` | 1 par page |

Ce que contient une page :

| Membre | Signification |
| --- | --- |
| `items` | Les éléments de la page |
| `total` | Éléments sur l'ensemble des pages, `undefined` pour les messages et les propositions |
| `limit`, `offset` | Ce que l'API a appliqué |
| `nextBeforeId` | Pour les messages et les propositions, le curseur de la page suivante |
| `hasNext` | Indique si une autre page existe |
| `next()` | La page suivante, ou `null` |
| `raw` | Le corps que l'API a envoyé |

Les méthodes qui renvoient une requête de liste :

| Méthode | Plus grande page |
| --- | --- |
| `monsters.list`, `monsters.search` | 200 |
| `questTemplates.monsters` | 200 |
| `quests.monsters` | 200 |
| `users.quest` | 200 |
| `users.search` | 50 |
| `quests.matches` | 50 |
| `conversations.list` | 50 |
| `conversations.messages` | 50, par curseur |
| `tradeProposals.list` | 50, par curseur |
