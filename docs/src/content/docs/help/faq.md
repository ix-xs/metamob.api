---
title: FAQ
description: "Des réponses courtes aux questions fréquentes."
---

## Est-ce officiel ?

Non. `@ix-xs/metamob.api` est un projet open source indépendant, sous licence MIT, affilié ni à Metamob ni à Ankama. Il suit l'[API publique de Metamob](https://www.metamob.fr/help/api), et il est mis à jour quand elle change.

## Qu'est-ce que Metamob ?

[Metamob](https://www.metamob.fr) est un site gratuit où les joueurs de Dofus suivent les monstres des quêtes du Dofus Ocre et du Dokille, et se trouvent entre eux pour les échanger. Il couvre Dofus (Unity), Dofus Retro et Dofus Touch.

## Couvre-t-il toute l'API ?

Oui, les 42 points d'accès. [Toutes les méthodes](/reference/methods/) les liste, avec la méthode qui appelle chacun.

## Ai-je besoin d'une clé API ?

Pour chaque appel à l'API, oui : voir [Votre clé API](/start/api-key/). Les [données du paquet](/basics/embedded-data/) n'en demandent aucune.

## Est-ce gratuit ?

La bibliothèque l'est, et l'API aussi. L'API accepte 60 requêtes par minute et par clé, et le client reste en dessous : voir [La limite de requêtes](/basics/rate-limit/).

## Puis-je augmenter la limite de requêtes ?

Non, et ne cherchez pas à la contourner avec plusieurs clés : la limite garde le site disponible pour tout le monde. Pour faire moins de requêtes, voir [La limite de requêtes](/basics/rate-limit/#spending-fewer-requests).

## Fonctionne-t-il avec TypeScript ? Avec du JavaScript simple ?

Les deux. Il est écrit en TypeScript et inclut ses types. En JavaScript, votre éditeur affiche quand même la documentation et complète les noms des monstres.

## Modules ES ou CommonJS ?

Les deux : `import { Metamob }` et `const { Metamob } = require(...)`. Voir [Environnements d'exécution](/reference/runtimes/).

## Puis-je l'utiliser dans un navigateur ?

Oui, en faisant attention à la clé : voir [Environnements d'exécution](/reference/runtimes/#browsers). L'objet `data` seul est sans risque partout.

## Dans quelle langue sont les noms ?

En français, en anglais et en espagnol. Chaque monstre, zone et sous-zone a un `name` avec `fr`, `en` et `es`, et les trois sont acceptés partout où un nom l'est : voir [Noms et identifiants](/basics/names-and-ids/).

## Les données du paquet sont-elles à jour ?

`data.fetchedAt` donne la date à laquelle elles ont été lues dans l'API, et chaque version du paquet les actualise. Un monstre plus récent que votre version fonctionne quand même par son nom dans les appels : la bibliothèque cherche alors le nom dans l'API. Voir [Les données du paquet](/basics/embedded-data/#when-the-game-changes).

## Peut-il créer une quête, envoyer un message ou proposer un échange ?

Il peut envoyer un message et proposer un échange, une fois que Metamob a ouvert l'envoi sur votre compte : voir [Conversations](/resources/conversations/#sending-a-message) et [Propositions d'échange](/resources/trade-proposals/#making-a-proposal). Il écrit aussi dans vos quêtes : réglages, quantités et réglages manuels d'échange. Il peut aussi appliquer ou annuler une proposition. Créer une quête se fait sur le site.

## Puis-je gérer les quêtes d'autres joueurs ?

Avec leur propre clé, donnée de plein gré : voir [Agir pour d'autres joueurs](/basics/many-keys/). Sans elle, vous pouvez lire ce qu'ils ont rendu public.

## Comment ajouter 1 à une quantité ?

Lisez-la, puis fixez-la : `setMonster` fixe une quantité. L'extrait de code se trouve dans [Dépannage](/help/troubleshooting/#setmonster-did-not-add-one).

## Fait-il de nouvelles tentatives tout seul ?

Oui : limites de requêtes, erreurs du serveur sur les lectures, délais dépassés et échecs réseau, jusqu'à 3 fois avec des délais croissants. Sauf l'envoi d'un message ou d'une proposition, qui n'est jamais retenté. Voir [Erreurs](/basics/errors/#what-is-retried).

## J'utilisais la version 4. Qu'est-ce qui change ?

La façon d'appeler les méthodes, pas ce qu'elles font. [Depuis la version 4](/start/migrating-from-v4/) donne la remplaçante de chaque méthode.

## Où signaler un bug ou demander quelque chose ?

Sur [GitHub](https://github.com/ix-xs/metamob.api/issues). Pour un problème avec l'API elle-même ou avec le site, Metamob a son propre contact sur [metamob.fr](https://www.metamob.fr).
