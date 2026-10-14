---
title: Démarrage rapide
description: "Installez le paquet, obtenez votre clé API, puis lisez vos quêtes, trouvez ce qui manque encore à l'une d'elles et enregistrez un monstre que vous venez de capturer."
---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

## Installer

```bash
npm install @ix-xs/metamob.api
```

Il faut Node.js 20 ou plus récent, et le paquet n'a aucune dépendance. Pour Bun, Deno, les navigateurs et les environnements edge, voir [Environnements d'exécution](/reference/runtimes/).

Les deux systèmes de modules fonctionnent :

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Obtenir votre clé API

Chaque appel a besoin d'une clé. Créez la vôtre sur [metamob.fr](https://www.metamob.fr), dans **Paramètres > Clé API**.

Gardez la clé hors de votre code. Placez-la dans une variable d'environnement nommée `METAMOB_API_KEY` : le client la lit quand vous ne passez pas d'`apiKey`.

```ts
const metamob = new Metamob(); // utilise process.env.METAMOB_API_KEY
```

[Votre clé API](/start/api-key/) indique à quoi une clé donne accès et comment la conserver.

## Lire vos quêtes

Une quête est désignée par son slug, le court identifiant qui figure dans l'adresse de sa page. `quests.list()` donne les slugs du compte.

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Trouver ce qui manque encore à une quête

Une liste peut être attendue avec `await` pour une page, ou parcourue jusqu'au bout avec `for await`. Les pages sont récupérées au fil de la lecture.

```ts
for await (const monster of metamob.quests.monsters(slug, { status: "needed" })) {
  console.log(`step ${monster.step}: ${monster.name.fr} (${monster.quantity} owned)`);
}

// Seulement le nombre, en une seule petite requête.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

[Listes](/basics/lists/) couvre les pages, les limites et le comptage.

## Enregistrer un monstre

Un monstre se désigne par son nom en français, en anglais ou en espagnol, par son identifiant, ou par un objet qui porte son identifiant. Les accents et la casse ne comptent pas.

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
console.log(result.status); // possédés moins quêtes en parallèle : 0 signifie « assez »
```

Un nom qui contient une faute de frappe n'est pas envoyé à votre quête. L'appel lève une erreur, et celle-ci liste les noms les plus proches :

```ts
try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Noms et identifiants](/basics/names-and-ids/) explique ce qui est accepté, et [Erreurs](/basics/errors/) ce qui peut être levé.

## Chercher quelque chose sans requête

Les monstres, les zones et les serveurs sont livrés avec le paquet. `data` répond depuis la mémoire, ce dont une autocomplétion a besoin.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Tenir compte de la limite de requêtes

Metamob autorise 60 requêtes par minute et par clé. Le client les compte et fait attendre l'appel suivant au lieu d'échouer, donc vous n'avez rien à faire. [La limite de requêtes](/basics/rate-limit/) montre comment la surveiller.

## Voir aussi

- [Vos quêtes](/resources/quests/)
- [Échanges](/resources/trading/)
- [Les données du paquet](/basics/embedded-data/)
- [Depuis la version 4](/start/migrating-from-v4/)
