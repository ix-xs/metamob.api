---
title: Agir pour d'autres joueurs
description: "Utiliser les clés que des joueurs vous ont confiées, avec un seul client."
sidebar:
  order: 7
---

## À quoi cela sert

Une clé API agit au nom de son propriétaire : elle lit ses quêtes et ses messages, et écrit dans ses quêtes. Un bot ou un site qui gère les quêtes de plusieurs joueurs a donc besoin de la clé de chacun, donnée de leur plein gré.

C'est le seul usage prévu. Chaque clé a ses propres 60 requêtes par minute : se servir de plusieurs clés pour envoyer plus de requêtes pour soi revient à contourner la limite. Voir [La limite de requêtes](/basics/rate-limit/).

## Un client par joueur

`withKey()` renvoie un client qui utilise une autre clé. Il est léger : créez-en un à chaque demande d'un joueur.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

Il partage avec le client dont il vient :

- les options : délai, nouvelles tentatives, URL de base, en-têtes ;
- le cache des données de référence ;
- les écouteurs : `metamob.on("retry", ...)` entend tous les clients ;
- le limiteur, qui compte chaque clé à part.

Ce qui dépend du compte est mis en cache à part pour chaque clé : un joueur ne voit jamais les quêtes d'un autre.

## Une clé pour un seul appel

Pour un appel isolé, la clé se place dans les options, en dernier argument :

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Savoir à qui appartient une clé

`me()` donne le pseudo du propriétaire de la clé, utile pour les points d'accès publics :

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

C'est aussi le moyen de valider une clé quand un joueur la fournit :

```ts
async function register(playerKey: string) {
  try {
    const { username } = await metamob.withKey(playerKey).me();
    await db.players.save({ username, key: playerKey });
    return username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined; // pas une clé valide
    throw error;
  }
}
```

## Un client sans clé à lui

Un service qui n'agit que pour des joueurs n'a pas besoin de sa propre clé. Créez le client sans clé, puis dérivez-en un par joueur. `METAMOB_API_KEY` ne doit pas être définie, sinon elle serait utilisée.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Un appel fait directement avec `base` lève alors `MISSING_API_KEY`.

## Conserver les clés

Une clé est un mot de passe pour un compte Metamob.

- Conservez-la chiffrée, et ne l'écrivez jamais dans un journal. La bibliothèque ne la met ni dans les URL, ni dans les erreurs, ni dans les événements.
- Demandez-la en HTTPS, dans un formulaire ou une commande privée, jamais dans un salon public.
- Supprimez-la quand le joueur part, et dites-lui qu'il peut la révoquer à tout moment sur metamob.fr, dans Paramètres > Clé API.
- Un `401` sur une clé qui fonctionnait signifie qu'elle a été révoquée : cessez de l'utiliser.

## Référence

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Un client pour cette clé, qui partage les options, le cache, les écouteurs et le limiteur |
| `{ apiKey }` en dernier argument | La clé pour un seul appel |
| `metamob.me()` | Le compte de la clé utilisée |
