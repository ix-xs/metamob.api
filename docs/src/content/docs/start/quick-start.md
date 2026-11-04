---
title: Démarrage rapide
description: "Installer le paquet, créer un client et faire ses premiers appels : lire vos quêtes, voir ce qui leur manque et enregistrer un monstre."
---

## Installer

```bash
npm install @ix-xs/metamob.api
```

Il faut Node.js 20 ou plus récent. Le paquet n'a pas de dépendance, et s'importe avec les deux systèmes de modules :

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Créer le client

Chaque appel à l'API demande une clé. Créez la vôtre sur [metamob.fr](https://www.metamob.fr), dans **Paramètres > Clé API**, puis placez-la dans la variable d'environnement `METAMOB_API_KEY` :

```bash title=".env"
METAMOB_API_KEY=your-key
```

Le client lit cette variable quand vous ne lui passez pas de clé :

```ts title="index.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

:::note
Node.js ne lit pas les fichiers `.env` tout seul : lancez le script avec `node --env-file=.env index.js`, ou passez la clé avec `new Metamob({ apiKey })`. [Votre clé API](/start/api-key/) donne le détail.
:::

## Lire vos quêtes

Une quête est désignée par son slug, le court identifiant à la fin de l'adresse de sa page. `quests.list()` renvoie les quêtes du compte, avec leur slug :

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Voir ce qui manque à une quête

`quests.monsters()` liste les monstres d'une quête. Avec `status: "needed"`, il ne garde que ceux qui manquent encore :

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  console.log(`step ${monster.step}: ${monster.name.fr}`);
}

const left = await needed.count();
```

`for await` parcourt toutes les pages de la liste, une requête par page. `count()` ne demande que le total. [Listes](/basics/lists/) explique les autres façons de lire une liste.

## Enregistrer un monstre

`quests.setMonster()` fixe le nombre d'exemplaires que vous possédez. Le monstre peut être donné par son identifiant ou par son nom, en français, en anglais ou en espagnol :

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
```

Si le nom ne correspond à aucun monstre, l'appel lève une erreur `UNKNOWN_NAME` qui propose les noms les plus proches, et rien n'est envoyé :

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Noms et identifiants](/basics/names-and-ids/) détaille ce qui est accepté, et [Erreurs](/basics/errors/) ce qui peut être levé.

## Chercher sans requête

Les monstres, les zones et les serveurs sont inclus dans le paquet. `data` y cherche directement, sans appeler l'API :

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## La limite de requêtes

Metamob accepte 60 requêtes par minute et par clé. Le client les compte : au-delà, il fait attendre les appels suivants au lieu de les envoyer. [La limite de requêtes](/basics/rate-limit/) montre comment suivre où vous en êtes.
