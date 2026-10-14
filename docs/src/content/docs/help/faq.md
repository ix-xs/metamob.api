---
title: FAQ
description: Des réponses courtes aux questions qui se posent avant et après l'installation de la bibliothèque, chacune avec un lien vers la page qui traite le sujet.
---

## Est-ce officiel ?

Non. `@ix-xs/metamob.api` est un projet open source indépendant, sous licence MIT. Il n'est affilié ni à Metamob ni à Ankama. Il suit l'[API publique de Metamob](https://www.metamob.fr/help/api) et est mis à jour quand l'API change.

## Qu'est-ce que Metamob ?

[Metamob](https://www.metamob.fr) est un site gratuit où les joueurs de Dofus suivent les monstres des quêtes du Dofus Ocre et du Dokille, et se trouvent entre eux pour les échanger. Il couvre Dofus (Unity), Dofus Retro et Dofus Touch.

## Couvre-t-il toute l'API ?

Oui, les 35 points d'accès. [Toutes les méthodes](/reference/methods/) les liste, avec la méthode qui appelle chacun.

## Ai-je besoin d'une clé API ?

Pour chaque appel à l'API, oui : voir [Votre clé API](/start/api-key/). Les [données du paquet](/basics/embedded-data/) n'en demandent aucune.

## Est-ce gratuit ?

La bibliothèque l'est, et l'API aussi. L'API est limitée à 60 requêtes par minute et par clé, ce que le client respecte pour vous : voir [La limite de requêtes](/basics/rate-limit/).

## Puis-je augmenter la limite de requêtes ?

Non, et merci de ne pas chercher à la contourner avec plusieurs clés. Metamob est tenu par une seule personne, et la limite garde le site disponible pour tout le monde. La bibliothèque vous aide plutôt à avoir besoin de moins de requêtes : des pages plus grandes, un cache, des lots, et des données de référence lues dans le paquet.

## Fonctionne-t-il avec TypeScript ? Avec du JavaScript simple ?

Les deux. Il est écrit en TypeScript et livre ses types. En JavaScript, votre éditeur affiche quand même la documentation et complète les noms des monstres.

## Modules ES ou CommonJS ?

Les deux : `import { Metamob }` et `const { Metamob } = require(...)`. Voir [Environnements d'exécution](/reference/runtimes/).

## Puis-je l'utiliser dans un navigateur ?

Oui, en faisant attention à la clé : voir [Environnements d'exécution](/reference/runtimes/#browsers). L'objet `data` seul est sans risque partout.

## Dans quelle langue sont les noms ?

En français, en anglais et en espagnol. Chaque monstre, zone et sous-zone a un `name` avec `fr`, `en` et `es`, et les trois sont acceptés partout où vous écrivez un nom : voir [Noms et identifiants](/basics/names-and-ids/).

## Les données du paquet sont-elles à jour ?

`data.fetchedAt` indique quand elles ont été lues depuis l'API. Chaque version du paquet les actualise. Un monstre plus récent que votre version fonctionne quand même par son nom dans les appels, car la bibliothèque interroge l'API quand un nom est inconnu : voir [Les données du paquet](/basics/embedded-data/#when-the-game-changes).

## Peut-il créer une quête, envoyer un message ou proposer un échange ?

Non : l'API ne le permet pas. Par l'API, vous lisez presque tout, et vous écrivez dans vos propres quêtes : réglages, quantités et réglages manuels d'échange. Le reste se fait sur le site.

## Puis-je gérer les quêtes d'autres joueurs ?

Avec leur propre clé, donnée de plein gré : voir [Agir pour d'autres joueurs](/basics/many-keys/). Sans elle, vous pouvez lire ce qu'ils ont rendu public.

## Comment ajouter 1 à une quantité ?

Lisez-la, puis fixez-la : `setMonster` fixe une quantité. L'extrait de code se trouve dans [Dépannage](/help/troubleshooting/#setmonster-did-not-add-one).

## Fait-il de nouvelles tentatives tout seul ?

Oui : limites de requêtes, erreurs du serveur sur les lectures, délais dépassés et échecs réseau, jusqu'à 3 fois avec des délais croissants. Voir [Erreurs](/basics/errors/#what-is-retried).

## J'utilisais la version 4. Qu'est-ce qui change ?

La façon d'appeler les choses, pas ce qu'elles font. [Depuis la version 4](/start/migrating-from-v4/) donne la correspondance de chaque méthode.

## Où signaler un bug ou demander quelque chose ?

Sur [GitHub](https://github.com/ix-xs/metamob.api/issues). Pour un problème avec l'API elle-même ou avec le site, Metamob a son propre contact sur [metamob.fr](https://www.metamob.fr).

## Voir aussi

- [Démarrage rapide](/start/quick-start/)
- [Dépannage](/help/troubleshooting/)
- [Toutes les méthodes](/reference/methods/)
- [Le journal des modifications](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
