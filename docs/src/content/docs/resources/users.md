---
title: Autres joueurs
description: "Chercher des joueurs, lire un profil public et les monstres d'une quête publique."
sidebar:
  order: 6
---

## Chercher des joueurs

`users.search()` cherche une partie du pseudo, à partir de 3 caractères, parmi les joueurs qui ont au moins une quête publique. C'est une [liste](/basics/lists/) de 50 joueurs par page au plus. Seuls les joueurs vus dans les 90 derniers jours sont cherchés ; `activeWithinDays` change cette durée, jusqu'à 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// Sur un serveur, parmi les joueurs vus dans les 30 derniers jours.
const filters = { server: "Draconiros", activeWithinDays: 30 };
const active = await metamob.users.search("ix-", filters).all();
```

## Lire un profil

`users.get()` renvoie le profil public d'un joueur, avec la liste de ses quêtes publiques :

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // l'adresse du profil sur metamob.fr
```

La casse du pseudo ne compte pas : `"ix-xs"` trouve `"Ix-xs"`, et la réponse l'écrit comme son propriétaire.

## Quêtes publiques

`users.quests()` donne les quêtes publiques d'un joueur, avec le nombre de monstres que chacune recherche et propose :

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Les monstres d'une quête publique

`users.quest()` est une [liste](/basics/lists/) des monstres d'une quête, avec ce que son propriétaire possède, recherche et propose. Chaque page contient aussi la quête :

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Les mêmes filtres que pour vos quêtes s'appliquent :

```ts
// Ce qu'il recherche parmi les archimonstres.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Tout ce qui est à l'étape 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` et `offer` sont ce que la quête recherche et propose réellement, une fois appliqués les réglages d'échange de son propriétaire. Un joueur peut avoir des exemplaires en trop sans en proposer aucun.

## Vos propres quêtes

Avec ces méthodes, vos quêtes apparaissent comme les autres les voient : seulement les publiques, sans vos réglages. Pour la vue complète et pour les modifier, utilisez [`metamob.quests`](/resources/quests/).

## Limites et erreurs

- `NOT_FOUND` pour un joueur qui n'existe pas, dont le compte a été supprimé, ou pour une quête masquée.
- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT` avant l'envoi.
- Rien ici n'est mis en cache par défaut. Pour un profil souvent affiché : `cache: { methods: { "users.get": "1m" } }`, voir [Cache](/basics/caching/).

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Users`](/reference/users/) | Les autres joueurs : leur profil et leurs quêtes publiques. |
| [`PublicQuest`](/reference/public-quest/) | Une quête publique dans un profil. |
| [`PublicQuestParams`](/reference/public-quest-params/) | Filtres de [`Users.quest`](/reference/users/). |
| [`PublicQuestSummary`](/reference/public-quest-summary/) | Une quête publique dans la liste des quêtes d'un joueur. |
| [`UserProfile`](/reference/user-profile/) | Le profil public d'un joueur. |
| [`UserSearchParams`](/reference/user-search-params/) | Filtres de [`Users.search`](/reference/users/). |
<!-- exports:end -->
