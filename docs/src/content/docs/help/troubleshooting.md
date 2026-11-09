---
title: Dépannage
description: "Les problèmes les plus fréquents, ce qu'ils signifient et comment les corriger."
---

## MISSING_API_KEY

Aucune clé n'est parvenue au client. Vérifiez, dans cet ordre :

- La variable d'environnement `METAMOB_API_KEY` est définie dans le processus qui exécute votre code. Node.js ne lit pas un fichier `.env` de lui-même : démarrez avec `node --env-file=.env app.mjs`, ou chargez-le avec votre framework.
- Vous avez passé `apiKey` et elle ne vaut pas `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` avec une variable mal orthographiée est la cause habituelle.
- Sur une plateforme edge, il n'y a peut-être pas de variable d'environnement : passez la clé vous-même, voir [Environnements d'exécution](/help/runtimes/#the-api-key).

## UNAUTHORIZED

L'API n'accepte pas la clé : mal copiée, ou révoquée parce qu'une nouvelle a été créée. Générez-en une sur metamob.fr, dans Paramètres > Clé API, et vérifiez-la avec `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND sur l'une de mes quêtes

L'API répond 404 pour ce qui n'est pas à vous, comme pour ce qui n'existe pas.

- Le slug appartient à une quête d'un autre compte. `quests.list()` donne les slugs de la clé utilisée.
- Vous utilisez la clé d'un autre joueur avec votre slug, ou l'inverse. Avec [`withKey()`](/basics/many-keys/), les slugs vont avec leur clé.
- Avec `users.quest()`, la quête est masquée du profil public. Son propriétaire la lit toujours avec `quests.monsters()`.

## UNKNOWN_NAME pour un nom qui existe

- Vérifiez l'orthographe à l'aide de `error.suggestions`. Les accents et la casse sont pardonnés, une lettre manquante ou en trop ne l'est pas.
- Le nom est peut-être plus récent que votre version du paquet. La bibliothèque le cherche alors dans l'API, sauf pour une sous-zone donnée seule, que l'API ne cherche que dans une zone : passez `{ zone }`, voir [Zones](/resources/zones/#subzones).
- Mettez le paquet à jour : chaque version inclut les noms du moment.

## Le mauvais monstre pour un nom partagé

Six paires de monstres, surtout des archimonstres, partagent un nom dans au moins une langue, sur deux versions du jeu. `monsters.get("Crognan le Barbare")` renvoie celui dont le modèle de quête a le plus petit identifiant. Ajoutez `{ gameVersion }`, ou utilisez l'identifiant. Les écritures dans une quête ne sont pas concernées : elles prennent le monstre de cette quête. Voir [Noms et identifiants](/basics/names-and-ids/#monsters-that-share-a-name).

## Mon script est lent

Il attend sans doute à cause de la limite de 60 requêtes par minute. L'événement `rateLimit` le confirme :

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Pour envoyer moins de requêtes : un `setMonsters()` plutôt que plusieurs `setMonster()`, `count()` plutôt que compter des pages, [`data`](/basics/embedded-data/) plutôt que les appels de référence. Voir [La limite de requêtes](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED alors que le limiteur est actif

Le client ne compte que ses propres requêtes. La clé sert sans doute aussi ailleurs : un autre processus, une autre instance du serveur, un second client dans le même programme. Partagez un seul client, ou baissez la limite de chacun avec `rateLimit: { requests: 30 }`.

## Une valeur que je viens d'écrire se relit inchangée

Les lectures liées au compte ne sont mises en cache que si vous l'avez demandé. Avec une durée pour `quests.get` ou `quests.monsters` dans `cache.methods`, une écriture faite avec le même client vide le cache, mais pas une écriture faite ailleurs, sur le site par exemple. Passez `{ cache: false }` à la lecture, ou raccourcissez la durée.

## setMonster n'a pas ajouté un exemplaire

Elle fixe la quantité, elle n'y ajoute rien. Lisez, puis écrivez :

```ts
const tofu = data.monster("Tofu Maléfique");
const monsters = await metamob.quests.monsters(slug).all();
const owned = monsters.find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT ou NETWORK

La requête n'est pas passée, même après 3 nouvelles tentatives. Vérifiez la connexion de la machine, puis que metamob.fr répond. Derrière un proxy, donnez au client un `fetch` qui l'utilise, voir [Configuration](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

L'API a échoué de son côté, et les lectures ont déjà été retentées. Si cela dure, le site est peut-être en maintenance : attendez plutôt que de boucler.

Un message ou une proposition n'est pas retenté : après un `SERVER_ERROR`, consultez la conversation ou `tradeProposals.list()` avant de le renvoyer, il est peut-être passé.

## Cela fonctionne sur mon serveur et échoue dans le navigateur

Une page ne peut appeler qu'une API qui autorise son origine. Appelez Metamob depuis votre serveur, et faites appeler votre serveur par la page : la clé reste aussi hors de la page. Voir [Environnements d'exécution](/help/runtimes/#browsers).

## require() renvoie quelque chose sans Metamob

La version 5 a des exports nommés. `const MetamobAPI = require("@ix-xs/metamob.api")` devient `const { Metamob } = require("@ix-xs/metamob.api")`. Voir [Depuis la version 4](/help/migrating-from-v4/).

## Toujours bloqué

Ouvrez une issue sur [GitHub](https://github.com/ix-xs/metamob.api/issues) avec la version du paquet, votre environnement d'exécution, `error.code` et le plus petit code qui montre le problème. Retirez votre clé API de tout ce que vous collez.
