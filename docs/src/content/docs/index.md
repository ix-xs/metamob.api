---
title: Installation
description: "Le client JavaScript et TypeScript de l'API Metamob : ses 43 points d'accès, typés, sans aucune dépendance."
---

```bash
npm install @ix-xs/metamob.api
```

Ou `pnpm add`, `yarn add`, `bun add`. Les types sont inclus.

| Prérequis | |
| --- | --- |
| Node.js | 20 ou plus récent |
| Modules | ES modules et CommonJS |
| Autres environnements | Bun, Deno, navigateurs, plateformes edge : voir [Environnements d'exécution](/help/runtimes/) |
| Clé API | Une clé Metamob, voir [Votre clé API](/start/api-key/) |

## Premier appel

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const quests = await metamob.quests.list();
const needed = await metamob.quests.monsters(quests[0]!.slug, { status: "needed" }).count();
```

En CommonJS :

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

Sans `apiKey`, le client lit la variable d'environnement `METAMOB_API_KEY`. [Configuration](/basics/configuration/) liste toutes ses options.

## Ce que le client prend en charge

| | |
| --- | --- |
| Les types | Chaque réponse de l'API est typée : voir la [référence](/reference/) |
| Les noms | Monstres, zones et serveurs par leur nom, en français, anglais ou espagnol : [Noms et identifiants](/basics/names-and-ids/) |
| Les listes | Pagination par décalage ou par curseur, parcourue avec `for await` : [Listes](/basics/lists/) |
| La limite de requêtes | 60 requêtes par minute et par clé, les appels en trop attendent leur tour : [La limite de requêtes](/basics/rate-limit/) |
| Les erreurs | Un `code` stable par cas, et des nouvelles tentatives pour les erreurs passagères : [Erreurs](/basics/errors/) |
| Le cache | Les données de référence en mémoire, un stockage remplaçable : [Cache](/basics/caching/) |
| Les données du jeu | Monstres, zones et serveurs inclus, consultables sans requête : [Les données du paquet](/basics/embedded-data/) |

## Metamob

Tout repose sur [Metamob](https://www.metamob.fr), le site des chasseurs d'archimonstres, et sur son API. Ce paquet ne fait que l'appeler : la [documentation officielle de l'API](https://www.metamob.fr/help/api) reste la référence.
