---
title: Votre clé API
description: "Créer une clé API Metamob, la donner au client, la vérifier et la garder en sécurité."
---

## Créer une clé

Connectez-vous sur [metamob.fr](https://www.metamob.fr), ouvrez **Paramètres** puis la section **Clé API**, et générez une clé. Copiez-la tout de suite : le site ne l'affiche qu'une fois.

La clé appartient à votre compte. Chaque appel fait avec elle est fait en votre nom, et elle donne toujours un accès complet : il n'existe pas de clé en lecture seule.

## Ce qu'une clé permet

| Avec n'importe quelle clé | Seulement avec la clé du compte |
| --- | --- |
| Monstres, zones, serveurs, modèles de quête | `metamob.me()` |
| Profils et quêtes publics de n'importe quel joueur | `metamob.quests` : réglages, monstres, partenaires, progression et écritures |
| Événements Kralamoure | `metamob.conversations` et `metamob.tradeProposals`. L'envoi de messages et de propositions est ouvert compte par compte par Metamob |

L'API demande une clé pour chaque appel, même pour les données publiques.

## Donner la clé au client

Le client cherche la clé à trois endroits, du plus général au plus précis :

1. la variable d'environnement `METAMOB_API_KEY` ;
2. l'option `apiKey` du client ;
3. `{ apiKey }` en dernier argument d'un appel, ou [`metamob.withKey()`](/basics/many-keys/), pour agir avec la clé d'un autre joueur.

```bash title=".env"
METAMOB_API_KEY=your-key
```

```ts
const metamob = new Metamob(); // lit METAMOB_API_KEY

const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);

const quests = await metamob.quests.list({ apiKey: theirKey });
```

Sans clé, le premier appel lève une erreur `MISSING_API_KEY`.

## Vérifier une clé

`metamob.me()` est l'appel le plus simple pour savoir si une clé fonctionne et à qui elle appartient :

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
  console.log("This key is not valid, or was revoked.");
}
```

## La garder en sécurité

- Ne publiez jamais une clé : ni dans un commit, ni dans un ticket, ni dans un journal. La bibliothèque ne la met jamais dans une URL, une erreur ou un événement.
- Dans une page web, une clé est visible par tous ceux qui ouvrent la page. Appelez l'API depuis un serveur, sauf pour une page que seul le propriétaire de la clé utilise.
- Si des joueurs vous confient leur clé, traitez-la comme un mot de passe : chiffrée, et supprimée quand ils partent.
- Si une clé fuite, générez-en une nouvelle sur metamob.fr : l'ancienne cesse de fonctionner.

## Une limite par clé

Chaque clé a ses propres 60 requêtes par minute. Un bot peut donc agir pour plusieurs joueurs, chacun avec sa clé. Utiliser plusieurs clés pour aller plus vite n'est pas le but : la limite protège le serveur de Metamob. Voir [La limite de requêtes](/basics/rate-limit/).
