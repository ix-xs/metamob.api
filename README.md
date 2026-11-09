<div align="center">

# @ix-xs/metamob.api

Un client JavaScript et TypeScript pour l'API de [Metamob](https://www.metamob.fr).

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentation](https://ix-xs.github.io/metamob.api/)** ·
[English](./README.en.md) ·
[Español](./README.es.md) ·
[Journal des modifications](./CHANGELOG.md)

</div>

## Installation

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 ou plus récent. Fonctionne aussi avec Bun, Deno, dans un navigateur et sur les plateformes edge. Le paquet n'a pas de dépendance.

## Exemple

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const [quest] = await metamob.quests.list();

if (quest) {
  // Les monstres qui manquent encore à la quête.
  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  // Enregistrer un monstre, par son nom ou son identifiant.
  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
}
```

La clé API se crée sur metamob.fr, dans **Paramètres > Clé API**.

## Ce que contient le paquet

- **Les 42 points d'accès de l'API**, typés : compte, quêtes, partenaires d'échange, propositions d'échange, messages privés, monstres, zones, joueurs, événements Kralamoure et données de référence.
- **Les noms** : un monstre, une zone, un serveur ou un type de monstre se donne par son identifiant ou par son nom, en français, en anglais ou en espagnol. Un nom inconnu lève une erreur qui propose les noms les plus proches.
- **Les listes** : une méthode paginée s'attend avec `await` pour une page, ou se parcourt avec `for await`.
- **La limite de requêtes** : le client compte les 60 requêtes par minute et par clé, et fait attendre les appels suivants.
- **Les nouvelles tentatives** après un 429, une erreur du serveur ou une coupure réseau. L'envoi d'un message ou d'une proposition n'est jamais retenté.
- **Un cache** pour les données de référence, désactivable et réglable.
- **`data`** : les monstres, les zones, les serveurs et les modèles de quête inclus dans le paquet, pour chercher sans requête.
- **`withKey()`** : agir avec la clé d'un autre joueur, pour un bot ou un site qui sert plusieurs joueurs.

```ts
import { data, isMetamobError } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 5 }); // sans requête

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
}
```

## Documentation

Le guide complet est sur **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/)**, en français, [en anglais](https://ix-xs.github.io/metamob.api/en/) et [en espagnol](https://ix-xs.github.io/metamob.api/es/) :

- [Démarrage rapide](https://ix-xs.github.io/metamob.api/start/quick-start/)
- [Toutes les méthodes](https://ix-xs.github.io/metamob.api/reference/methods/)
- [Exemples](https://ix-xs.github.io/metamob.api/recipes/discord-command/) : une commande Discord, un rapport de progression, un chercheur d'échanges
- [Depuis la version 4](https://ix-xs.github.io/metamob.api/start/migrating-from-v4/)

## Metamob

[Metamob](https://www.metamob.fr) est le site où les joueurs de Dofus suivent leurs quêtes d'archimonstres et trouvent avec qui échanger. Le site, ses données et son API sont son travail : cette bibliothèque ne fait que l'appeler. La [documentation officielle de l'API](https://www.metamob.fr/help/api) reste la référence.

## Licence

[MIT](./LICENSE). Projet indépendant, non affilié à Metamob ni à Ankama. Dofus est une marque d'Ankama Games. Les données incluses dans le paquet proviennent de l'API Metamob ; utiliser l'API implique de respecter [ses règles](https://www.metamob.fr/help/api), à commencer par la limite de requêtes.
