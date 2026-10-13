---
title: Votre clé API
description: "D'où vient une clé API Metamob, à quoi elle donne accès, comment la transmettre au client et comment la protéger."
---

```ts
// Lit la variable d'environnement METAMOB_API_KEY.
const metamob = new Metamob();

// Ou passez-la vous-même.
const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);
```

## Créer une clé

Connectez-vous sur [metamob.fr](https://www.metamob.fr), ouvrez **Paramètres**, puis **Clé API**. La clé est une longue suite de lettres et de chiffres. Elle appartient à votre compte, et chaque appel fait avec elle est fait en votre nom.

Une clé ne peut pas être limitée à la lecture : elle donne toujours un accès complet.

## À quoi une clé donne accès

| Avec n'importe quelle clé | Seulement avec la clé du compte |
| --- | --- |
| Monstres, zones, serveurs, modèles de quête | `metamob.me()` |
| Profils publics et quêtes publiques de n'importe quel joueur | `metamob.quests` : réglages, monstres, correspondances, progression, et toutes les écritures |
| Événements Kralamoure | `metamob.conversations` : messages privés et propositions d'échange |

Aucun appel ne se fait sans clé, même pour des données publiques.

## Donner la clé au client

Par ordre de préférence :

1. La variable d'environnement `METAMOB_API_KEY`. Rien à écrire, rien qui puisse fuiter dans un commit.
2. L'option `apiKey` du client.
3. `{ apiKey }` en dernier argument d'un appel, ou [`metamob.withKey()`](/basics/many-keys/), quand vous agissez pour un autre joueur.

```bash
# .env, tenu hors de git
METAMOB_API_KEY=your-key
```

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
```

Sans clé nulle part, le premier appel lève une erreur avec le code `MISSING_API_KEY`.

## Vérifier une clé

`metamob.me()` est le moyen le moins coûteux de savoir si une clé fonctionne et à qui elle appartient.

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key is not valid, or was revoked.");
  else throw error;
}
```

## La protéger

- Ne mettez jamais une clé dans un commit, dans un ticket ou dans un journal. La bibliothèque ne la place jamais dans une URL, une erreur ou un événement.
- Une clé dans un navigateur est visible par quiconque ouvre la page. Appelez l'API depuis votre serveur, sauf si la page n'est jamais utilisée que par le propriétaire de la clé.
- Quand des joueurs vous confient leur clé, conservez-la comme un mot de passe : chiffrée, et supprimée quand ils partent.
- Si une clé fuite, créez-en une nouvelle sur la même page de metamob.fr. L'ancienne cesse de fonctionner.

## La limite de requêtes suit la clé

Chaque clé a ses propres 60 requêtes par minute. C'est ce qui rend possible un bot pour de nombreux joueurs, chacun avec sa clé. Ce n'est pas une invitation à rassembler des clés pour aller plus vite : la limite protège un serveur tenu par une seule personne. Voir [La limite de requêtes](/basics/rate-limit/).

## Voir aussi

- [Démarrage rapide](/start/quick-start/)
- [Agir pour d'autres joueurs](/basics/many-keys/)
- [Compte](/resources/account/)
- [Erreurs](/basics/errors/)
