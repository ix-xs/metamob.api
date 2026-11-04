---
title: Environnements d'exécution
description: "Node.js 20 et plus, Bun, Deno, les plateformes edge et les navigateurs, en module ES ou en CommonJS."
---

## Ce qu'il lui faut

`fetch`, `AbortController` et `URL`, que fournissent tous les environnements d'exécution actuels. Le paquet n'a pas de dépendance, et rien n'y est propre à Node.js. Il s'importe en module ES ou en CommonJS :

```ts
import { Metamob } from "@ix-xs/metamob.api"; // modules ES
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

| Environnement | Fonctionne | Remarques |
| --- | --- | --- |
| Node.js 20 et les versions suivantes | Oui | Modules ES et CommonJS |
| Bun | Oui | |
| Deno | Oui | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Oui | Voir la remarque sur l'état ci-dessous |
| Navigateurs | Oui | Voir la remarque sur les clés ci-dessous |

## La clé API

Quand vous ne passez pas d'`apiKey`, le client lit la variable d'environnement `METAMOB_API_KEY`, là où l'environnement d'exécution en a une. Ailleurs, passez la clé.

```ts
// Cloudflare Workers : la clé est un secret du worker.
export default {
  async fetch(request: Request, env: { METAMOB_API_KEY: string }) {
    const metamob = new Metamob({ apiKey: env.METAMOB_API_KEY });
    const servers = await metamob.servers.list();
    return Response.json(servers);
  },
};
```

## Navigateurs

Tout fonctionne dans une page web, mais une clé y est lisible par quiconque ouvre la page. Deux cas ne posent pas de problème :

- Un outil que chaque joueur utilise avec sa propre clé, saisie et conservée sur son appareil.
- [`data`](/basics/embedded-data/) seul, qui ne demande aucune clé : recherche, autocomplétion, « où vit ce monstre ».

Pour tout le reste, appelez l'API depuis votre serveur.

Qu'un navigateur puisse appeler l'API depuis votre domaine dépend de la politique CORS de metamob.fr. Si un appel échoue dans une page mais fonctionne sur un serveur, c'est la raison : passez par votre serveur.

## L'état sur les plateformes serverless

Le limiteur et le cache vivent dans le client, en mémoire. Sur une plateforme qui démarre une nouvelle instance à chaque requête, chaque instance recommence à compter à zéro.

- Créez le client en dehors du gestionnaire, pour que les instances déjà démarrées le réutilisent.
- Donnez au cache un stockage qui survit à l'instance, voir [Cache](/basics/caching/#a-cache-that-outlives-the-process).
- Évitez les rafales. Quand plusieurs instances partagent une clé, l'API peut répondre 429 : le client attend le temps demandé, puis réessaie.

## Taille du bundle

Le paquet tient en un fichier par système de modules, environ 160 ko avant compression, dont plus de la moitié pour les données de référence. Avec un bundler, importer seulement `data` laisse le client de côté. `Metamob` garde les données, qui lui servent à lire les noms.

## Types

Les déclarations sont livrées avec le paquet, pour les modules ES et pour CommonJS. Elles sont résolues avec tous les réglages `moduleResolution` de TypeScript. TypeScript 5 ou une version plus récente est recommandé.

Les noms des monstres sont de grands types union, qui ne servent qu'à la complétion. Si votre éditeur ralentit, annoter une variable en `string` les évite.

## Tester votre code

Donnez au client votre propre `fetch` pour tester sans réseau :

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () =>
    Response.json({
      data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14T09:12:45Z" },
    }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```
