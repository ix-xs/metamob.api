---
title: Agir pour d'autres joueurs
description: "Un bot ou un site web travaille souvent pour des joueurs qui lui ont chacun confié leur propre clé API. Cette page montre comment utiliser ces clés avec un seul client, ce qu'elles partagent et ce qui reste séparé."
sidebar:
  order: 7
---

```ts
const theirs = metamob.withKey(theirKey);

const account = await theirs.me();
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

## À quoi cela sert

Une clé API agit en tant que son propriétaire : elle lit ses quêtes et ses messages, et écrit dans ses quêtes. Un outil qui gère les quêtes de plusieurs joueurs a donc besoin de la clé de chacun d'eux, donnée de plein gré.

C'est le seul usage de ce qui suit. Chaque clé a ses propres 60 requêtes par minute, et utiliser plusieurs clés pour envoyer plus de requêtes pour vous-même est exactement ce que la limite est là pour empêcher. Voir [La limite de requêtes](/basics/rate-limit/).

## Un client par joueur

`withKey()` renvoie un client qui utilise une autre clé. Il ne coûte presque rien à créer : faites-en un quand la demande d'un joueur arrive, et laissez-le partir ensuite.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

Le nouveau client partage, avec celui dont il vient :

- les options : délai, nouvelles tentatives, URL de base, en-têtes ;
- le cache : les données de référence récupérées pour un joueur servent à tous les autres ;
- les écouteurs : `metamob.on("retry", ...)` entend tous les clients ;
- le limiteur, qui garde une fenêtre par clé.

Il ne partage pas le compte. Ce qui dépend d'une clé est mis en cache à part pour chaque clé, donc deux joueurs ne peuvent jamais voir les quêtes l'un de l'autre.

## Une clé pour un seul appel

Pour un appel isolé, la clé se place dans les options, en dernier argument.

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Savoir à qui appartient une clé

Une clé ne dit rien de son propriétaire tant que vous ne le demandez pas. `me()` répond avec le pseudo, dont vous avez besoin pour les points d'accès publics.

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

Un service qui n'agit jamais que pour des joueurs n'a pas besoin d'une clé à lui. Créez le client sans clé et dérivez-en les autres. Assurez-vous que `METAMOB_API_KEY` n'est pas définie, sinon elle serait utilisée.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Appeler `base` directement lève alors `MISSING_API_KEY`, ce qui est le but : rien ne peut s'exécuter sans dire pour qui.

## Conserver les clés

Une clé est un mot de passe pour un compte Metamob.

- Conservez-la chiffrée, et ne l'écrivez jamais dans un journal. La bibliothèque la tient hors des URL, des erreurs et des événements.
- Demandez-la en HTTPS, dans un formulaire ou une commande privée, jamais dans un salon public.
- Supprimez-la quand le joueur part, et dites-lui qu'il peut la révoquer à tout moment sur metamob.fr, dans Paramètres > Clé API.
- Un `401` sur une clé qui fonctionnait signifie qu'elle a été révoquée : cessez de l'utiliser.

## Référence

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Un client pour cette clé, qui partage les options, le cache, les écouteurs et le limiteur |
| `{ apiKey }` en dernier argument | La clé pour un seul appel |
| `metamob.me()` | Le compte de la clé utilisée |

## Voir aussi

- [Votre clé API](/start/api-key/)
- [La limite de requêtes](/basics/rate-limit/)
- [Compte](/resources/account/)
- [Une commande Discord avec autocomplétion](/recipes/discord-command/)
