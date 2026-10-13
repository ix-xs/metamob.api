---
title: Dépannage
description: "Les problèmes les plus fréquents, chacun avec ce qu'il signifie et comment le corriger. Partez du code d'erreur ou de ce que vous observez."
---

## MISSING_API_KEY

Aucune clé n'est parvenue au client. Vérifiez, dans cet ordre :

- La variable d'environnement `METAMOB_API_KEY` est définie dans le processus qui exécute votre code. Node.js ne lit pas un fichier `.env` de lui-même : démarrez avec `node --env-file=.env app.mjs`, ou chargez-le avec votre framework.
- Vous avez passé `apiKey` et elle ne vaut pas `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` avec une variable mal orthographiée est la cause habituelle.
- Sur une plateforme edge, il n'y a peut-être pas de variable d'environnement : passez la clé vous-même, voir [Environnements d'exécution](/reference/runtimes/#the-api-key).

## UNAUTHORIZED

L'API n'accepte pas la clé. Elle a été mal saisie, coupée lors de la copie, ou révoquée parce qu'une nouvelle a été créée. Créez de nouveau une clé sur metamob.fr, dans Paramètres > Clé API, et vérifiez-la avec `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND sur l'une de mes quêtes

L'API répond 404 pour ce qui n'est pas à vous, exactement comme pour ce qui n'existe pas.

- Le slug appartient à une quête d'un autre compte. `quests.list()` donne les slugs de la clé utilisée.
- Vous utilisez la clé d'un autre joueur avec votre slug, ou l'inverse. Avec [`withKey()`](/basics/many-keys/), les slugs vont avec leur clé.
- Avec `users.quest()`, la quête est masquée du profil public. Son propriétaire la lit toujours avec `quests.monsters()`.

## UNKNOWN_NAME pour un nom qui existe

- Vérifiez l'orthographe à l'aide de `error.suggestions`. Les accents et la casse sont pardonnés, une lettre manquante ou en trop ne l'est pas.
- Le monstre est peut-être plus récent que votre version du paquet. La bibliothèque interroge alors l'API, ce qui fonctionne pour tout sauf une sous-zone donnée seule : l'API ne cherche une sous-zone qu'à l'intérieur d'une zone. Passez `{ zone }`, voir [Zones](/resources/zones/#subzones).
- Mettez le paquet à jour : chaque version livre les noms actuels.

## Le mauvais monstre pour un nom partagé

Dix archimonstres portent le même nom dans deux versions du jeu. `monsters.get("Crognan le Barbare")` renvoie celui dont le modèle de quête a le plus petit identifiant. Ajoutez `{ gameVersion }`, ou utilisez l'identifiant. Les écritures dans une quête ne sont pas concernées : elles prennent le monstre de cette quête. Voir [Noms et identifiants](/basics/names-and-ids/#monsters-that-share-a-name).

## Mon script est lent

Il attend à cause de la limite de requêtes : 60 requêtes par minute. Écoutez l'événement `rateLimit` pour le confirmer.

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Dépensez ensuite moins de requêtes : un seul `setMonsters()` au lieu de nombreux `setMonster()`, `count()` au lieu de compter des pages, [`data`](/basics/embedded-data/) au lieu des appels de référence. Voir [La limite de requêtes](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED alors que le limiteur est actif

Le limiteur compte ce que ce client envoie. La clé est aussi utilisée ailleurs : un autre processus, une autre instance de votre serveur, un second client créé dans le même programme. Créez un seul client et partagez-le, ou abaissez la limite de chacun avec `rateLimit: { requests: 30 }`.

## Une valeur que je viens d'écrire se relit inchangée

Les lectures liées au compte ne sont pas mises en cache, sauf si vous l'avez demandé. Si vous avez donné une durée de fraîcheur à `quests.get` ou à `quests.monsters` dans `cache.methods`, une écriture faite avec le même client l'efface, mais pas une écriture faite ailleurs, sur le site par exemple. Passez `{ cache: false }` à la lecture, ou raccourcissez la durée de fraîcheur.

## setMonster n'a pas ajouté un exemplaire

Elle fixe la quantité, elle n'y ajoute rien. Lisez, puis écrivez :

```ts
const tofu = data.monster("Tofu Maléfique");
const owned = (await metamob.quests.monsters(slug).all()).find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT ou NETWORK

La requête n'est pas passée, après 3 nouvelles tentatives. Vérifiez la connexion de la machine, puis si metamob.fr lui-même répond. Derrière un proxy, donnez au client un `fetch` qui l'utilise, voir [Configuration](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

L'API a échoué de son côté. Les lectures ont été retentées. Si cela dure, le site est peut-être en maintenance : attendez plutôt que de boucler.

## Cela fonctionne sur mon serveur et échoue dans le navigateur

Une page ne peut appeler qu'une API qui autorise son origine. Appelez Metamob depuis votre serveur et faites dialoguer la page avec votre serveur. Cela garde aussi la clé hors de la page. Voir [Environnements d'exécution](/reference/runtimes/#browsers).

## require() renvoie quelque chose sans Metamob

La version 5 a des exports nommés. `const MetamobAPI = require("@ix-xs/metamob.api")` devient `const { Metamob } = require("@ix-xs/metamob.api")`. Voir [Depuis la version 4](/start/migrating-from-v4/).

## Toujours bloqué

Ouvrez une issue sur [GitHub](https://github.com/ix-xs/metamob.api/issues) avec la version du paquet, votre environnement d'exécution, `error.code` et le plus petit code qui montre le problème. Retirez votre clé API de tout ce que vous collez.

## Voir aussi

- [Codes d'erreur](/reference/errors/)
- [Erreurs](/basics/errors/)
- [FAQ](/help/faq/)
- [Environnements d'exécution](/reference/runtimes/)
