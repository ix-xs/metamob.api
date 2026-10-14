---
title: Autres joueurs
description: Cherchez des joueurs par leur pseudo, lisez un profil public et regardez dans une quête publique ce que son propriétaire propose et recherche.
sidebar:
  order: 6
---

```ts
const profile = await metamob.users.get("Ix-xs");

for (const quest of profile.quests) {
  console.log(quest.character_name, quest.server?.name, `step ${quest.current_step}`);
}
```

## Chercher des joueurs

Une recherche porte sur une partie du pseudo, parmi les joueurs qui ont au moins une quête publique. Elle demande au moins 3 caractères et c'est une [liste](/basics/lists/), de 50 joueurs par page au plus. Seuls les joueurs vus au cours des 90 derniers jours sont cherchés, sauf si `activeWithinDays` dit autre chose, jusqu'à 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// Sur un serveur, parmi les joueurs vus au cours des 30 derniers jours.
const active = await metamob.users.search("ix-", { server: "Draconiros", activeWithinDays: 30 }).all();
```

## Lire un profil

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // l'adresse du profil sur metamob.fr
```

Les pseudos sont sensibles à la casse : `"ix-xs"` n'est pas `"Ix-xs"`. Un profil liste les quêtes publiques du joueur, sans leurs monstres.

## Quêtes publiques

`users.quests()` ajoute, pour chaque quête, le nombre de monstres qu'elle recherche et qu'elle propose.

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Les monstres d'une quête publique

`users.quest()` est une [liste](/basics/lists/) des monstres d'une quête, avec ce que son propriétaire possède, recherche et propose. Chaque page contient aussi la quête elle-même.

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Filtres :

```ts
// Ce qu'il recherche parmi les archimonstres.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Tout ce qui est à l'étape 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` et `offer` sont ce que la quête met réellement sur le marché, une fois appliqués les réglages d'échange de son propriétaire. Un joueur peut posséder des exemplaires en trop et n'en proposer aucun.

## Vos propres quêtes

Avec ces méthodes, vos quêtes apparaissent telles que les autres les voient : seulement les quêtes publiques, sans vos réglages d'échange. Pour la vue complète, et pour modifier quoi que ce soit, utilisez [`metamob.quests`](/resources/quests/).

## Limites et erreurs

- `NOT_FOUND` pour un joueur qui n'existe pas, dont le compte a été supprimé, ou pour une quête masquée.
- Une recherche de moins de 3 caractères lève `INVALID_ARGUMENT` avant qu'une requête soit dépensée.
- Rien ici n'est mis en cache par défaut. Une page de profil très visitée peut le faire : `cache: { methods: { "users.get": "1m" } }`, voir [Cache](/basics/caching/).

## Référence

| Méthode | Renvoie |
| --- | --- |
| `users.search(query, { server, activeWithinDays, limit, offset }, options?)` | une liste de `UserSummary` |
| `users.get(username, options?)` | `UserProfile` |
| `users.quests(username, options?)` | `PublicQuestSummary[]` |
| `users.quest(username, slug, { type, status, step, limit, offset }, options?)` | une liste de `QuestMonster`, avec `page.quest` |

Une quête publique :

| Champ | Signification |
| --- | --- |
| `slug` | Son identifiant |
| `character_name` | Le personnage qui fait la quête |
| `current_step` | L'étape où en est le personnage |
| `parallel_quests` | Quêtes menées en parallèle, soit le nombre d'exemplaires de chaque monstre à réunir |
| `server` | Le serveur, avec sa version du jeu |
| `quest_template` | Le type de quête, son nombre de monstres et d'étapes |
| `wanted_count`, `offered_count` | Seulement avec `users.quests()` |

Un monstre d'une quête publique est un `Monster` avec `step`, `quantity`, `want` et `offer`.

## Voir aussi

- [Échanges](/resources/trading/)
- [Vos quêtes](/resources/quests/)
- [Conversations](/resources/conversations/)
- [Compte](/resources/account/)
