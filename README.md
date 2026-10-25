<div align="center">

# @ix-xs/metamob.api

**Toute l'API Metamob, avec chaque monstre appelé par son nom.**

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI&logo=github)](https://github.com/ix-xs/metamob.api/actions)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/@ix-xs/metamob.api?activeTab=dependencies)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![types](https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white)](#des-noms-à-la-place-des-identifiants)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentation](https://ix-xs.github.io/metamob.api/)** ·
[English](./README.en.md) ·
[Español](./README.es.md) ·
[Démarrage rapide](https://ix-xs.github.io/metamob.api/start/quick-start/) ·
[Toutes les méthodes](https://ix-xs.github.io/metamob.api/reference/methods/) ·
[Journal des modifications](./CHANGELOG.md)

</div>

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 ou plus récent, Bun, Deno, les navigateurs et les environnements edge. Aucune dépendance : le paquet repose sur `fetch`.

---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

// À qui appartient la clé, et ses quêtes.
const me = await metamob.me();
const [quest] = await metamob.quests.list();

// Un monstre par son nom, en français, en anglais ou en espagnol. Les accents et la casse ne comptent pas.
const tofu = await metamob.monsters.get("Tofu Maléfique");
console.log(tofu.level_min, tofu.zones.map((zone) => zone.name.fr));

// Ce qui manque encore à la quête. Les pages sont récupérées au fil de la lecture.
for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
  console.log(monster.step, monster.name.fr);
}

// Un archimonstre de plus dans la quête.
await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
```

La bibliothèque couvre les 38 points d'accès de l'[API Metamob](https://www.metamob.fr/help/api) : compte, quêtes, monstres, zones, partenaires d'échange, événements Kralamoure, messages privés, propositions d'échange et toutes les données de référence, pour Dofus, Dofus Retro et Dofus Touch.

> **[Metamob](https://www.metamob.fr)** est le site où les joueurs de Dofus suivent leurs quêtes d'archimonstres et trouvent avec qui échanger. Il est gratuit et tenu par une seule personne. Cette bibliothèque ne fait qu'appeler [son API](https://www.metamob.fr/help/api) : rien de tout cela n'existerait sans lui.

## Ce que la bibliothèque fait pour vous

| L'API telle qu'elle est | Avec cette bibliothèque |
| --- | --- |
| Tout est désigné par un identifiant numérique | **Écrivez le nom.** `"Tofu Maléfique"`, `"evil tofu"` ou `21` : monstres, zones, sous-zones, serveurs et types de monstres, en trois langues |
| Une faute de frappe donne un 404, quand ce n'est pas une écriture sur le mauvais monstre | **Détectée avant que l'appel ne parte**, avec les noms les plus proches : `Did you mean "Tofu Maléfique"?` |
| Des boucles sur `limit` et `offset` partout | **`for await`** sur n'importe quelle liste, ou `.all()`, `.take(n)`, `.count()`, ou une seule page avec `await` |
| 60 requêtes par minute, puis un 429 | **Un limiteur intégré** qui fait attendre leur tour aux appels, clé par clé, au lieu d'échouer |
| 200 monstres au plus par lot | **Passez-en mille.** Ils sont découpés, envoyés dans l'ordre puis réassemblés |
| Une sous-zone exige l'identifiant de sa zone | **`zones.subzone("Coin des Bouftous")`** : la zone est trouvée pour vous |
| Les données de référence coûtent des requêtes | **`data`** : plus de 800 monstres, les zones, les serveurs et les modèles de quête, dans le paquet, servis depuis la mémoire |
| Les mêmes listes sont récupérées encore et encore | **Un cache** pour ce qui ne change que lorsque le jeu change, et les appels identiques en cours partagent une seule requête |
| Les erreurs sont un code de statut et trois formes de corps | **`error.code`**, typé, plus `isNotFound`, `isRateLimited`, `isUnauthorized` |
| Un bot sert de nombreux joueurs, chacun avec sa clé | **`metamob.withKey(theirKey)`** : le même client, leur compte, leur propre fenêtre de limite de requêtes |

## Des noms à la place des identifiants

Partout où l'API attend un identifiant, vous pouvez passer l'identifiant, le nom, ou un objet qui porte l'identifiant. Votre éditeur complète les noms.

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique");  // les accents et la casse ne comptent pas
await metamob.monsters.get("Evil Tofu");       // l'anglais et l'espagnol fonctionnent aussi

await metamob.monsters.list({ type: "archimonstre" });
await metamob.kralove.list({ server: "Draconiros" });
await metamob.zones.monsters("Coin des Bouftous");
await metamob.quests.zones(slug, { zone: "Amakna", type: "boss" });
```

Un nom qui n'existe pas n'atteint jamais une quête :

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
  }
}
```

Dix archimonstres portent le même nom dans deux versions du jeu. Quand vous écrivez dans une quête, c'est la quête qui indique lequel est visé ; ailleurs, ajoutez `{ gameVersion }`.

## Listes

Chaque méthode paginée renvoie une requête que vous pouvez attendre avec `await` ou parcourir avec `for await`.

```ts
// Une page.
const page = await metamob.monsters.list({ type: "boss", limit: 20 });
page.items, page.total, page.hasNext;

// Tout, au fil de la lecture. La plus grande taille de page est utilisée, ce qui coûte le moins de requêtes.
for await (const monster of metamob.monsters.list({ type: "archimonstre" })) { /* ... */ }

// Un tableau, borné ou non.
const first100 = await metamob.users.search("ix-").take(100);
const wanted = await metamob.users.quest("Ix-xs", "21b0a742", { status: "wanted" }).all();

// Seulement le nombre, en une seule petite requête.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

Les messages privés et les propositions d'échange sont paginés avec un curseur au lieu d'un décalage. Les mêmes méthodes fonctionnent :

```ts
for await (const item of metamob.conversations.messages("Ix-xs")) {
  if (item.kind === "message") console.log(item.sender, item.content);
  else console.log(item.sender, "proposed a trade:", item.status);
}

// Les propositions d'échange qui attendent votre réponse.
const waiting = await metamob.tradeProposals.list({ direction: "received", status: "pending" }).all();
```

## Vos quêtes

```ts
const quest = await metamob.quests.get(slug);
quest.current_step, quest.parallel_quests, quest.trade_mode;

// Réglages. N'envoyez que ce qui change.
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { never_offer_arch: true });

// Quantités, une par une ou en lot.
await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Combien d'exemplaires d'un monstre la quête propose et recherche, à la place du calcul automatique.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });
await metamob.quests.resetTrade(slug, "Tofu Maléfique");

// Progression par zone, les sous-zones les moins avancées d'abord.
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(zone.name.fr, `${zone.completed}/${zone.total}`);
}
```

## Partenaires d'échange

```ts
const { items } = await metamob.quests.matches(slug, { onlyPossibleTrades: true });

for (const match of items) {
  const gives = match.matches.they_have_you_want.map((monster) => monster.name.fr);
  const takes = match.matches.you_have_they_want.map((monster) => monster.name.fr);
  console.log(match.user.username, { gives, takes });
}
```

Les quêtes publiques de n'importe quel joueur peuvent aussi être lues, avec ce qu'il recherche et ce qu'il propose :

```ts
const profile = await metamob.users.get("Ix-xs");
const page = await metamob.users.quest("Ix-xs", profile.quests[0].slug, { status: "offered" });
page.quest.server?.name, page.items;
```

## Les données du paquet

Les monstres, les zones, les sous-zones, les serveurs et les modèles de quête sont livrés avec le paquet. Les lire n'envoie rien et ne compte pas dans la limite de requêtes.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("Tofu Maléfique");                      // le monstre, ou undefined
data.searchMonsters("bouf", { type: "archimonstre" }); // autocomplétion pour une commande Discord
data.zonesOf("Tofu Maléfique");                      // où il vit
data.archmonstersOf("Tofu");                         // ses versions rares
data.monstersInSubzone("Coin des Bouftous");
data.server("Draconiros")?.game_version?.name;       // "Dofus (Unity)"
data.suggest("monster", "Tofu Malefik");             // ["Tofu Maléfique"]
data.fetchedAt;                                      // le jour où les données ont été lues depuis l'API
```

Un monstre ajouté au jeu après la publication du paquet fonctionne quand même par son nom : quand un nom n'est pas dans le paquet, l'API est interrogée avant d'abandonner.

## Limite de requêtes, nouvelles tentatives et cache

Metamob autorise 60 requêtes par minute et par clé. Le client les compte et fait attendre celles qui dépassent, donc une boucle sur quelques centaines de monstres ralentit au lieu d'échouer.

```ts
metamob.rateLimit; // { limit: 60, remaining: 41, resetsIn: 38211 }

metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
metamob.on("retry", ({ method, attempt, error }) => console.warn(method, attempt, error.message));
```

Un 429, une erreur du serveur ou une panne réseau donne lieu à une nouvelle tentative, avec un délai exponentiel et en respectant `Retry-After`. Chaque écriture de cette API fixe une valeur, donc en rejouer une ne change rien.

Les données de référence sont gardées en cache pendant 10 minutes. Ce qui est lié à un compte ne l'est pas, sauf si vous le demandez :

```ts
const metamob = new Metamob({
  apiKey,
  timeout: "10s",
  retry: { attempts: 5 },
  cache: { ttl: "1h", methods: { "users.get": "30s", "kralove.list": "1m" } },
});
```

## Plusieurs joueurs, plusieurs clés

Un bot ou un site web agit pour des joueurs qui lui ont chacun confié leur clé. `withKey` donne un client pour l'un d'eux. Ce client partage les réglages, le cache et les écouteurs du client dont il est issu, et chaque clé garde sa propre fenêtre de 60 requêtes par minute.

```ts
const theirs = metamob.withKey(player.apiKey);

const account = await theirs.me(); // une clé dit à qui elle appartient
await theirs.quests.setMonster(slug, "Tofu Maléfique", 1);
```

Un appel isolé peut aussi apporter sa clé : `metamob.quests.list({ apiKey })`.

Cela existe pour agir au nom de joueurs qui l'ont accepté. Ce n'est pas un moyen de contourner la limite de requêtes, qui est là pour protéger un serveur tenu par une seule personne.

## Erreurs

```ts
import { MetamobApiError, isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.users.get("nobody-by-that-name");
} catch (error) {
  if (error instanceof MetamobApiError && error.isNotFound) {
    // ce joueur n'existe pas
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // la clé a été révoquée
  } else {
    throw error;
  }
}
```

Chaque erreur étend `MetamobError` et porte un `code` : `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMITED`, `BAD_REQUEST`, `SERVER_ERROR`, `TIMEOUT`, `NETWORK`, `UNKNOWN_NAME`, `INVALID_ARGUMENT`, `MISSING_API_KEY` et quelques autres.

## Des détails qui font gagner du temps

```ts
import { urls } from "@ix-xs/metamob.api";

urls.monsterImage(tofu);    // "https://www.metamob.fr/img/monsters/..."
urls.profile("Ix-xs");      // "https://www.metamob.fr/profile/Ix-xs"

tofu.name.fr, tofu.name.en, tofu.name.es;            // chaque nom existe en trois langues
await metamob.kralove.list({ from: new Date() });    // une Date ou "YYYY-MM-DD"
await metamob.monsters.get("Tofu", {}, { signal });  // chaque appel accepte un AbortSignal
```

## Depuis la version 4

La version 5 est une réécriture en TypeScript. Les mêmes points d'accès, une façon plus courte de les appeler :

| 4.x | 5.x |
| --- | --- |
| `const MetamobAPI = require("@ix-xs/metamob.api")` | `const { Metamob } = require("@ix-xs/metamob.api")`, ou `import { Metamob }` |
| `new MetamobAPI({ api_key })` | `new Metamob({ apiKey })` |
| `{ ok, status, statusText, data }` | les données, ou une `MetamobApiError` levée |
| `getMonsters({ idOrName })`, `getMonsters({ ... })` | `monsters.get(ref)`, `monsters.list({ ... })` |
| `getUserQuests(username, { slug })` | `users.quest(username, slug)` |
| `getMyQuests()`, `getQuestMonsters(slug)` | `quests.list()`, `quests.monsters(slug)` |
| `updateQuestMonster(slug, idOrName, quantity)` | `quests.setMonster(slug, ref, quantity)` |
| `{ api_key }` dans les options d'un appel | `{ apiKey }` en dernier argument, ou `metamob.withKey(apiKey)` |
| `client.cache` | `data` |
| `@ix-xs/node-comfort` installé avec le paquet | aucune dépendance |

La page [Depuis la version 4](https://ix-xs.github.io/metamob.api/start/migrating-from-v4/) liste toutes les méthodes.

## Documentation

Tout se trouve sur **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/)**, en français, [en anglais](https://ix-xs.github.io/metamob.api/en/) et [en espagnol](https://ix-xs.github.io/metamob.api/es/) : des guides, une page par ressource, des recettes et la liste de toutes les méthodes. La même documentation est dans votre éditeur : chaque méthode, chaque paramètre et chaque champ porte sa description et un exemple.

## Licence

[MIT](./LICENSE). Sans lien avec Metamob ni Ankama. Dofus est une marque d'Ankama Games. Les données incluses dans le paquet proviennent de l'API Metamob ; utiliser l'API implique de respecter [ses règles](https://www.metamob.fr/help/api), la limite de requêtes en premier lieu.
